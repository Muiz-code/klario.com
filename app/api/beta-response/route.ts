import { NextResponse } from "next/server";
import { validateEmail, clean, splitName } from "@/lib/email/validation";
import { isDisposableEmail } from "@/lib/email/disposable";
import { upsertSignup } from "@/lib/db/signups";
import {
  upsertBetaResponse,
  markConfirmationSent,
  countRecentByIp,
} from "@/lib/db/betaResponses";
import { renderBetaConfirmation } from "@/lib/email/betaResponse";
import { sendTransactional } from "@/lib/email/send";
import { RESEND_REPLY_TO } from "@/lib/email/client";

export const runtime = "nodejs";
export const maxDuration = 30;

// Soft rate limit: this many submissions from one IP in the window is treated
// as abuse. Generous enough for shared office/family IPs.
const IP_WINDOW_MIN = 15;
const IP_MAX = 12;

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || null;
}

function cleanArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const out = value
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(out)].slice(0, max);
}

/**
 * Public beta questionnaire submission. Validates server-side, upserts by email,
 * and sends the confirmation email. The email never blocks success: if Resend
 * fails we still save and return the ref, leaving confirmation_sent = false for
 * a later retry.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = validateEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }

  // Reject obvious throwaway addresses (referral fraud).
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "Please use a permanent email address so we can let you in." },
      { status: 400 }
    );
  }

  // Per-IP velocity limit.
  const ip = clientIp(req);
  if (ip && (await countRecentByIp(ip, IP_WINDOW_MIN)) >= IP_MAX) {
    return NextResponse.json(
      { error: "Too many sign-ups from this network. Please try again later." },
      { status: 429 }
    );
  }

  // Single-selects + free text.
  const method = clean(body.method, 80);
  const sheetlife = clean(body.sheetlife, 80);
  const price = clean(body.price, 80);
  const name = clean(body.name, 80) ?? null;
  const phone = clean(body.phone, 40) ?? null;
  const dream = clean(body.dream, 2000) ?? null;
  const referredByRef = clean(body.referral, 20) ?? null;

  // Multi-selects (capped) + 1–5 scale.
  const pain = cleanArray(body.pain, 2);
  const features = cleanArray(body.features, 3);
  const trustRaw =
    typeof body.trust === "number" ? body.trust : Number(body.trust);
  const trust =
    Number.isInteger(trustRaw) && trustRaw >= 1 && trustRaw <= 5
      ? trustRaw
      : null;

  // Required: every single-select, multi-select, and the scale.
  const missing: string[] = [];
  if (!method) missing.push("method");
  if (!sheetlife) missing.push("sheetlife");
  if (!price) missing.push("price");
  if (trust === null) missing.push("trust");
  if (pain.length === 0) missing.push("pain");
  if (features.length === 0) missing.push("features");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Please answer all required questions.", missing },
      { status: 400 }
    );
  }

  const userAgent = (req.headers.get("user-agent") || "").slice(0, 500) || null;
  const referrer =
    (clean(body.referrer, 500) || req.headers.get("referer") || "").slice(
      0,
      500
    ) || null;

  const row = await upsertBetaResponse({
    name,
    email,
    phone,
    method,
    pain,
    sheetlife,
    trust,
    features,
    price,
    dream,
    user_agent: userAgent,
    referrer,
    referredByRef,
    ip,
  });

  if (!row || !row.ref) {
    return NextResponse.json(
      { error: "Could not save your response. Please try again." },
      { status: 502 }
    );
  }

  // Add them to the audience list too (name + email + date), so they show up as
  // a subscriber to be mailed. New = "unmailed" until a send goes out.
  const { firstName, lastName } = splitName(name ?? undefined);
  await upsertSignup({
    email,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    source: "beta",
    phone: phone ?? undefined,
  });

  // Confirmation email — non-blocking for the user's success screen.
  try {
    const result = await sendTransactional({
      to: email,
      email: renderBetaConfirmation({ name: row.name, ref: row.ref, email }),
      replyTo: RESEND_REPLY_TO,
      tags: [{ name: "type", value: "beta_response" }],
    });
    if (result.ok) {
      await markConfirmationSent(row.id, true);
    } else {
      console.error("[/api/beta-response] confirmation send failed:", result.error);
    }
  } catch (e) {
    console.error("[/api/beta-response] confirmation threw:", e);
  }

  return NextResponse.json({ ok: true, ref: row.ref });
}

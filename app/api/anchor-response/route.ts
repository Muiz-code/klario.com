import { NextResponse } from "next/server";
import { validateEmail, clean, splitName } from "@/lib/email/validation";
import { isDisposableEmail } from "@/lib/email/disposable";
import { upsertSignup } from "@/lib/db/signups";
import {
  upsertAnchorResponse,
  getAnchorResponseByEmail,
  markAnchorConfirmationSent,
} from "@/lib/db/anchorClub";
import { renderAnchorConfirmation } from "@/lib/email/anchorConfirmation";
import { sendTransactional } from "@/lib/email/send";
import { RESEND_REPLY_TO } from "@/lib/email/client";

export const runtime = "nodejs";
export const maxDuration = 30;

function cleanArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const out = value
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(out)].slice(0, max);
}

// Free-text "other" per question. Only known keys, trimmed and length-capped.
const NOTE_KEYS = ["level", "area", "challenge"];
function cleanNotes(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const src = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const k of NOTE_KEYS) {
    const v = src[k];
    if (typeof v === "string") {
      const s = v.trim().slice(0, 500);
      if (s) out[k] = s;
    }
  }
  return out;
}

/**
 * Public Anchor Club registration. Validates server-side, upserts by email, and
 * adds the person to the audience list. Mirrors the beta submission flow but
 * without referrals/fraud scoring.
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
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "Please use a permanent email address so we can reach you." },
      { status: 400 }
    );
  }

  // Already registered? Keep their original spot and ref.
  const prior = await getAnchorResponseByEmail(email);
  if (prior && prior.ref) {
    return NextResponse.json({ ok: true, ref: prior.ref, alreadyFilled: true });
  }

  const name = clean(body.name, 80) ?? null;
  const phone = clean(body.phone, 40) ?? null;
  const institution = clean(body.institution, 160) ?? null;
  const level = clean(body.level, 60) ?? null;
  const area = clean(body.area, 80) ?? null;
  const why = clean(body.why, 2000) ?? null;
  const challenge = clean(body.challenge, 120) ?? null;
  const notes = cleanNotes(body.notes);
  const excites = cleanArray(body.excites, 8);
  const pledge = body.pledge === true;
  const guidelines = body.guidelines === true;

  // Required fields.
  const missing: string[] = [];
  if (!name) missing.push("name");
  if (!phone) missing.push("phone");
  if (!institution) missing.push("institution");
  if (!level && !notes.level) missing.push("level");
  if (!area && !notes.area) missing.push("area");
  if (!why) missing.push("why");
  if (excites.length === 0) missing.push("excites");
  if (!challenge && !notes.challenge) missing.push("challenge");
  if (!pledge) missing.push("pledge");
  if (!guidelines) missing.push("guidelines");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Please answer all required questions.", missing },
      { status: 400 }
    );
  }

  const userAgent = (req.headers.get("user-agent") || "").slice(0, 500) || null;
  const referrer =
    (clean(body.referrer, 500) || req.headers.get("referer") || "").slice(0, 500) ||
    null;

  const row = await upsertAnchorResponse({
    name,
    email,
    phone,
    institution,
    level,
    area,
    why,
    excites,
    challenge,
    notes,
    pledge,
    guidelines,
    user_agent: userAgent,
    referrer,
  });

  if (!row || !row.ref) {
    return NextResponse.json(
      { error: "Could not save your registration. Please try again." },
      { status: 502 }
    );
  }

  // Add them to the audience list (name + email + phone), source "anchor-club",
  // so they appear as a subscriber that can be mailed.
  const { firstName, lastName } = splitName(name ?? undefined);
  await upsertSignup(
    {
      email,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      source: "anchor-club",
      phone: phone ?? undefined,
    },
    { touch: true }
  );

  // Confirmation email (best-effort; never blocks a successful registration).
  try {
    const confirmation = renderAnchorConfirmation({
      name,
      ref: row.ref,
      email: row.email,
    });
    const result = await sendTransactional({
      to: row.email,
      email: confirmation,
      replyTo: RESEND_REPLY_TO,
      tags: [{ name: "type", value: "anchor_confirmation" }],
    });
    if (result.ok) {
      await markAnchorConfirmationSent(row.id, true);
    } else {
      console.error("[/api/anchor-response] confirmation send failed:", result.error);
    }
  } catch (e) {
    console.error("[/api/anchor-response] confirmation threw:", e);
  }

  return NextResponse.json({ ok: true, ref: row.ref });
}

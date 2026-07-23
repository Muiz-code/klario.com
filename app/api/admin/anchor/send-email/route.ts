import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { sendBatch, type BatchMessage } from "@/lib/email/batch";
import { buildEmailHtml } from "@/lib/email/compose-html";
import { buttonsText, type EmailButton } from "@/lib/email/linkButtons";
import { logEmails } from "@/lib/db/email-log";
import { createAuditEvent } from "@/lib/db/audit";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\//i;
const REF_RE = /^KAC-[A-Z0-9-]+$/i;

type Recipient = { email: string; ref: string };

/**
 * Send a one-off, editable email to hand-picked Anchor Club applicants.
 * Admin-only. body:
 *   { recipients: {email, ref}[], subject, heading?, body,
 *     buttons?: {label,url,variant}[], includeCardLink?: boolean }
 * The body is wrapped in the Klario brand layout (logo header + Raavon footer);
 * `buttons` render as link buttons (App Store, Play, WhatsApp, custom). With
 * includeCardLink, each recipient also gets a personalised "Download your card"
 * button pointing at their own card page. Every send is logged.
 */
export async function POST(req: Request) {
  const admin = await getAdminEmail();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Accept {recipients:[{email,ref}]} (preferred) or a plain {emails:[]}.
  const rawRecipients: Recipient[] = Array.isArray(body.recipients)
    ? body.recipients
        .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
        .map((r) => ({
          email: typeof r.email === "string" ? r.email.trim().toLowerCase() : "",
          ref: typeof r.ref === "string" && REF_RE.test(r.ref.trim()) ? r.ref.trim() : "",
        }))
    : Array.isArray(body.emails)
      ? body.emails
          .filter((e): e is string => typeof e === "string")
          .map((e) => ({ email: e.trim().toLowerCase(), ref: "" }))
      : [];

  // De-dupe by email, keep valid addresses.
  const seen = new Set<string>();
  const recipients = rawRecipients.filter((r) => {
    if (!EMAIL_RE.test(r.email) || seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const heading = typeof body.heading === "string" ? body.heading.trim() : "";
  const message = typeof body.body === "string" ? body.body.trim() : "";
  const includeCardLink = body.includeCardLink === true;

  const buttons: EmailButton[] = Array.isArray(body.buttons)
    ? body.buttons
        .filter((b): b is Record<string, unknown> => !!b && typeof b === "object")
        .map((b) => ({
          label: typeof b.label === "string" ? b.label.trim() : "",
          url: typeof b.url === "string" ? b.url.trim() : "",
          variant: b.variant === "outline" ? ("outline" as const) : ("primary" as const),
        }))
        .filter((b) => b.label && URL_RE.test(b.url))
        .slice(0, 6)
    : [];

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No valid recipients selected." },
      { status: 400 }
    );
  }
  if (!subject) {
    return NextResponse.json({ error: "Add a subject." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Write a message." }, { status: 400 });
  }

  const cardUrl = (ref: string) =>
    `${SITE.url}/anchor-club/card/${encodeURIComponent(ref)}?dl=1`;

  let messages: BatchMessage[];
  if (includeCardLink) {
    // Personalise per recipient: append their own card-download button.
    messages = recipients.map((r) => {
      const btns = r.ref
        ? [
            ...buttons,
            {
              label: "Download your card",
              url: cardUrl(r.ref),
              variant: "primary" as const,
            },
          ]
        : buttons;
      return {
        to: r.email,
        subject,
        html: buildEmailHtml({ heading: heading || undefined, body: message, buttons: btns }),
        text: message + buttonsText(btns),
      };
    });
  } else {
    // One shared brand email for everyone.
    const html = buildEmailHtml({ heading: heading || undefined, body: message, buttons });
    const text = message + buttonsText(buttons);
    messages = recipients.map((r) => ({ to: r.email, subject, html, text }));
  }

  const results = await sendBatch(messages);
  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  const auditId = await createAuditEvent({
    action: "anchor_email",
    actor: admin,
    subject,
    segment: "anchor-club",
    recipientCount: recipients.length,
    sentCount: sent,
    failedCount: failed,
  });

  await logEmails(
    results.map((r) => ({
      email: r.to,
      type: "anchor_email",
      resend_id: r.id ?? null,
      status: r.ok ? ("sent" as const) : ("failed" as const),
      error: r.ok ? null : r.error ?? "failed",
    })),
    auditId
  );

  return NextResponse.json({ ok: true, sent, failed });
}

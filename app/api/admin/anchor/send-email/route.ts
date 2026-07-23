import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { sendBatch, type BatchMessage } from "@/lib/email/batch";
import { buildEmailHtml } from "@/lib/email/compose-html";
import { buttonsText, type EmailButton } from "@/lib/email/linkButtons";
import { logEmails } from "@/lib/db/email-log";
import { createAuditEvent } from "@/lib/db/audit";

export const runtime = "nodejs";
export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\//i;

/**
 * Send a one-off, editable email to hand-picked Anchor Club applicants.
 * Admin-only. body:
 *   { emails: string[], subject, heading?, body, buttons?: {label,url,variant}[] }
 * The body is wrapped in the Klario brand layout (logo header + Raavon footer);
 * `buttons` render as a row of link buttons (App Store, Play, WhatsApp, custom).
 * Every send is logged to email_log + audit_log.
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

  const emails = Array.isArray(body.emails)
    ? [
        ...new Set(
          body.emails
            .filter((e): e is string => typeof e === "string")
            .map((e) => e.trim().toLowerCase())
            .filter((e) => EMAIL_RE.test(e))
        ),
      ]
    : [];
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const heading = typeof body.heading === "string" ? body.heading.trim() : "";
  const message = typeof body.body === "string" ? body.body.trim() : "";

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

  if (emails.length === 0) {
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

  const html = buildEmailHtml({
    heading: heading || undefined,
    body: message,
    buttons,
  });
  const text = message + buttonsText(buttons);

  const messages: BatchMessage[] = emails.map((to) => ({
    to,
    subject,
    html,
    text,
  }));

  const results = await sendBatch(messages);
  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  const auditId = await createAuditEvent({
    action: "anchor_email",
    actor: admin,
    subject,
    segment: "anchor-club",
    recipientCount: emails.length,
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

import { resend, RESEND_FROM, ADMIN_NOTIFY_EMAIL } from "./client";
import { unsubscribeUrl } from "./links";
import type { Email } from "./templates";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Replace the {{unsubscribe_url}} placeholder for a single known recipient.
 * Only applied when `to` is one address; broadcast/multi sends do not run here.
 */
function fillUnsubscribe(content: string, to: string | string[]): string {
  if (Array.isArray(to)) return content;
  if (!content.includes("{{unsubscribe_url}}")) return content;
  return content.replace(/\{\{\s*unsubscribe_url\s*\}\}/g, unsubscribeUrl(to));
}

export async function sendTransactional(opts: {
  to: string | string[];
  email: Email;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}): Promise<SendResult> {
  try {
    const html = fillUnsubscribe(opts.email.html, opts.to);
    const text = fillUnsubscribe(opts.email.text, opts.to);
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: opts.to,
      subject: opts.email.subject,
      html,
      text,
      replyTo: opts.replyTo,
      tags: opts.tags,
    });

    if (error) {
      console.error("[email] send failed:", error);
      return { ok: false, error: error.message ?? "Unknown Resend error" };
    }
    return { ok: true, id: data?.id ?? "" };
  } catch (e) {
    console.error("[email] send threw:", e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function notifyAdmin(email: Email): Promise<SendResult> {
  return sendTransactional({
    to: ADMIN_NOTIFY_EMAIL,
    email,
    tags: [{ name: "type", value: "internal_notification" }],
  });
}

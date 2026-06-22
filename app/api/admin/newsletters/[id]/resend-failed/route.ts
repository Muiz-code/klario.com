import { NextResponse } from "next/server";
import { getNewsletter, markNewsletterSent } from "@/lib/db/newsletters";
import { listSignups, markInvited } from "@/lib/db/signups";
import {
  logEmails,
  getFailedByAuditIds,
  deleteEmailLogByIds,
} from "@/lib/db/email-log";
import { createAuditEvent, getAuditIdsForNewsletter } from "@/lib/db/audit";
import { getAdminEmail } from "@/lib/supabase/server";
import { unsubscribeUrl } from "@/lib/email/links";
import { sendBatch, type BatchMessage } from "@/lib/email/batch";

export const runtime = "nodejs";
export const maxDuration = 60;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Resend a newsletter to just the recipients whose original send failed.
 * Finds the failed email_log rows tied to this newsletter (via its audit
 * events), re-sends the saved HTML, clears the resolved failures, and bumps
 * the newsletter's sent count. Unsubscribed recipients are skipped.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const newsletter = await getNewsletter(id);
  if (!newsletter) {
    return NextResponse.json({ error: "Newsletter not found." }, { status: 404 });
  }

  const auditIds = await getAuditIdsForNewsletter(id);
  const failedRows = await getFailedByAuditIds(auditIds);
  if (failedRows.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      failed: 0,
      message: "No failed recipients to resend.",
    });
  }

  const signups = await listSignups({ limit: 50000 });
  const byEmail = new Map(signups.map((s) => [s.email.toLowerCase(), s]));

  // One message per unique failed email; skip unsubscribed.
  const messages: BatchMessage[] = [];
  const seen = new Set<string>();
  for (const row of failedRows) {
    const email = row.email.toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);
    const s = byEmail.get(email);
    if (s?.status === "unsubscribed") continue;

    const link = unsubscribeUrl(email);
    const firstName = s?.first_name?.trim() || "from Klario";
    const html = newsletter.html
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, link)
      .replace(/\{\{\s*first_name\s*\}\}/g, escapeHtml(firstName));
    messages.push({
      to: email,
      subject: newsletter.subject,
      html,
      text: `${newsletter.subject}\n\nView this email in a browser if it does not render. Unsubscribe: ${link}`,
      headers: {
        "List-Unsubscribe": `<${link}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
  }

  if (messages.length === 0) {
    // Every failed recipient is unsubscribed - clear the stale rows.
    await deleteEmailLogByIds(failedRows.map((r) => r.id));
    return NextResponse.json({
      ok: true,
      sent: 0,
      failed: 0,
      message: "All failed recipients are unsubscribed; cleared.",
    });
  }

  const results = await sendBatch(messages);
  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;
  const okEmails = new Set(
    results.filter((r) => r.ok).map((r) => r.to.toLowerCase())
  );

  const auditId = await createAuditEvent({
    action: "newsletter",
    actor: await getAdminEmail(),
    subject: newsletter.subject,
    template: "Newsletter",
    segment: "resend-failed",
    recipientCount: results.length,
    sentCount: sent,
    failedCount: failed,
    meta: {
      newsletter_id: id,
      failures: results
        .filter((r) => !r.ok)
        .map((r) => ({ email: r.to, error: r.error })),
    },
  });

  // Pending signups we just reached are now contacted.
  const nowContacted = signups
    .filter((s) => s.status === "pending" && okEmails.has(s.email.toLowerCase()))
    .map((s) => s.id);

  // Clear the original failed rows we successfully re-sent.
  const resolvedIds = failedRows
    .filter((r) => okEmails.has(r.email.toLowerCase()))
    .map((r) => r.id);

  await Promise.all([
    logEmails(
      results.map((r) => ({
        email: r.to,
        type: "newsletter",
        resend_id: r.id ?? null,
        status: r.ok ? ("sent" as const) : ("failed" as const),
        error: r.error ?? null,
      })),
      auditId
    ),
    nowContacted.length > 0 ? markInvited(nowContacted) : Promise.resolve(),
    deleteEmailLogByIds(resolvedIds),
    markNewsletterSent(id, {
      recipientCount: newsletter.recipient_count,
      sentCount: newsletter.sent_count + sent,
      status: "sent",
    }),
  ]);

  return NextResponse.json({ ok: true, sent, failed });
}

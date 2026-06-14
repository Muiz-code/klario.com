import { NextResponse } from "next/server";
import { getNewsletter, markNewsletterSent } from "@/lib/db/newsletters";
import { listSignups } from "@/lib/db/signups";
import { logEmails } from "@/lib/db/email-log";
import { createAuditEvent } from "@/lib/db/audit";
import { getAdminEmail } from "@/lib/supabase/server";
import { unsubscribeUrl } from "@/lib/email/links";
import { sendBatch, type BatchMessage } from "@/lib/email/batch";
import { cleanupOrphanImages } from "@/lib/storage/cleanup";

export const runtime = "nodejs";
export const maxDuration = 60;

type Segment = "all" | "new" | "existing";

/**
 * Batch-send a saved newsletter. body:
 *   { segment?: "all" | "new" | "existing" }  -> send to that audience, or
 *   { emails?: string[] }                     -> send to these specific people
 *
 * Segments: all = everyone not unsubscribed; new = pending; existing =
 * invited or active. An explicit emails[] takes priority over segment.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  let segment: Segment = "all";
  let emails: string[] | null = null;
  try {
    const body = (await req.json()) as { segment?: unknown; emails?: unknown };
    if (body.segment === "new" || body.segment === "existing") {
      segment = body.segment;
    }
    if (Array.isArray(body.emails)) {
      emails = body.emails
        .filter((e): e is string => typeof e === "string")
        .map((e) => e.trim().toLowerCase());
    }
  } catch {
    // no body / invalid JSON -> default to "all"
  }

  const newsletter = await getNewsletter(id);
  if (!newsletter) {
    return NextResponse.json({ error: "Newsletter not found." }, { status: 404 });
  }
  if (newsletter.status === "sent") {
    return NextResponse.json(
      { error: "This newsletter was already sent." },
      { status: 409 }
    );
  }

  const all = await listSignups({ limit: 50000 });
  const emailSet = emails ? new Set(emails) : null;
  const recipients = all.filter((s) => {
    if (s.status === "unsubscribed") return false;
    if (emailSet) return emailSet.has(s.email.toLowerCase());
    if (segment === "new") return s.status === "pending";
    if (segment === "existing")
      return s.status === "invited" || s.status === "active";
    return true;
  });

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No subscribers in that audience." }, { status: 400 });
  }

  const messages: BatchMessage[] = recipients.map((s) => {
    const link = unsubscribeUrl(s.email);
    const firstName = (s.first_name || "there").trim() || "there";
    const html = newsletter.html
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, link)
      .replace(/\{\{\s*first_name\s*\}\}/g, escapeHtml(firstName));
    return {
      to: s.email,
      subject: newsletter.subject,
      html,
      text: `${newsletter.subject}\n\nView this email in a browser if it does not render. Unsubscribe: ${link}`,
      headers: {
        "List-Unsubscribe": `<${link}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  });

  const results = await sendBatch(messages);
  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  const auditId = await createAuditEvent({
    action: "newsletter",
    actor: await getAdminEmail(),
    subject: newsletter.subject,
    template: "Newsletter",
    segment: emailSet ? "choose" : segment,
    recipientCount: recipients.length,
    sentCount: sent,
    failedCount: failed,
    meta: {
      newsletter_id: id,
      failures: results.filter((r) => !r.ok).map((r) => ({ email: r.to, error: r.error })),
    },
  });

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
    markNewsletterSent(id, {
      recipientCount: recipients.length,
      sentCount: sent,
      status: sent > 0 ? "sent" : "failed",
    }),
  ]);

  // Free space: remove orphaned images (abandoned composes / test uploads).
  // Images used by this newsletter are protected because its html is saved.
  cleanupOrphanImages().catch((e) =>
    console.error("[storage] post-send cleanup failed:", e)
  );

  return NextResponse.json({
    ok: true,
    attempted: results.length,
    sent,
    failed: results.length - sent,
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

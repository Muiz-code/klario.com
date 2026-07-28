import { NextResponse } from "next/server";
import { getNewsletter, markNewsletterSending } from "@/lib/db/newsletters";
import { listSignups } from "@/lib/db/signups";
import {
  getMailedEmails,
  getEmailsMailedSince,
  getDeliveryProblems,
} from "@/lib/db/email-log";
import { normalizeEmail } from "@/lib/duplicates";
import { createAuditEvent } from "@/lib/db/audit";
import { getAdminEmail } from "@/lib/supabase/server";
import { enqueueRecipients, getQueueCounts } from "@/lib/db/newsletterQueue";
import { getResendRecipients } from "@/lib/email/resend-recipients";

export const runtime = "nodejs";
export const maxDuration = 60;

// "all" = everyone not unsubscribed. "new"/"existing" = never/already mailed
// (ever). "sent_today"/"not_today" = mailed / not mailed since midnight.
// "failed" = last delivery failed/bounced.
type Segment = "all" | "new" | "existing" | "failed" | "sent_today" | "not_today";
const SEGMENTS = new Set<Segment>([
  "all",
  "new",
  "existing",
  "failed",
  "sent_today",
  "not_today",
]);

function startOfTodayIso(): string {
  // Server-day midnight (UTC). Good enough for a "today" convenience filter.
  return new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
}

/**
 * Queue a newsletter for background sending. Resolves the audience, enqueues
 * recipients, marks the newsletter "sending", sends the first chunk immediately
 * for instant feedback, and kicks the cron worker to drain the rest. The send
 * therefore resumes after any interruption and scales to very large audiences.
 *
 * body: { segment?: Segment } or { emails?: string[] } (explicit list wins).
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let segment: Segment = "all";
  let emails: string[] | null = null;
  let allowResend = false; // bypass the dedup guard on purpose
  try {
    const body = (await req.json()) as {
      segment?: unknown;
      emails?: unknown;
      allowResend?: unknown;
    };
    if (typeof body.segment === "string" && SEGMENTS.has(body.segment as Segment)) {
      segment = body.segment as Segment;
    }
    if (Array.isArray(body.emails)) {
      emails = body.emails
        .filter((e): e is string => typeof e === "string")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    }
    if (body.allowResend === true) allowResend = true;
  } catch {
    // no body -> default "all"
  }

  const newsletter = await getNewsletter(id);
  if (!newsletter) {
    return NextResponse.json({ error: "Newsletter not found." }, { status: 404 });
  }

  const all = await listSignups({ limit: 50000 });

  type Recip = { email: string; first_name: string | null; signup_id: string | null };
  let recipients: Recip[];

  if (emails) {
    const emailSet = new Set(emails);
    const bySignup = new Map(all.map((s) => [s.email.toLowerCase(), s]));
    recipients = [...emailSet]
      .map((email): Recip | null => {
        const s = bySignup.get(email);
        if (s) {
          if (s.status === "unsubscribed") return null;
          return {
            email: s.email,
            first_name: s.first_name,
            signup_id: s.status === "pending" ? s.id : null,
          };
        }
        return { email, first_name: null, signup_id: null };
      })
      .filter((r): r is Recip => r !== null);
  } else {
    // Resolve the segment against the delivery log.
    let filterSet: Set<string> | null = null; // emails to keep or exclude
    let mode: "keep" | "exclude" = "keep";
    if (segment === "new" || segment === "existing") {
      const mailed = new Set((await getMailedEmails()).map(normalizeEmail));
      filterSet = mailed;
      mode = segment === "existing" ? "keep" : "exclude";
    } else if (segment === "sent_today" || segment === "not_today") {
      const today = new Set(
        (await getEmailsMailedSince(startOfTodayIso())).map(normalizeEmail)
      );
      filterSet = today;
      mode = segment === "sent_today" ? "keep" : "exclude";
    } else if (segment === "failed") {
      const problems = await getDeliveryProblems();
      filterSet = new Set([...problems.failed, ...problems.bounced].map(normalizeEmail));
      mode = "keep";
    }

    recipients = all
      .filter((s) => {
        if (s.status === "unsubscribed") return false;
        if (!filterSet) return true; // "all"
        const inSet = filterSet.has(normalizeEmail(s.email));
        return mode === "keep" ? inSet : !inSet;
      })
      .map((s) => ({
        email: s.email,
        first_name: s.first_name,
        signup_id: s.status === "pending" ? s.id : null,
      }));
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients in that audience." }, { status: 400 });
  }

  // Dedup guard: unless the admin explicitly allows it, drop anyone who already
  // received THIS campaign (same subject, any past draft) — read from Resend,
  // the complete record. This is what stops the same mail going out 5×.
  let skippedDuplicates = 0;
  if (!allowResend && newsletter.subject) {
    try {
      const prior = await getResendRecipients(
        { subject: newsletter.subject, days: 45 },
        true // fresh, so a just-completed send is reflected
      );
      const already = new Set(prior.recipients.map((r) => r.email.toLowerCase()));
      if (already.size > 0) {
        const before = recipients.length;
        recipients = recipients.filter((r) => !already.has(r.email.toLowerCase()));
        skippedDuplicates = before - recipients.length;
      }
    } catch {
      // Resend hiccup — don't block the send; queue idempotency still guards
      // against same-draft duplicates.
    }
  }

  if (recipients.length === 0) {
    return NextResponse.json({
      ok: true,
      id,
      queued: 0,
      sent: 0,
      pending: 0,
      noop: true,
      skippedDuplicates,
      message: `Everyone in this audience already received "${newsletter.subject}" (${skippedDuplicates} skipped). Tick "send again" to override.`,
    });
  }

  // Enqueue (idempotent per email), then flag the newsletter as sending.
  await enqueueRecipients(id, recipients);
  const counts = await getQueueCounts(id);

  // If nothing landed in the queue despite having recipients, the queue table
  // (migration 0021) isn't in the database — surface that instead of a fake
  // "delivered to 0" success.
  if (counts.total === 0) {
    return NextResponse.json(
      {
        error:
          "Couldn't queue recipients. The send queue isn't set up — run migration 0021_newsletter_send_queue.sql in Supabase, then try again.",
      },
      { status: 503 }
    );
  }

  // A re-send to an audience that's already fully sent queues 0 new recipients
  // (the queue is idempotent). Don't create an empty audit event or a fake
  // "sending" state — tell the admin nothing new was queued.
  if (counts.pending === 0) {
    return NextResponse.json({
      ok: true,
      id,
      queued: 0,
      sent: counts.sent,
      pending: 0,
      noop: true,
      message: "Everyone in this audience was already sent this newsletter — 0 new to send.",
    });
  }

  const auditId = await createAuditEvent({
    action: "newsletter",
    actor: await getAdminEmail(),
    subject: newsletter.subject,
    template: "Newsletter",
    segment: emails ? "choose" : segment,
    recipientCount: counts.total,
    sentCount: 0,
    failedCount: 0,
    meta: { newsletter_id: id },
  });
  await markNewsletterSending(id, { auditId, recipientCount: counts.total });

  // Recipients are queued. The progress modal drives the batches from here (one
  // at a time, so no double-sending); if it's closed early, /resume hands the
  // rest to the background worker.
  return NextResponse.json({
    ok: true,
    id,
    queued: counts.total,
    sent: counts.sent,
    pending: counts.pending,
    skippedDuplicates,
  });
}

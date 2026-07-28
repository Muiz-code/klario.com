import { after } from "next/server";
import { getNewsletter, markNewsletterSent } from "@/lib/db/newsletters";
import { setAuditSendCounts } from "@/lib/db/audit";
import {
  claimChunk,
  reclaimStale,
  markQueueRows,
  getQueueCounts,
  newslettersWithPending,
} from "@/lib/db/newsletterQueue";
import { sendBatch, type BatchMessage } from "@/lib/email/batch";
import { unsubscribeUrl } from "@/lib/email/links";
import { logEmails } from "@/lib/db/email-log";
import { markInvited } from "@/lib/db/signups";
import { SITE } from "@/lib/constants";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ChunkResult = {
  sent: number;
  failed: number;
  remaining: number;
  done: boolean;
};

/**
 * Send the next chunk of a newsletter's pending queue. Idempotent and resumable:
 * it only ever touches rows still 'pending', logs delivery, advances contacted
 * signups to 'invited', and finalizes the newsletter to 'sent' once the queue is
 * drained. Safe to call repeatedly (cron) and concurrently-ish (rows are marked
 * as they go). Each call is sized to finish well under the function timeout.
 */
export async function processSendChunk(
  newsletterId: string,
  chunkSize = 400
): Promise<ChunkResult> {
  const newsletter = await getNewsletter(newsletterId);
  if (!newsletter) return { sent: 0, failed: 0, remaining: 0, done: true };

  // Recover any rows claimed by a worker that never finished, then atomically
  // claim this chunk so no other worker can grab the same recipients.
  await reclaimStale(newsletterId);
  const chunk = await claimChunk(newsletterId, chunkSize);
  if (chunk.length === 0) {
    // Nothing left to claim. Only finalize once no rows are pending at all
    // (there may still be rows claimed and in-flight in another worker).
    const counts = await getQueueCounts(newsletterId);
    if (newsletter.send_audit_id) {
      await setAuditSendCounts(newsletter.send_audit_id, counts.sent, counts.failed);
    }
    if (counts.total > 0 && counts.pending === 0) {
      await markNewsletterSent(newsletterId, {
        recipientCount: counts.total,
        sentCount: counts.sent,
        status: counts.sent > 0 ? "sent" : "failed",
      });
    }
    return { sent: 0, failed: 0, remaining: counts.pending, done: counts.pending === 0 };
  }

  const attachments = (newsletter.attachments ?? [])
    .filter((a) => a.url)
    .map((a) => ({ filename: a.filename || "attachment.pdf", path: a.url }));

  const messages: BatchMessage[] = chunk.map((row) => {
    const link = unsubscribeUrl(row.email);
    const firstName = row.first_name?.trim() || "from Klario";
    const html = newsletter.html
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, link)
      .replace(/\{\{\s*first_name\s*\}\}/g, escapeHtml(firstName));
    return {
      to: row.email,
      subject: newsletter.subject,
      html,
      text: `${newsletter.subject}\n\nView this email in a browser if it does not render. Unsubscribe: ${link}`,
      headers: {
        "List-Unsubscribe": `<${link}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      attachments: attachments.length ? attachments : undefined,
    };
  });

  const results = await sendBatch(messages);

  // Results are in the same order as messages (== chunk). Map back to queue ids.
  await markQueueRows(
    chunk.map((row, i) => ({
      id: row.id,
      ok: results[i]?.ok ?? false,
      error: results[i]?.error ?? null,
    }))
  );

  await logEmails(
    results.map((r) => ({
      email: r.to,
      type: "newsletter",
      resend_id: r.id ?? null,
      status: r.ok ? ("sent" as const) : ("failed" as const),
      error: r.error ?? null,
    })),
    newsletter.send_audit_id ?? null
  );

  // Advance successfully-emailed pending signups to 'invited' (signup_id is only
  // set for pending signups at enqueue time).
  const invitedIds = chunk
    .filter((row, i) => (results[i]?.ok ?? false) && row.signup_id)
    .map((row) => row.signup_id as string);
  if (invitedIds.length) await markInvited(invitedIds);

  const counts = await getQueueCounts(newsletterId);
  // Keep the audit log's SENT column climbing live as the queue drains.
  if (newsletter.send_audit_id) {
    await setAuditSendCounts(newsletter.send_audit_id, counts.sent, counts.failed);
  }
  const done = counts.pending === 0;
  if (done) {
    await markNewsletterSent(newsletterId, {
      recipientCount: counts.total,
      sentCount: counts.sent,
      status: counts.sent > 0 ? "sent" : "failed",
    });
  }

  return {
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    remaining: counts.pending,
    done,
  };
}

/**
 * Drain the queue for up to `budgetMs`, processing every newsletter that still
 * has pending recipients. Returns true if work remains after the budget.
 */
export async function drainForBudget(
  budgetMs = 45_000,
  chunkSize = 400
): Promise<boolean> {
  const start = Date.now();
  const ids = await newslettersWithPending();
  for (const id of ids) {
    while (Date.now() - start < budgetMs) {
      const r = await processSendChunk(id, chunkSize);
      if (r.done) break;
    }
    if (Date.now() - start >= budgetMs) break;
  }
  return (await newslettersWithPending(1)).length > 0;
}

function workerUrl(baseOrigin?: string): string {
  // Prefer the caller's own origin so self-ping hits THIS deployment (works on
  // localhost too); fall back to VERCEL_URL, then the production site.
  const base =
    baseOrigin ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : SITE.url);
  return `${base}/api/cron/newsletter-send`;
}

/** Kick the worker and wait only for its instant 202 (it does the work after). */
export async function pingSendWorker(baseOrigin?: string): Promise<void> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return;
  try {
    await fetch(workerUrl(baseOrigin), {
      method: "GET",
      headers: { authorization: `Bearer ${secret}` },
    });
  } catch {
    /* ignore — the scheduled cron and existing chain are backstops */
  }
}

/**
 * Kick the worker from a request handler. Uses `after()` so the outbound request
 * survives past the response — this is what lets a large send keep draining
 * without a minute-by-minute cron (so no Vercel Pro needed). The worker returns
 * a 202 immediately and does its ~45s of sending in its own `after()`, then
 * pings the next run — a self-sustaining chain.
 */
export function triggerSendWorker(): void {
  after(async () => {
    await pingSendWorker();
  });
}

import { resend } from "@/lib/email/client";
import { resendTimeToMs } from "@/lib/email/resend-time";
import { rateLimitWait } from "@/lib/redis";

/**
 * Shared, rate-limited pager for Resend's `emails.list`. Resend allows only
 * ~10 requests/second, and several features sweep the list (usage meter, audit
 * reconcile, recipients tab) — sometimes at once. So every list call goes
 * through ONE global queue that spaces calls out and retries on 429. This keeps
 * us safely under the limit no matter how many sweeps run concurrently.
 */

export type ResendListRow = {
  id: string;
  created_at: string;
  last_event: string;
  subject: string;
  to?: string[] | null;
};

/**
 * Load-test recipients use resend.dev addresses. They're real Resend sends (so
 * Resend keeps them in its history forever — we can't delete them there), but
 * they're noise in real analytics, so every aggregate view filters them out.
 */
export function isTestAddress(email: string | null | undefined): boolean {
  return /@resend\.dev$/i.test((email ?? "").trim());
}

const MIN_GAP_MS = 150; // ~6.6 req/s — comfortably under Resend's 10/s
const MAX_RETRIES = 5;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Global serialization: all callers share this chain, so list calls never
// overlap and are spaced ≥ MIN_GAP_MS apart process-wide.
let chain: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;

function isRateLimit(msg: string): boolean {
  return /rate limit|too many requests|429/i.test(msg);
}

async function listOnce(after?: string) {
  const gap = MIN_GAP_MS - (Date.now() - lastCallAt);
  if (gap > 0) await sleep(gap);
  // Global cap across all instances (no-op without Redis). Under Resend's 10/s.
  await rateLimitWait("resend:list", 8, 1000);

  for (let attempt = 0; ; attempt++) {
    lastCallAt = Date.now();
    const res = await resend.emails.list(
      after ? { limit: 100, after } : { limit: 100 }
    );
    if (!res.error) return res;
    if (attempt >= MAX_RETRIES || !isRateLimit(res.error.message)) {
      throw new Error(res.error.message);
    }
    await sleep(400 * (attempt + 1)); // linear backoff on 429
  }
}

/** Serialize a list call onto the global chain. */
function rateLimitedList(after?: string): Promise<Awaited<ReturnType<typeof listOnce>>> {
  const run = () => listOnce(after);
  const p = chain.then(run, run);
  chain = p.catch(() => {}); // keep the chain alive even if one call throws
  return p;
}

/**
 * Sweep Resend emails newest-first, invoking `onRow` for every email created at
 * or after `sinceMs`. Stops once it pages past the window, runs dry, or hits the
 * page cap. Returns whether the cap was reached (counts may be partial).
 */
export async function sweepResendEmails(
  sinceMs: number,
  onRow: (row: ResendListRow) => void,
  maxPages = 200
): Promise<{ approximate: boolean }> {
  let cursor: string | undefined;
  const seen = new Set<string>();
  let approximate = false;

  for (let page = 0; page < maxPages; page++) {
    const res = await rateLimitedList(cursor);
    const rows = (res.data?.data ?? []) as ResendListRow[];
    if (rows.length === 0) break;

    let passed = false;
    let advanced = false;
    for (const row of rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      advanced = true;
      if (resendTimeToMs(row.created_at) < sinceMs) {
        passed = true;
        continue;
      }
      onRow(row);
    }

    if (passed || !res.data?.has_more || !advanced) break;
    cursor = rows[rows.length - 1]?.id;
    if (!cursor) break;
    if (page === maxPages - 1) approximate = true;
  }

  return { approximate };
}

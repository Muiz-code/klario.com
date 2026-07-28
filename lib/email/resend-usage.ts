import { resendTimeToMs } from "@/lib/email/resend-time";
import { sweepResendEmails, isTestAddress } from "@/lib/email/resend-list";
import { cacheGetJSON, cacheSetJSON } from "@/lib/redis";

/**
 * Resend send usage, read live from Resend itself (the `emails.list` API), for a
 * daily and a monthly window. Resend has NO quota/remaining endpoint — the only
 * quota signals it exposes are the `daily_quota_exceeded` / `monthly_quota_exceeded`
 * error codes you get *after* hitting the wall. So the limits here are ours to
 * configure (env, defaults 1000/day + 50000/month) and "remaining" = limit − sent.
 *
 * `emails.list` is cursor-paginated (100/page, newest-first, no date filter and
 * no total count), so we page from the newest until we pass the month boundary
 * or hit a page cap, tallying per-window. Results are cached briefly so the
 * dashboard doesn't hammer Resend (and stays within its rate limits).
 */

export type UsageWindow = {
  sent: number;
  limit: number;
  remaining: number;
  delivered: number;
  opened: number;
};

export type ResendUsage = {
  day: UsageWindow;
  month: UsageWindow;
  /** True if we hit the page cap and the counts may undercount the real total. */
  approximate: boolean;
  /** ISO timestamp the numbers were computed. */
  asOf: string;
  /** Set when Resend couldn't be reached (counts are 0 and stale). */
  error?: string;
};

// Nigeria (WAT) is UTC+1 year-round, no DST. The dashboard's "today"/"this
// month" should match the local business day, not UTC.
const TZ_OFFSET_MS = 60 * 60 * 1000;

const DAILY_LIMIT = Number(process.env.RESEND_DAILY_LIMIT) || 5000;
const MONTHLY_LIMIT = Number(process.env.RESEND_MONTHLY_LIMIT) || 50000;

// Bound the work: 100/page × 80 pages = up to 8,000 emails scanned per refresh.
const MAX_PAGES = 80;
const CACHE_TTL_MS = 60_000;

// last_event values that did NOT consume a send (never left our account).
const NOT_SENT = new Set(["canceled", "failed", "suppressed"]);

const toMs = resendTimeToMs;

/** Start-of-today and start-of-month in WAT, as epoch ms. */
function windowStarts(now: Date): { dayStartMs: number; monthStartMs: number } {
  const wat = new Date(now.getTime() + TZ_OFFSET_MS); // shift clock to WAT
  const y = wat.getUTCFullYear();
  const m = wat.getUTCMonth();
  const d = wat.getUTCDate();
  return {
    dayStartMs: Date.UTC(y, m, d, 0, 0, 0) - TZ_OFFSET_MS,
    monthStartMs: Date.UTC(y, m, 1, 0, 0, 0) - TZ_OFFSET_MS,
  };
}

let cache: { at: number; value: ResendUsage } | null = null;

function window(
  sent: number,
  limit: number,
  delivered: number,
  opened: number
): UsageWindow {
  return { sent, limit, remaining: Math.max(0, limit - sent), delivered, opened };
}

const DELIVERED_EVENTS = new Set(["delivered", "opened", "clicked"]);
const OPENED_EVENTS = new Set(["opened", "clicked"]);

async function computeUsage(): Promise<ResendUsage> {
  const now = new Date();
  const { dayStartMs, monthStartMs } = windowStarts(now);

  let daySent = 0, dayDelivered = 0, dayOpened = 0;
  let monthSent = 0, monthDelivered = 0, monthOpened = 0;

  const { approximate } = await sweepResendEmails(
    monthStartMs,
    (row) => {
      if (NOT_SENT.has(row.last_event)) return;
      if (isTestAddress(row.to?.[0])) return; // exclude load-test traffic
      const createdMs = toMs(row.created_at);
      const isToday = createdMs >= dayStartMs;
      const delivered = DELIVERED_EVENTS.has(row.last_event);
      const opened = OPENED_EVENTS.has(row.last_event);
      monthSent++;
      if (delivered) monthDelivered++;
      if (opened) monthOpened++;
      if (isToday) {
        daySent++;
        if (delivered) dayDelivered++;
        if (opened) dayOpened++;
      }
    },
    MAX_PAGES
  );

  return {
    day: window(daySent, DAILY_LIMIT, dayDelivered, dayOpened),
    month: window(monthSent, MONTHLY_LIMIT, monthDelivered, monthOpened),
    approximate,
    asOf: now.toISOString(),
  };
}

/** Cached (60s) live Resend usage. Never throws — returns an error field.
 *  Pass `force` to bypass the cache (the meter's manual refresh button). */
export async function getResendUsage(force = false): Promise<ResendUsage> {
  if (!force) {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
    const shared = await cacheGetJSON<ResendUsage>("resend:usage");
    if (shared) {
      cache = { at: Date.now(), value: shared };
      return shared;
    }
  }
  try {
    const value = await computeUsage();
    cache = { at: Date.now(), value };
    void cacheSetJSON("resend:usage", value, Math.ceil(CACHE_TTL_MS / 1000));
    return value;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Resend request failed";
    // Serve a stale cache if we have one; otherwise a zeroed, flagged result.
    if (cache) return { ...cache.value, error: message };
    return {
      day: window(0, DAILY_LIMIT, 0, 0),
      month: window(0, MONTHLY_LIMIT, 0, 0),
      approximate: false,
      asOf: new Date().toISOString(),
      error: message,
    };
  }
}

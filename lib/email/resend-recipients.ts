import { resendTimeToMs } from "@/lib/email/resend-time";
import { sweepResendEmails } from "@/lib/email/resend-list";

/**
 * Per-recipient delivery record read straight from Resend (the complete source
 * of truth — our email_log misses sends). Groups every send in the window by
 * recipient so you can see how many times each person got a mail, and how many
 * of those were delivered / opened / clicked. Powers the audit "Recipients" tab.
 */

export type RecipientStat = {
  email: string;
  sent: number; // times a mail actually went out (attempts that left)
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  campaigns: string[]; // distinct subjects
  lastAt: string; // most recent send (ISO)
};

export type RecipientReport = {
  recipients: RecipientStat[];
  totalSends: number;
  uniqueRecipients: number;
  duplicated: number; // recipients who got more than one mail
  days: number;
  approximate: boolean;
  asOf: string;
  error?: string;
};

const CACHE_TTL_MS = 180_000; // 3 min

const NOT_SENT = new Set(["canceled", "failed", "suppressed"]);
const DELIVERED = new Set(["delivered", "opened", "clicked"]);
const OPENED = new Set(["opened", "clicked"]);

const cache = new Map<string, { at: number; value: RecipientReport }>();

const TZ = 60 * 60 * 1000; // WAT = UTC+1

// WAT (UTC+1) start of today, so "Today" matches the local business day.
function watStartOfTodayMs(): number {
  const wat = new Date(Date.now() + TZ);
  return Date.UTC(wat.getUTCFullYear(), wat.getUTCMonth(), wat.getUTCDate()) - TZ;
}

/** WAT midnight for a "YYYY-MM-DD" string, as epoch ms. */
function watDateMs(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d) - TZ;
}

export type RecipientQuery = {
  days?: number;
  from?: string;
  to?: string;
  /** Restrict to one campaign (exact subject match). */
  subject?: string;
};

/** Sweep [sinceMs, untilMs) and group by recipient (optionally one subject). */
async function compute(
  sinceMs: number,
  untilMs: number,
  subject?: string
): Promise<RecipientReport> {
  const now = new Date();
  const byEmail = new Map<string, RecipientStat>();
  const campaigns = new Map<string, Set<string>>();
  let totalSends = 0;

  const { approximate } = await sweepResendEmails(sinceMs, (row) => {
    const ev = row.last_event;
    if (NOT_SENT.has(ev)) return;
    if (subject && row.subject !== subject) return; // one campaign only
    if (resendTimeToMs(row.created_at) >= untilMs) return; // newer than range
    const email = (row.to?.[0] ?? "").toLowerCase().trim();
    if (!email) return;

    totalSends++;
    let s = byEmail.get(email);
    if (!s) {
      s = { email, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, campaigns: [], lastAt: row.created_at };
      byEmail.set(email, s);
      campaigns.set(email, new Set());
    }
    s.sent++;
    if (DELIVERED.has(ev)) s.delivered++;
    if (OPENED.has(ev)) s.opened++;
    if (ev === "clicked") s.clicked++;
    if (ev === "bounced") s.bounced++;
    if (row.subject) campaigns.get(email)!.add(row.subject);
    if (resendTimeToMs(row.created_at) > resendTimeToMs(s.lastAt)) s.lastAt = row.created_at;
  });

  for (const [email, set] of campaigns) {
    byEmail.get(email)!.campaigns = [...set];
  }
  const recipients = [...byEmail.values()].sort((a, b) => b.sent - a.sent);

  return {
    recipients,
    totalSends,
    uniqueRecipients: recipients.length,
    duplicated: recipients.filter((r) => r.sent > 1).length,
    days: 0,
    approximate,
    asOf: now.toISOString(),
  };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Resolve a query to [sinceMs, untilMs) plus a stable cache key. */
function resolveRange(q: RecipientQuery): { sinceMs: number; untilMs: number; key: string } {
  const subjKey = q.subject ? `_s:${q.subject}` : "";
  if (q.from && q.to && DATE_RE.test(q.from) && DATE_RE.test(q.to)) {
    // Inclusive of both days: from midnight of `from` to midnight after `to`.
    const sinceMs = watDateMs(q.from);
    const untilMs = watDateMs(q.to) + 86_400_000;
    return { sinceMs, untilMs, key: `r_${q.from}_${q.to}${subjKey}` };
  }
  const days = q.days ?? 15;
  const sinceMs = days === 0 ? watStartOfTodayMs() : Date.now() - days * 86_400_000;
  return { sinceMs, untilMs: Number.MAX_SAFE_INTEGER, key: `d_${days}${subjKey}` };
}

export async function getResendRecipients(
  query: RecipientQuery = {},
  force = false
): Promise<RecipientReport> {
  const { sinceMs, untilMs, key } = resolveRange(query);
  const hit = cache.get(key);
  if (!force && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  try {
    const value = await compute(sinceMs, untilMs, query.subject);
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Resend request failed";
    if (hit) return { ...hit.value, error: message };
    return {
      recipients: [],
      totalSends: 0,
      uniqueRecipients: 0,
      duplicated: 0,
      days: 0,
      approximate: false,
      asOf: new Date().toISOString(),
      error: message,
    };
  }
}

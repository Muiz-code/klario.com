import { resendTimeToMs } from "@/lib/email/resend-time";
import { sweepResendEmails, isTestAddress } from "@/lib/email/resend-list";
import { cacheGetJSON, cacheSetJSON } from "@/lib/redis";

/**
 * Every individual email from Resend — campaigns AND transactional sends (the
 * welcome mail after a form, Anchor Club confirmations, contact replies, etc.).
 * This is the complete record straight from Resend, not just what we logged.
 * Powers the audit "All mail" tab.
 */

export type MailRow = {
  id: string;
  to: string;
  subject: string;
  status: string; // Resend last_event
  at: string; // created_at
};

export type MailReport = {
  emails: MailRow[];
  total: number;
  capped: boolean; // more than we return exist in the window
  approximate: boolean;
  asOf: string;
  error?: string;
};

export type MailQuery = { days?: number; from?: string; to?: string };

const TZ = 60 * 60 * 1000; // WAT
const CACHE_TTL_MS = 120_000;
const MAX_ROWS = 3000; // newest N returned to the UI
const MAX_PAGES = 120;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const cache = new Map<string, { at: number; value: MailReport }>();

function watStartOfTodayMs(): number {
  const w = new Date(Date.now() + TZ);
  return Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate()) - TZ;
}
function watDateMs(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d) - TZ;
}

function resolveRange(q: MailQuery): { sinceMs: number; untilMs: number; key: string } {
  if (q.from && q.to && DATE_RE.test(q.from) && DATE_RE.test(q.to)) {
    return {
      sinceMs: watDateMs(q.from),
      untilMs: watDateMs(q.to) + 86_400_000,
      key: `r_${q.from}_${q.to}`,
    };
  }
  const days = q.days ?? 15;
  const sinceMs = days === 0 ? watStartOfTodayMs() : Date.now() - days * 86_400_000;
  return { sinceMs, untilMs: Number.MAX_SAFE_INTEGER, key: `d_${days}` };
}

async function compute(sinceMs: number, untilMs: number): Promise<MailReport> {
  const now = new Date();
  const emails: MailRow[] = [];
  let total = 0;
  let capped = false;

  const { approximate } = await sweepResendEmails(
    sinceMs,
    (row) => {
      if (resendTimeToMs(row.created_at) >= untilMs) return; // newer than range
      if (isTestAddress(row.to?.[0])) return; // exclude load-test traffic
      total++;
      if (emails.length < MAX_ROWS) {
        emails.push({
          id: row.id,
          to: row.to?.[0] ?? "",
          subject: row.subject ?? "",
          status: row.last_event,
          at: row.created_at,
        });
      } else {
        capped = true;
      }
    },
    MAX_PAGES
  );

  return { emails, total, capped, approximate, asOf: now.toISOString() };
}

export async function getResendEmails(
  query: MailQuery = {},
  force = false
): Promise<MailReport> {
  const { sinceMs, untilMs, key } = resolveRange(query);
  const hit = cache.get(key);
  if (!force) {
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
    const shared = await cacheGetJSON<MailReport>(`resend:emails:${key}`);
    if (shared) {
      cache.set(key, { at: Date.now(), value: shared });
      return shared;
    }
  }
  try {
    const value = await compute(sinceMs, untilMs);
    cache.set(key, { at: Date.now(), value });
    void cacheSetJSON(`resend:emails:${key}`, value, Math.ceil(CACHE_TTL_MS / 1000));
    return value;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Resend request failed";
    if (hit) return { ...hit.value, error: message };
    return {
      emails: [],
      total: 0,
      capped: false,
      approximate: false,
      asOf: new Date().toISOString(),
      error: message,
    };
  }
}

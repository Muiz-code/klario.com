import { supabaseAdmin } from "@/lib/supabase/admin";
import { recomputeAuditRollups } from "@/lib/db/audit";
import { sweepResendEmails, isTestAddress } from "@/lib/email/resend-list";
import { resendTimeToMs } from "@/lib/email/resend-time";
import { withLock } from "@/lib/redis";
import { listNewsletters } from "@/lib/db/newsletters";

/**
 * Reconcile from Resend, the source of truth. Two jobs, one sweep:
 *  1. UPDATE — upgrade delivery status/timestamps on email_log rows we already
 *     have (covers webhook gaps), and roll the totals up onto audit events.
 *  2. BACKFILL — INSERT email_log rows for real sends Resend has that we never
 *     logged (transactional mail, sends made off the tracked path). This makes
 *     email_log a complete mirror of Resend, so every email_log-based analytic
 *     (dashboard KPIs, "sent today", funnels) becomes accurate without querying
 *     Resend live on each page load.
 *
 * Test (resend.dev) traffic is ignored. Guarded by a global lock so only one
 * instance backfills at a time (no duplicate inserts); the lock no-ops without
 * Redis, where the low run-frequency keeps duplicates rare.
 */

type LastEvent =
  | "bounced"
  | "canceled"
  | "clicked"
  | "complained"
  | "delivered"
  | "delivery_delayed"
  | "failed"
  | "opened"
  | "queued"
  | "scheduled"
  | "sent"
  | "suppressed";

export type ReconcileResult = {
  scanned: number;
  matched: number;
  updated: number;
  inserted: number; // backfilled rows Resend had but we didn't
  delivered: number;
  opened: number;
  bounced: number;
  audits: number;
  skipped?: boolean; // another instance was already reconciling
  error?: string;
};

const MAX_PAGES = 200;

type ResendInfo = { ev: LastEvent; to: string; subject: string; created: string };

/** Sweep Resend → id map of everything real (non-test) since `sinceMs`. */
async function fetchResendData(sinceMs: number): Promise<Map<string, ResendInfo>> {
  const map = new Map<string, ResendInfo>();
  await sweepResendEmails(
    sinceMs,
    (row) => {
      const to = row.to?.[0] ?? "";
      if (isTestAddress(to)) return;
      map.set(row.id, {
        ev: row.last_event as LastEvent,
        to,
        subject: row.subject ?? "",
        created: row.created_at,
      });
    },
    MAX_PAGES
  );
  return map;
}

type LogRow = {
  resend_id: string | null;
  status: string;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  audit_id: string | null;
  id: string;
};

async function fetchLogRows(sinceIso: string): Promise<LogRow[]> {
  const db = supabaseAdmin();
  const rows: LogRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("email_log")
      .select("id, resend_id, status, delivered_at, opened_at, clicked_at, audit_id")
      .gte("sent_at", sinceIso)
      .not("resend_id", "is", null)
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as LogRow[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

const NEVER_SENT = new Set<LastEvent>(["canceled", "suppressed", "queued", "scheduled"]);

/** Map a Resend last_event to email_log fields for a NEW (backfilled) row. */
function rowFromEvent(info: ResendInfo) {
  const at = new Date(resendTimeToMs(info.created)).toISOString();
  const ev = info.ev;
  const delivered = ev === "delivered" || ev === "opened" || ev === "clicked";
  const opened = ev === "opened" || ev === "clicked";
  const clicked = ev === "clicked";
  let status = "sent";
  if (delivered) status = "delivered";
  else if (ev === "bounced") status = "bounced";
  else if (ev === "complained") status = "complained";
  else if (ev === "failed") status = "failed";
  return {
    email: info.to,
    status,
    sent_at: at,
    delivered_at: delivered ? at : null,
    opened_at: opened ? at : null,
    clicked_at: clicked ? at : null,
  };
}

async function reconcile(days: number): Promise<ReconcileResult> {
  const result: ReconcileResult = {
    scanned: 0,
    matched: 0,
    updated: 0,
    inserted: 0,
    delivered: 0,
    opened: 0,
    bounced: 0,
    audits: 0,
  };
  const sinceMs = Date.now() - days * 86_400_000;
  const sinceIso = new Date(sinceMs).toISOString();

  let events: Map<string, ResendInfo>;
  try {
    events = await fetchResendData(sinceMs);
  } catch (e) {
    result.error = e instanceof Error ? e.message : "Resend request failed";
    return result;
  }
  result.scanned = events.size;

  const rows = await fetchLogRows(sinceIso);
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const affectedAudits = new Set<string>();
  const known = new Set<string>();

  // 1) UPDATE existing rows.
  for (const row of rows) {
    if (!row.resend_id) continue;
    known.add(row.resend_id);
    const info = events.get(row.resend_id);
    if (!info) continue;
    result.matched++;
    const ev = info.ev;

    const patch: Record<string, string> = {};
    const delivered = ev === "delivered" || ev === "opened" || ev === "clicked";
    const opened = ev === "opened" || ev === "clicked";
    const clicked = ev === "clicked";
    if (delivered && row.status === "sent") patch.status = "delivered";
    if ((ev === "bounced" || ev === "complained") && row.status === "sent") patch.status = ev;
    if (delivered && !row.delivered_at) patch.delivered_at = now;
    if (opened && !row.opened_at) patch.opened_at = now;
    if (clicked && !row.clicked_at) patch.clicked_at = now;
    if (Object.keys(patch).length === 0) continue;

    const { error } = await db.from("email_log").update(patch).eq("id", row.id);
    if (error) continue;
    result.updated++;
    if (patch.status === "delivered") result.delivered++;
    if (patch.opened_at) result.opened++;
    if (patch.status === "bounced" || patch.status === "complained") result.bounced++;
    if (row.audit_id) affectedAudits.add(row.audit_id);
  }

  // 2) BACKFILL — insert real sends Resend has that we never logged.
  const newsletterSubjects = new Set(
    (await listNewsletters()).map((n) => n.subject)
  );
  const inserts: Record<string, unknown>[] = [];
  for (const [id, info] of events) {
    if (known.has(id)) continue;
    if (NEVER_SENT.has(info.ev)) continue;
    const base = rowFromEvent(info);
    inserts.push({
      ...base,
      type: newsletterSubjects.has(info.subject) ? "newsletter" : "transactional",
      resend_id: id,
      audit_id: null,
    });
  }
  for (let i = 0; i < inserts.length; i += 500) {
    const slice = inserts.slice(i, i + 500);
    const { error } = await db.from("email_log").insert(slice);
    if (error) {
      console.error("[reconcile] backfill insert failed:", error.message);
      continue;
    }
    result.inserted += slice.length;
  }

  for (const auditId of affectedAudits) {
    await recomputeAuditRollups(auditId);
    result.audits++;
  }

  return result;
}

export async function reconcileFromResend(days = 15): Promise<ReconcileResult> {
  const ran = await withLock("resend-reconcile", 180, () => reconcile(days));
  if (ran === null) {
    return {
      scanned: 0,
      matched: 0,
      updated: 0,
      inserted: 0,
      delivered: 0,
      opened: 0,
      bounced: 0,
      audits: 0,
      skipped: true,
    };
  }
  return ran;
}

import { supabaseAdmin } from "@/lib/supabase/admin";
import { recomputeAuditRollups } from "@/lib/db/audit";
import { sweepResendEmails } from "@/lib/email/resend-list";

/**
 * Reconcile delivery status directly from Resend (the source of truth), instead
 * of depending only on webhooks. Every send we make stores its Resend id, so we
 * sweep `emails.list` (newest-first), read each email's `last_event`, and update
 * our email_log rows + audit rollups to match. Run on demand ("Sync from Resend")
 * or on a schedule — it's idempotent and only ever upgrades a row's status.
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
  scanned: number; // Resend emails read
  matched: number; // email_log rows found for those ids
  updated: number; // rows whose status/timestamps changed
  delivered: number;
  opened: number;
  bounced: number;
  audits: number; // audit events recomputed
  error?: string;
};

const MAX_PAGES = 200; // up to 20,000 emails

/** Fetch a Resend id → last_event map for everything sent since `sinceMs`. */
async function fetchResendEvents(
  sinceMs: number
): Promise<Map<string, LastEvent>> {
  const map = new Map<string, LastEvent>();
  await sweepResendEmails(
    sinceMs,
    (row) => map.set(row.id, row.last_event as LastEvent),
    MAX_PAGES
  );
  return map;
}

type LogRow = {
  id: string;
  resend_id: string | null;
  status: string;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  audit_id: string | null;
};

/** Our email_log rows since `sinceIso` that carry a Resend id. */
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

export async function reconcileFromResend(days = 15): Promise<ReconcileResult> {
  const result: ReconcileResult = {
    scanned: 0,
    matched: 0,
    updated: 0,
    delivered: 0,
    opened: 0,
    bounced: 0,
    audits: 0,
  };
  const sinceMs = Date.now() - days * 86_400_000;
  const sinceIso = new Date(sinceMs).toISOString();

  let events: Map<string, LastEvent>;
  try {
    events = await fetchResendEvents(sinceMs);
  } catch (e) {
    result.error = e instanceof Error ? e.message : "Resend request failed";
    return result;
  }
  result.scanned = events.size;

  const rows = await fetchLogRows(sinceIso);
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const affectedAudits = new Set<string>();

  for (const row of rows) {
    const ev = row.resend_id ? events.get(row.resend_id) : undefined;
    if (!ev) continue;
    result.matched++;

    const patch: Record<string, string> = {};
    const delivered = ev === "delivered" || ev === "opened" || ev === "clicked";
    const opened = ev === "opened" || ev === "clicked";
    const clicked = ev === "clicked";

    // Only ever upgrade — never walk a status backwards.
    if (delivered && row.status === "sent") patch.status = "delivered";
    if ((ev === "bounced" || ev === "complained") && row.status === "sent")
      patch.status = ev;
    if (delivered && !row.delivered_at) patch.delivered_at = now;
    if (opened && !row.opened_at) patch.opened_at = now;
    if (clicked && !row.clicked_at) patch.clicked_at = now;

    if (Object.keys(patch).length === 0) continue;

    const { error } = await db.from("email_log").update(patch).eq("id", row.id);
    if (error) continue;
    result.updated++;
    if (patch.status === "delivered") result.delivered++;
    if (patch.opened_at) result.opened++;
    if (patch.status === "bounced" || patch.status === "complained")
      result.bounced++;
    if (row.audit_id) affectedAudits.add(row.audit_id);
  }

  for (const auditId of affectedAudits) {
    await recomputeAuditRollups(auditId);
    result.audits++;
  }

  return result;
}

import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/duplicates";

export type EmailLogEntry = {
  email: string;
  type: string;
  resend_id?: string | null;
  status: "sent" | "failed";
  error?: string | null;
};

export async function logEmails(
  entries: EmailLogEntry[],
  auditId?: string | null
): Promise<void> {
  if (entries.length === 0) return;
  const db = supabaseAdmin();
  const { error } = await db.from("email_log").insert(
    entries.map((e) => ({
      email: e.email,
      type: e.type,
      resend_id: e.resend_id ?? null,
      status: e.status,
      error: e.error ?? null,
      audit_id: auditId ?? null,
    }))
  );
  if (error) console.error("[db] logEmails failed:", error.message);
}

/**
 * Distinct (normalized) emails we have actually mailed - any send that wasn't
 * an outright failure (sent / delivered / bounced / complained). Used to mark
 * subscribers as "Mailed" vs "Pending" regardless of the stored status field.
 */
export async function getMailedEmails(): Promise<string[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("email_log")
    .select("email")
    .neq("status", "failed")
    .limit(200000);
  if (error) {
    console.error("[db] getMailedEmails failed:", error.message);
    return [];
  }
  const set = new Set<string>();
  for (const r of data ?? []) {
    const e = normalizeEmail(r.email as string | null);
    if (e) set.add(e);
  }
  return [...set];
}

function distinctEmails(rows: { email: string | null }[] | null): string[] {
  const set = new Set<string>();
  for (const r of rows ?? []) {
    if (r.email) set.add(r.email);
  }
  return [...set];
}

/**
 * Emails that didn't make it to the inbox, split by reason and excluding any
 * address we later delivered to successfully:
 *   - failed  = the send errored before leaving (never accepted)
 *   - bounced = accepted, then rejected by the recipient's mail server
 *               (includes spam complaints)
 */
export async function getDeliveryProblems(): Promise<{
  failed: string[];
  bounced: string[];
}> {
  const db = supabaseAdmin();
  const [failedRes, bouncedRes, okRes] = await Promise.all([
    db.from("email_log").select("email").eq("status", "failed").limit(200000),
    db
      .from("email_log")
      .select("email")
      .in("status", ["bounced", "complained"])
      .limit(200000),
    db
      .from("email_log")
      .select("email")
      .in("status", ["sent", "delivered"])
      .limit(200000),
  ]);

  if (failedRes.error || bouncedRes.error || okRes.error) {
    const err = failedRes.error || bouncedRes.error || okRes.error;
    if (err) console.error("[db] getDeliveryProblems failed:", err.message);
    return { failed: [], bounced: [] };
  }

  const okSet = new Set(distinctEmails(okRes.data).map(normalizeEmail));
  const notDelivered = (e: string) => !okSet.has(normalizeEmail(e));
  return {
    failed: distinctEmails(failedRes.data).filter(notDelivered),
    bounced: distinctEmails(bouncedRes.data).filter(notDelivered),
  };
}

export type FailedSend = {
  id: string;
  email: string;
  type: string;
  error: string | null;
  sent_at: string;
};

export type FailedRow = {
  id: string;
  email: string;
  type: string;
  audit_id: string | null;
};

/** Look up failed send rows by id (for type-aware retry). */
export async function getFailedByIds(ids: string[]): Promise<FailedRow[]> {
  if (ids.length === 0) return [];
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("email_log")
    .select("id, email, type, audit_id")
    .in("id", ids)
    .eq("status", "failed")
    .limit(5000);
  if (error) {
    console.error("[db] getFailedByIds failed:", error.message);
    return [];
  }
  return (data ?? []) as FailedRow[];
}

/** Failed newsletter rows for a set of audit events (id + email, to resend/clear). */
export async function getFailedByAuditIds(
  auditIds: string[]
): Promise<{ id: string; email: string }[]> {
  if (auditIds.length === 0) return [];
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("email_log")
    .select("id, email")
    .in("audit_id", auditIds)
    .eq("type", "newsletter")
    .eq("status", "failed")
    .limit(5000);
  if (error) {
    console.error("[db] getFailedByAuditIds failed:", error.message);
    return [];
  }
  return (data ?? []) as { id: string; email: string }[];
}

/** Delete email_log rows by id (used to clear resolved failures after retry). */
export async function deleteEmailLogByIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = supabaseAdmin();
  const { error } = await db.from("email_log").delete().in("id", ids);
  if (error) console.error("[db] deleteEmailLogByIds failed:", error.message);
}

/** Most recent failed send attempts, newest first. */
export async function listFailedSends(limit = 100): Promise<FailedSend[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("email_log")
    .select("id, email, type, error, sent_at")
    .eq("status", "failed")
    .order("sent_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[db] listFailedSends failed:", error.message);
    return [];
  }
  return (data ?? []) as FailedSend[];
}

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
 * Distinct (normalized) emails we have actually mailed — any send that wasn't
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

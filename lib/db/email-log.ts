import { supabaseAdmin } from "@/lib/supabase/admin";

export type EmailLogEntry = {
  email: string;
  type: string;
  resend_id?: string | null;
  status: "sent" | "failed";
  error?: string | null;
};

export async function logEmails(entries: EmailLogEntry[]): Promise<void> {
  if (entries.length === 0) return;
  const db = supabaseAdmin();
  const { error } = await db.from("email_log").insert(
    entries.map((e) => ({
      email: e.email,
      type: e.type,
      resend_id: e.resend_id ?? null,
      status: e.status,
      error: e.error ?? null,
    }))
  );
  if (error) console.error("[db] logEmails failed:", error.message);
}

/** Count of successfully sent emails in the last N days. */
export async function sentCountSince(days: number): Promise<number> {
  const db = supabaseAdmin();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await db
    .from("email_log")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("sent_at", since);
  if (error) {
    console.error("[db] sentCountSince failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

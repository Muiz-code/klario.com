import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Records what each admin member does on the system (invites, role changes,
 * sends, deletes, …) so a superadmin can audit activity per person. Best-effort:
 * a logging failure never blocks the action itself.
 */
export type AdminActivity = {
  id: string;
  actor_email: string;
  action: string;
  target: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export async function logMemberAction(
  actorEmail: string,
  action: string,
  target?: string | null,
  meta?: Record<string, unknown> | null
): Promise<void> {
  try {
    const db = supabaseAdmin();
    await db.from("admin_activity").insert({
      actor_email: actorEmail.toLowerCase(),
      action,
      target: target ?? null,
      meta: meta ?? null,
    });
  } catch (e) {
    console.error("[activity] log failed:", (e as Error).message);
  }
}

export async function listMemberActivity(opts?: {
  limit?: number;
  actorEmail?: string;
}): Promise<AdminActivity[]> {
  const db = supabaseAdmin();
  let q = db
    .from("admin_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 200);
  if (opts?.actorEmail) q = q.eq("actor_email", opts.actorEmail.toLowerCase());
  const { data, error } = await q;
  if (error) {
    console.error("[activity] list failed:", error.message);
    return [];
  }
  return (data ?? []) as AdminActivity[];
}

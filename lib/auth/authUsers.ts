import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Supabase Auth admin helpers keyed by email. supabase-js has no get-by-email,
 * so we page through listUsers (fine for a small admin team).
 */
export async function findAuthUserId(email: string): Promise<string | null> {
  const db = supabaseAdmin();
  const target = email.toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data) return null;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

/** Delete the Supabase auth account for an email, so it can be re-invited fresh. */
export async function deleteAuthUser(email: string): Promise<void> {
  const id = await findAuthUserId(email);
  if (!id) return;
  try {
    await supabaseAdmin().auth.admin.deleteUser(id);
  } catch (e) {
    console.error("[auth] deleteUser failed:", (e as Error).message);
  }
}

import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "node:crypto";

/**
 * Test users for load-testing the send pipeline. They live in beta_signups with
 * source='test' and use Resend's SAFE test addresses (delivered+<id>@resend.dev)
 * — Resend simulates delivery instantly with ZERO effect on sender reputation,
 * and every address is unique so batching/dedup behave like real recipients.
 * Nothing here ever touches a real inbox.
 */

export const TEST_SOURCE = "test";
const TEST_DOMAIN = "@resend.dev";
const MAX_CREATE = 5000;

export async function createTestUsers(count: number): Promise<number> {
  const db = supabaseAdmin();
  const n = Math.max(1, Math.min(MAX_CREATE, Math.floor(count)));
  const batch = randomUUID().slice(0, 8);
  const rows = Array.from({ length: n }, (_, i) => ({
    email: `delivered+lt-${batch}-${i}${TEST_DOMAIN}`,
    first_name: `Tester ${i + 1}`,
    status: "active" as const,
    source: TEST_SOURCE,
  }));

  let created = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const slice = rows.slice(i, i + 500);
    const { data, error } = await db
      .from("beta_signups")
      .upsert(slice, { onConflict: "email", ignoreDuplicates: true })
      .select("id");
    if (error) {
      console.error("[db] createTestUsers failed:", error.message);
      continue;
    }
    created += data?.length ?? 0;
  }
  return created;
}

export async function countTestUsers(): Promise<number> {
  const db = supabaseAdmin();
  const { count } = await db
    .from("beta_signups")
    .select("id", { count: "exact", head: true })
    .eq("source", TEST_SOURCE);
  return count ?? 0;
}

export type TestRecipient = { email: string; first_name: string | null; id: string };

export async function listTestUsers(limit = 5000): Promise<TestRecipient[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("beta_signups")
    .select("id, email, first_name")
    .eq("source", TEST_SOURCE)
    .limit(limit);
  if (error) {
    console.error("[db] listTestUsers failed:", error.message);
    return [];
  }
  return (data ?? []) as TestRecipient[];
}

/** Remove all test users and every trace of them (queue + delivery log). */
export async function deleteTestUsers(): Promise<{
  users: number;
  log: number;
  queue: number;
}> {
  const db = supabaseAdmin();

  // Everything test-related uses the resend.dev domain, so it's safe to purge
  // by domain — real sends never go there.
  const { data: qDel } = await db
    .from("newsletter_send_queue")
    .delete()
    .ilike("email", `%${TEST_DOMAIN}`)
    .select("id");
  const { data: lDel } = await db
    .from("email_log")
    .delete()
    .ilike("email", `%${TEST_DOMAIN}`)
    .select("id");
  const { data: uDel } = await db
    .from("beta_signups")
    .delete()
    .eq("source", TEST_SOURCE)
    .select("id");

  return {
    users: uDel?.length ?? 0,
    log: lDel?.length ?? 0,
    queue: qDel?.length ?? 0,
  };
}

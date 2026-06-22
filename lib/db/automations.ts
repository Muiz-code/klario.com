import { supabaseAdmin } from "@/lib/supabase/admin";

export type AutomationKey = "welcome" | "reengage" | "winback";

export type Automation = {
  id: string;
  key: AutomationKey;
  name: string;
  enabled: boolean;
  delay_hours: number;
  subject: string;
  body: string;
  sent_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
};

/** The built-in automations. Seeded once; admins then tune them. */
const DEFAULTS: Array<
  Pick<Automation, "key" | "name" | "delay_hours" | "subject" | "body">
> = [
  {
    key: "welcome",
    name: "Auto-welcome new signups",
    delay_hours: 0,
    subject: "Welcome to the Klario beta",
    body: "",
  },
  {
    key: "reengage",
    name: "Re-engage inactive subscribers",
    delay_hours: 72,
    subject: "Still keen on early access?",
    body: "You joined the Klario beta list a little while ago but haven't jumped in yet.\n\nWe're rolling out access in small batches and your spot is still reserved. Tap below whenever you're ready - it only takes a minute to get started.",
  },
  {
    key: "winback",
    name: "Win back dormant subscribers",
    delay_hours: 720, // 30 days
    subject: "We saved your spot at Klario",
    body: "It's been a while! Klario has come a long way: clearer balances, smarter insights, and a faster setup.\n\nWe'd love to have you back. Pick up right where you left off.",
  },
];

/** Ensure the built-in automations exist (without clobbering admin edits). */
async function ensureSeeded(): Promise<void> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("automations")
    .upsert(
      DEFAULTS.map((d) => ({ ...d })),
      { onConflict: "key", ignoreDuplicates: true }
    );
  if (error) console.error("[db] ensureSeeded automations failed:", error.message);
}

export async function listAutomations(): Promise<Automation[]> {
  await ensureSeeded();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("automations")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[db] listAutomations failed:", error.message);
    return [];
  }
  return (data ?? []) as Automation[];
}

export async function getAutomation(id: string): Promise<Automation | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("automations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db] getAutomation failed:", error.message);
    return null;
  }
  return (data as Automation) ?? null;
}

export async function updateAutomation(
  id: string,
  patch: Partial<
    Pick<Automation, "enabled" | "delay_hours" | "subject" | "body" | "name">
  >
): Promise<Automation | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("automations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    console.error("[db] updateAutomation failed:", error.message);
    return null;
  }
  return data as Automation;
}

/** Signup ids this automation has already sent to (for dedup). */
export async function getRunSignupIds(automationId: string): Promise<string[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("automation_runs")
    .select("signup_id")
    .eq("automation_id", automationId)
    .limit(100000);
  if (error) {
    console.error("[db] getRunSignupIds failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.signup_id as string);
}

/** Record sends. The UNIQUE(automation_id, signup_id) makes this idempotent. */
export async function recordRuns(
  automationId: string,
  rows: { signup_id: string; email: string; status: string }[]
): Promise<void> {
  if (rows.length === 0) return;
  const db = supabaseAdmin();
  const { error } = await db.from("automation_runs").upsert(
    rows.map((r) => ({ automation_id: automationId, ...r })),
    { onConflict: "automation_id,signup_id", ignoreDuplicates: true }
  );
  if (error) console.error("[db] recordRuns failed:", error.message);
}

/** Bump the sent counter and stamp the last run time. */
export async function bumpAutomation(
  id: string,
  opts: { addSent?: number; markRun?: boolean }
): Promise<void> {
  const db = supabaseAdmin();
  const patch: Record<string, unknown> = {};
  if (opts.markRun) patch.last_run_at = new Date().toISOString();
  if (opts.addSent && opts.addSent > 0) {
    const { data } = await db
      .from("automations")
      .select("sent_count")
      .eq("id", id)
      .maybeSingle();
    patch.sent_count = (data?.sent_count ?? 0) + opts.addSent;
  }
  if (Object.keys(patch).length === 0) return;
  const { error } = await db.from("automations").update(patch).eq("id", id);
  if (error) console.error("[db] bumpAutomation failed:", error.message);
}

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdminEmail } from "@/lib/supabase/server";

/**
 * Records what each admin member does on the system (invites, role changes,
 * sends, edits, deletes, toggles, …) so a superadmin can audit activity per
 * person. Best-effort: a logging failure never blocks the action itself.
 *
 * Action names are `area.verb` — "automation.disable", "template.delete". Older
 * rows used prose ("sent mail") or snake_case ("invite_member"); LEGACY_LABELS
 * keeps those readable instead of rewriting history.
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

/**
 * Log an action, resolving the signed-in admin itself — the one-liner every
 * mutating admin route should end with:
 *
 *     await logAction("automation.disable", { target: automation.name });
 *
 * Falls back to "system" when there's no session (cron / webhook callers), so
 * an unattributed action is still recorded rather than lost.
 */
export async function logAction(
  action: string,
  opts?: { target?: string | null; meta?: Record<string, unknown> | null }
): Promise<void> {
  let actor = "system";
  try {
    actor = (await getAdminEmail()) ?? "system";
  } catch {
    // No request scope (or auth not configured) — still log it.
  }
  await logMemberAction(actor, action, opts?.target ?? null, opts?.meta ?? null);
}

export async function listMemberActivity(opts?: {
  limit?: number;
  actorEmail?: string;
  /** Exact action, or an `area.` prefix like "automation." */
  action?: string;
  since?: string;
}): Promise<AdminActivity[]> {
  const db = supabaseAdmin();
  let q = db
    .from("admin_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 200);
  if (opts?.actorEmail) q = q.eq("actor_email", opts.actorEmail.toLowerCase());
  if (opts?.action) {
    q = opts.action.endsWith(".")
      ? q.like("action", `${opts.action}%`)
      : q.eq("action", opts.action);
  }
  if (opts?.since) q = q.gte("created_at", opts.since);
  const { data, error } = await q;
  if (error) {
    console.error("[activity] list failed:", error.message);
    return [];
  }
  return (data ?? []) as AdminActivity[];
}

/** Distinct actors seen in the log — for the audit filter dropdown. */
export async function listActivityActors(): Promise<string[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("admin_activity")
    .select("actor_email")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.error("[activity] actors failed:", error.message);
    return [];
  }
  const seen = new Set<string>();
  for (const row of data ?? []) {
    const email = String((row as { actor_email?: string }).actor_email ?? "");
    if (email) seen.add(email);
  }
  return [...seen].sort();
}

// ── Display ──

/** Human phrasing for current `area.verb` actions. */
const ACTION_LABELS: Record<string, string> = {
  "anchor.delete": "deleted Anchor registration",
  "anchor.email": "emailed Anchor Club",
  "app_message.send": "sent an in-app message",
  "audience.import": "imported subscribers",
  "audience.export": "exported subscribers",
  "automation.create": "created automation",
  "automation.update": "edited automation",
  "automation.enable": "turned automation ON",
  "automation.disable": "turned automation OFF",
  "automation.run": "ran automations",
  "beta.ai_scan": "ran the beta AI scan",
  "beta.resend": "resent a beta invite",
  "beta.sync_audience": "synced beta responses to the audience",
  "blog.create": "created blog post",
  "blog.update": "edited blog post",
  "blog.delete": "deleted blog post",
  "blog.seed": "seeded blog posts",
  "duplicates.merge": "merged duplicate subscribers",
  "duplicates.resolve": "resolved duplicates",
  "email.retry": "retried a failed email",
  "image.upload": "uploaded an image",
  "invite.send": "sent a beta invite",
  "mail.create": "created mail",
  "mail.delete": "deleted mail",
  "mail.send": "sent mail",
  "mail.resend_failed": "resent mail to failed recipients",
  "mail.resume": "resumed a mail send",
  "resend.reconcile": "reconciled delivery from Resend",
  "segment.create": "created segment",
  "segment.update": "edited segment",
  "segment.delete": "deleted segment",
  "settings.update": "changed settings",
  "storage.cleanup": "cleaned up storage",
  "submission.delete": "deleted a submission",
  "subscriber.update": "edited subscriber",
  "subscriber.delete": "deleted subscriber",
  "template.create": "created template",
  "template.update": "edited template",
  "template.delete": "deleted template",
  "test_user.create": "created test users",
  "test_user.delete": "deleted test users",
  "test_user.send": "ran a load test",
  "team.invite": "invited a member",
  "team.update_member": "updated a member",
  "team.remove_member": "removed a member",
  "team.resend_invite": "resent a member invite",
  "team.create_role": "created a role",
  "team.update_role": "updated a role",
  "team.delete_role": "deleted a role",
  "team.set_password": "set their password",
};

/** Actions written before the `area.verb` convention. */
const LEGACY_LABELS: Record<string, string> = {
  invite_member: "invited a member",
  update_member: "updated a member",
  remove_member: "removed a member",
  resend_invite: "resent a member invite",
  create_role: "created a role",
  update_role: "updated a role",
  delete_role: "deleted a role",
  set_password: "set their password",
  "sent mail": "sent mail",
  "emailed Anchor Club": "emailed Anchor Club",
  "ran a load test": "ran a load test",
};

/** The admin area an action belongs to — used to group and filter. */
export function areaOfAction(action: string): string {
  const dot = action.indexOf(".");
  if (dot > 0) return action.slice(0, dot);
  if (action in LEGACY_LABELS) {
    if (/member|role|password/.test(action)) return "team";
    if (/mail/.test(action)) return "mail";
    if (/Anchor/.test(action)) return "anchor";
    if (/load test/.test(action)) return "test_user";
  }
  return "other";
}

/** Readable phrasing for any action, current or legacy. */
export function describeAction(action: string): string {
  return (
    ACTION_LABELS[action] ??
    LEGACY_LABELS[action] ??
    action.replace(/[._]+/g, " ")
  );
}

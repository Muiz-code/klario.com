import { supabaseAdmin } from "@/lib/supabase/admin";

export type AuditAction =
  | "beta_invite"
  | "newsletter"
  | "test_send"
  | "import"
  | "automation"
  | "anchor_email";

export type AuditEvent = {
  id: string;
  action: AuditAction;
  actor: string | null;
  subject: string | null;
  template: string | null;
  segment: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  delivered_count: number;
  bounced_count: number;
  opened_count: number;
  clicked_count: number;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export async function createAuditEvent(input: {
  action: AuditAction;
  actor?: string | null;
  subject?: string | null;
  template?: string | null;
  segment?: string | null;
  recipientCount?: number;
  sentCount?: number;
  failedCount?: number;
  meta?: Record<string, unknown> | null;
}): Promise<string | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("audit_log")
    .insert({
      action: input.action,
      actor: input.actor ?? null,
      subject: input.subject ?? null,
      template: input.template ?? null,
      segment: input.segment ?? null,
      recipient_count: input.recipientCount ?? 0,
      sent_count: input.sentCount ?? 0,
      failed_count: input.failedCount ?? 0,
      meta: input.meta ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[db] createAuditEvent failed:", error.message);
    return null;
  }
  return data.id as string;
}

export type AuditRecipient = {
  email: string;
  status: string;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error: string | null;
  sent_at: string;
};

/** The per-recipient email_log rows for one audit event. */
export async function getAuditRecipients(
  auditId: string
): Promise<AuditRecipient[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("email_log")
    .select("email, status, delivered_at, opened_at, clicked_at, error, sent_at")
    .eq("audit_id", auditId)
    .order("sent_at", { ascending: true })
    .limit(5000);
  if (error) {
    console.error("[db] getAuditRecipients failed:", error.message);
    return [];
  }
  return (data ?? []) as AuditRecipient[];
}

/** Fetch a few audit events by id (e.g. to recover a send's newsletter_id). */
export async function getAuditByIds(
  ids: string[]
): Promise<{ id: string; subject: string | null; meta: Record<string, unknown> | null }[]> {
  if (ids.length === 0) return [];
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("audit_log")
    .select("id, subject, meta")
    .in("id", ids)
    .limit(1000);
  if (error) {
    console.error("[db] getAuditByIds failed:", error.message);
    return [];
  }
  return (data ?? []) as {
    id: string;
    subject: string | null;
    meta: Record<string, unknown> | null;
  }[];
}

/** Audit event ids tied to a newsletter (its original send plus any resends). */
export async function getAuditIdsForNewsletter(
  newsletterId: string
): Promise<string[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("audit_log")
    .select("id")
    .eq("action", "newsletter")
    .eq("meta->>newsletter_id", newsletterId)
    .limit(1000);
  if (error) {
    console.error("[db] getAuditIdsForNewsletter failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.id as string);
}

export async function listAuditEvents(limit = 200): Promise<AuditEvent[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[db] listAuditEvents failed:", error.message);
    return [];
  }
  return (data ?? []) as AuditEvent[];
}

export type ResendEventType =
  | "delivered"
  | "bounced"
  | "complained"
  | "opened"
  | "clicked";

/**
 * Apply a Resend webhook event: update the matching email_log row by resend_id,
 * then recompute the rollups on its audit event. Delivery outcomes set the
 * status; opens and clicks set their own timestamps (without clobbering the
 * delivery status), since a recipient can be delivered AND opened AND clicked.
 */
export async function applyResendEvent(opts: {
  resendId: string;
  type: ResendEventType;
  at: string;
}): Promise<void> {
  const db = supabaseAdmin();

  const { data: row, error: findErr } = await db
    .from("email_log")
    .select("id, audit_id, opened_at")
    .eq("resend_id", opts.resendId)
    .maybeSingle();
  if (findErr) {
    console.error("[db] applyResendEvent find failed:", findErr.message);
    return;
  }
  if (!row) return; // unknown message (e.g. an email not sent by this app)

  const patch: Record<string, string> = {};
  if (opts.type === "delivered") {
    patch.status = "delivered";
    patch.delivered_at = opts.at;
  } else if (opts.type === "bounced" || opts.type === "complained") {
    patch.status = opts.type;
  } else if (opts.type === "opened") {
    patch.opened_at = opts.at; // keep latest open
  } else if (opts.type === "clicked") {
    patch.clicked_at = opts.at;
    if (!row.opened_at) patch.opened_at = opts.at; // a click implies an open
  }

  await db.from("email_log").update(patch).eq("id", row.id);

  if (!row.audit_id) return;
  await recomputeAuditRollups(row.audit_id);
}

async function recomputeAuditRollups(auditId: string): Promise<void> {
  const db = supabaseAdmin();
  const base = () =>
    db
      .from("email_log")
      .select("*", { count: "exact", head: true })
      .eq("audit_id", auditId);

  const [delivered, bounced, opened, clicked] = await Promise.all([
    base().eq("status", "delivered"),
    base().in("status", ["bounced", "complained"]),
    base().not("opened_at", "is", null),
    base().not("clicked_at", "is", null),
  ]);

  await db
    .from("audit_log")
    .update({
      delivered_count: delivered.count ?? 0,
      bounced_count: bounced.count ?? 0,
      opened_count: opened.count ?? 0,
      clicked_count: clicked.count ?? 0,
    })
    .eq("id", auditId);
}

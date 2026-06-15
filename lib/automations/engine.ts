import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/duplicates";
import {
  listAutomations,
  getRunSignupIds,
  recordRuns,
  bumpAutomation,
  type Automation,
} from "@/lib/db/automations";
import { markInvited, type Signup } from "@/lib/db/signups";
import { getSettings } from "@/lib/db/settings";
import { renderWelcome } from "@/lib/email/welcome";
import { renderAutomationEmail } from "@/lib/email/automationEmail";
import { unsubscribeUrl } from "@/lib/email/links";
import { sendBatch, type BatchMessage } from "@/lib/email/batch";
import { logEmails } from "@/lib/db/email-log";
import { createAuditEvent } from "@/lib/db/audit";

// Cap per automation per run so a single cron invocation stays within its time
// budget; the remainder is picked up on the next run.
const MAX_PER_RUN = 200;

export type AutomationResult = {
  key: string;
  name: string;
  attempted: number;
  sent: number;
  failed: number;
};

/** Find the subscribers eligible for one automation right now. */
async function candidatesFor(a: Automation): Promise<Signup[]> {
  const db = supabaseAdmin();
  const cutoff = new Date(Date.now() - a.delay_hours * 3600_000).toISOString();
  const done = new Set(await getRunSignupIds(a.id));

  if (a.key === "welcome") {
    const { data } = await db
      .from("beta_signups")
      .select("*")
      .eq("status", "pending")
      .lte("created_at", cutoff)
      .limit(2000);
    return (data ?? [])
      .filter((s) => !done.has((s as Signup).id))
      .slice(0, MAX_PER_RUN) as Signup[];
  }

  if (a.key === "reengage") {
    const { data } = await db
      .from("beta_signups")
      .select("*")
      .eq("status", "invited")
      .not("invited_at", "is", null)
      .lte("invited_at", cutoff)
      .limit(2000);
    return (data ?? [])
      .filter((s) => !done.has((s as Signup).id))
      .slice(0, MAX_PER_RUN) as Signup[];
  }

  // winback: subscribers (not unsubscribed) whose last open/click is older than
  // the threshold, or who have never engaged and signed up before it.
  const { data: signups } = await db
    .from("beta_signups")
    .select("*")
    .neq("status", "unsubscribed")
    .limit(5000);
  const { data: eng } = await db
    .from("email_log")
    .select("email, opened_at, clicked_at")
    .or("opened_at.not.is.null,clicked_at.not.is.null")
    .limit(50000);

  const lastEngaged = new Map<string, number>();
  for (const r of eng ?? []) {
    const email = normalizeEmail(r.email as string | null);
    if (!email) continue;
    const t = Math.max(
      r.opened_at ? Date.parse(r.opened_at as string) : 0,
      r.clicked_at ? Date.parse(r.clicked_at as string) : 0
    );
    lastEngaged.set(email, Math.max(lastEngaged.get(email) ?? 0, t));
  }

  const cutoffMs = Date.now() - a.delay_hours * 3600_000;
  return (signups ?? [])
    .filter((row) => {
      const s = row as Signup;
      if (done.has(s.id)) return false;
      const last = lastEngaged.get(normalizeEmail(s.email)) ?? 0;
      if (last === 0) return Date.parse(s.created_at) <= cutoffMs; // never engaged
      return last <= cutoffMs;
    })
    .slice(0, MAX_PER_RUN) as Signup[];
}

function buildMessage(
  a: Automation,
  s: Signup,
  ctaUrl: string,
  welcomeSubject: string
): BatchMessage {
  const headers = {
    "List-Unsubscribe": `<${unsubscribeUrl(s.email)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };

  if (a.key === "welcome") {
    const { html, text } = renderWelcome({
      email: s.email,
      firstName: s.first_name,
      ctaUrl,
    });
    return {
      to: s.email,
      subject: a.subject || welcomeSubject,
      html,
      text,
      headers,
    };
  }

  const { html, text } = renderAutomationEmail({
    email: s.email,
    firstName: s.first_name,
    subject: a.subject,
    body: a.body,
    ctaUrl,
  });
  return { to: s.email, subject: a.subject, html, text, headers };
}

/** Run a single automation now (used by both the cron and the run-now button). */
export async function runAutomation(a: Automation): Promise<AutomationResult> {
  const base = { key: a.key, name: a.name };
  const candidates = await candidatesFor(a);
  if (candidates.length === 0) {
    await bumpAutomation(a.id, { markRun: true });
    return { ...base, attempted: 0, sent: 0, failed: 0 };
  }

  const settings = await getSettings();
  const ctaUrl = settings.welcome_cta_url;
  const messages = candidates.map((s) =>
    buildMessage(a, s, ctaUrl, settings.welcome_subject)
  );

  const results = await sendBatch(messages);
  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  const auditId = await createAuditEvent({
    action: "automation",
    subject: a.subject,
    template: a.name,
    segment: a.key,
    recipientCount: results.length,
    sentCount: sent,
    failedCount: failed,
  });

  // Record only successful sends so transient failures retry next run.
  const successful = candidates.filter((_, i) => results[i].ok);
  await Promise.all([
    recordRuns(
      a.id,
      successful.map((s) => ({ signup_id: s.id, email: s.email, status: "sent" }))
    ),
    logEmails(
      results.map((r) => ({
        email: r.to,
        type: `automation_${a.key}`,
        resend_id: r.id ?? null,
        status: r.ok ? ("sent" as const) : ("failed" as const),
        error: r.error ?? null,
      })),
      auditId
    ),
    bumpAutomation(a.id, { addSent: sent, markRun: true }),
    // The welcome automation advances pending → invited, like a manual invite.
    a.key === "welcome"
      ? markInvited(successful.map((s) => s.id))
      : Promise.resolve(),
  ]);

  return { ...base, attempted: results.length, sent, failed };
}

/** Run every enabled automation. Called by the daily cron. */
export async function processAutomations(): Promise<AutomationResult[]> {
  const automations = await listAutomations();
  const out: AutomationResult[] = [];
  for (const a of automations) {
    if (!a.enabled) continue;
    out.push(await runAutomation(a));
  }
  return out;
}

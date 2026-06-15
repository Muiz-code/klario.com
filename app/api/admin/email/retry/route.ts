import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { listSignups, markInvited, type Signup } from "@/lib/db/signups";
import { getSettings } from "@/lib/db/settings";
import { getNewsletter, type Newsletter } from "@/lib/db/newsletters";
import { listAutomations } from "@/lib/db/automations";
import {
  getFailedByIds,
  logEmails,
  deleteEmailLogByIds,
  type FailedRow,
} from "@/lib/db/email-log";
import { getAuditByIds, createAuditEvent } from "@/lib/db/audit";
import { renderWelcome } from "@/lib/email/welcome";
import { renderAutomationEmail } from "@/lib/email/automationEmail";
import { unsubscribeUrl } from "@/lib/email/links";
import { sendBatch, type BatchMessage } from "@/lib/email/batch";

export const runtime = "nodejs";
export const maxDuration = 60;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Retry failed sends, re-sending each by its ORIGINAL type:
 *   - beta_welcome / automation_welcome / unknown → the welcome email
 *   - automation_reengage / automation_winback   → that automation's email
 *   - newsletter                                  → the original newsletter HTML
 * Tests are skipped; unsubscribed recipients are skipped.
 *   body: { ids: string[] }   // email_log row ids
 */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ids?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((x): x is string => typeof x === "string")
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "No sends to retry." }, { status: 400 });
  }

  const rows = await getFailedByIds(ids);
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, skipped: 0 });
  }

  const [signups, settings, automations] = await Promise.all([
    listSignups({ limit: 50000 }),
    getSettings(),
    listAutomations(),
  ]);
  const byEmail = new Map<string, Signup>(
    signups.map((s) => [s.email.toLowerCase(), s])
  );
  const autoByKey = new Map(automations.map((a) => [a.key, a]));

  // For newsletter retries, recover the newsletter behind each audit event.
  const newsletterByAudit = new Map<string, Newsletter>();
  const newsletterRows = rows.filter((r) => r.type === "newsletter" && r.audit_id);
  if (newsletterRows.length > 0) {
    const auditIds = [...new Set(newsletterRows.map((r) => r.audit_id as string))];
    const audits = await getAuditByIds(auditIds);
    for (const a of audits) {
      const nlId = a.meta?.newsletter_id;
      if (typeof nlId !== "string") continue;
      const nl = await getNewsletter(nlId);
      if (nl) newsletterByAudit.set(a.id, nl);
    }
  }

  const messages: BatchMessage[] = [];
  const logTypes: string[] = [];
  const sourceIds: string[] = []; // original failed-row id per message
  const sentSignupIds: string[] = [];
  let skipped = 0;

  for (const row of rows) {
    const email = row.email.toLowerCase();
    const s = byEmail.get(email);
    if (s?.status === "unsubscribed" || row.type === "test") {
      skipped++;
      continue;
    }
    const firstName = s?.first_name ?? null;
    const link = unsubscribeUrl(email);
    const headers = {
      "List-Unsubscribe": `<${link}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };

    const msg = buildRetryMessage(row, {
      email,
      firstName,
      settings,
      headers,
      newsletterByAudit,
      autoByKey,
    });
    if (!msg) {
      skipped++;
      continue;
    }
    messages.push(msg.message);
    logTypes.push(msg.logType);
    sourceIds.push(row.id);
    if (msg.logType === "beta_welcome" && s && s.status === "pending") {
      sentSignupIds.push(s.id);
    }
  }

  if (messages.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, skipped });
  }

  const results = await sendBatch(messages);
  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  const auditId = await createAuditEvent({
    action: "beta_invite",
    actor: await getAdminEmail(),
    subject: "Retry failed sends",
    template: "Retry",
    segment: "retry",
    recipientCount: results.length,
    sentCount: sent,
    failedCount: failed,
  });

  // Mark successfully re-welcomed pending signups as invited.
  const okEmails = new Set(results.filter((r) => r.ok).map((r) => r.to));
  const toInvite = sentSignupIds.filter((_, i) => {
    const s = signups.find((x) => x.id === sentSignupIds[i]);
    return s ? okEmails.has(s.email) : false;
  });

  // Clear the original failed rows that we successfully re-sent, so the
  // notification bell stops showing already-resolved failures.
  const resolvedIds = sourceIds.filter((_, i) => results[i]?.ok);

  await Promise.all([
    logEmails(
      results.map((r, i) => ({
        email: r.to,
        type: logTypes[i] ?? "beta_welcome",
        resend_id: r.id ?? null,
        status: r.ok ? ("sent" as const) : ("failed" as const),
        error: r.error ?? null,
      })),
      auditId
    ),
    toInvite.length > 0 ? markInvited(toInvite) : Promise.resolve(),
    deleteEmailLogByIds(resolvedIds),
  ]);

  return NextResponse.json({ ok: true, sent, failed, skipped });
}

type BuildCtx = {
  email: string;
  firstName: string | null;
  settings: { welcome_subject: string; welcome_cta_url: string };
  headers: Record<string, string>;
  newsletterByAudit: Map<string, Newsletter>;
  autoByKey: Map<string, { key: string; subject: string; body: string }>;
};

function buildRetryMessage(
  row: FailedRow,
  ctx: BuildCtx
): { message: BatchMessage; logType: string } | null {
  const { email, firstName, settings, headers } = ctx;

  if (row.type === "newsletter") {
    const nl = row.audit_id ? ctx.newsletterByAudit.get(row.audit_id) : undefined;
    if (!nl) return null; // can't reconstruct the original newsletter
    const link = unsubscribeUrl(email);
    const html = nl.html
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, link)
      .replace(/\{\{\s*first_name\s*\}\}/g, escapeHtml((firstName || "there").trim() || "there"));
    return {
      message: {
        to: email,
        subject: nl.subject,
        html,
        text: `${nl.subject}\n\nView this email in a browser if it does not render. Unsubscribe: ${link}`,
        headers,
      },
      logType: "newsletter",
    };
  }

  if (row.type === "automation_reengage" || row.type === "automation_winback") {
    const a = ctx.autoByKey.get(row.type.slice("automation_".length));
    if (!a) return null;
    const { html, text } = renderAutomationEmail({
      email,
      firstName,
      subject: a.subject,
      body: a.body,
      ctaUrl: settings.welcome_cta_url,
    });
    return {
      message: { to: email, subject: a.subject, html, text, headers },
      logType: row.type,
    };
  }

  // Default: welcome (covers beta_welcome, automation_welcome, legacy types).
  const { html, text } = renderWelcome({
    email,
    firstName,
    ctaUrl: settings.welcome_cta_url,
  });
  return {
    message: {
      to: email,
      subject: settings.welcome_subject,
      html,
      text,
      headers,
    },
    logType: "beta_welcome",
  };
}

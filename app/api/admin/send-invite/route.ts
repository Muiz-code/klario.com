import { NextResponse } from "next/server";
import {
  getSignupsByIds,
  listSignups,
  markInvited,
  type Signup,
} from "@/lib/db/signups";
import { getSettings } from "@/lib/db/settings";
import { logEmails } from "@/lib/db/email-log";
import { createAuditEvent } from "@/lib/db/audit";
import { getAdminEmail } from "@/lib/supabase/server";
import { renderWelcome } from "@/lib/email/welcome";
import { unsubscribeUrl } from "@/lib/email/links";
import { sendBatch, type BatchMessage } from "@/lib/email/batch";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Send the beta welcome email.
 *   body: { ids?: string[], all?: boolean, resend?: boolean }
 * - ids: send to these specific signups.
 * - all: send to every eligible signup.
 * - resend: also send to people already marked invited (otherwise they are
 *   skipped, so the send is idempotent by default).
 */
export async function POST(req: Request) {
  let body: { ids?: unknown; all?: unknown; resend?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const resend = body.resend === true;

  let signups: Signup[];
  if (Array.isArray(body.ids) && body.ids.length > 0) {
    const ids = body.ids.filter((x): x is string => typeof x === "string");
    signups = await getSignupsByIds(ids);
  } else if (body.all === true) {
    signups = await listSignups({ limit: 5000 });
  } else {
    return NextResponse.json(
      { error: "Provide either ids[] or all:true." },
      { status: 400 }
    );
  }

  // Eligibility: never send to unsubscribed. Skip already-invited unless resend.
  const eligible = signups.filter((s) => {
    if (s.status === "unsubscribed") return false;
    if (!resend && s.status === "invited") return false;
    return true;
  });

  const skipped = signups.length - eligible.length;

  if (eligible.length === 0) {
    return NextResponse.json({
      ok: true,
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped,
      message: "No eligible recipients.",
    });
  }

  const settings = await getSettings();
  const ctaUrl = settings.welcome_cta_url;
  const subject = settings.welcome_subject;

  const messages: BatchMessage[] = eligible.map((s) => {
    const { html, text } = renderWelcome({
      email: s.email,
      firstName: s.first_name,
      ctaUrl,
    });
    return {
      to: s.email,
      subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl(s.email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  });

  const results = await sendBatch(messages);

  const byEmail = new Map(results.map((r) => [r.to, r]));
  const sentIds: string[] = [];
  for (const s of eligible) {
    if (byEmail.get(s.email)?.ok) sentIds.push(s.id);
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  const auditId = await createAuditEvent({
    action: "beta_invite",
    actor: await getAdminEmail(),
    subject,
    template: "Beta welcome",
    segment: body.all === true ? "all" : resend ? "selected (resend)" : "selected",
    recipientCount: results.length,
    sentCount: sent,
    failedCount: failed,
    meta: {
      skipped,
      failures: results.filter((r) => !r.ok).map((r) => ({ email: r.to, error: r.error })),
    },
  });

  await Promise.all([
    markInvited(sentIds),
    logEmails(
      results.map((r) => ({
        email: r.to,
        type: "beta_welcome",
        resend_id: r.id ?? null,
        status: r.ok ? ("sent" as const) : ("failed" as const),
        error: r.error ?? null,
      })),
      auditId
    ),
  ]);

  return NextResponse.json({
    ok: true,
    attempted: results.length,
    sent,
    failed,
    skipped,
    failures: results
      .filter((r) => !r.ok)
      .map((r) => ({ email: r.to, error: r.error })),
  });
}

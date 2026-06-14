import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db/settings";
import { logEmails } from "@/lib/db/email-log";
import { createAuditEvent } from "@/lib/db/audit";
import { getAdminEmail } from "@/lib/supabase/server";
import { renderWelcome } from "@/lib/email/welcome";
import { sendBatch } from "@/lib/email/batch";
import { validateEmail } from "@/lib/email/validation";

export const runtime = "nodejs";

/** Send a single test copy of the welcome email. body: { email, firstName? } */
export async function POST(req: Request) {
  let body: { email?: unknown; firstName?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = validateEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }
  const firstName =
    typeof body.firstName === "string" ? body.firstName.slice(0, 80) : "there";

  const settings = await getSettings();
  const { html, text } = renderWelcome({
    email,
    firstName,
    ctaUrl: settings.welcome_cta_url,
  });

  const [result] = await sendBatch([
    { to: email, subject: `[TEST] ${settings.welcome_subject}`, html, text },
  ]);

  const auditId = await createAuditEvent({
    action: "test_send",
    actor: await getAdminEmail(),
    subject: `[TEST] ${settings.welcome_subject}`,
    template: "Beta welcome",
    recipientCount: 1,
    sentCount: result?.ok ? 1 : 0,
    failedCount: result?.ok ? 0 : 1,
  });

  await logEmails(
    [
      {
        email,
        type: "beta_welcome_test",
        resend_id: result?.id ?? null,
        status: result?.ok ? "sent" : "failed",
        error: result?.error ?? null,
      },
    ],
    auditId
  );

  if (!result?.ok) {
    return NextResponse.json(
      { error: result?.error || "Send failed" },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true, id: result.id });
}

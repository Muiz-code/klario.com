import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db/settings";
import { logEmails } from "@/lib/db/email-log";
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

  await logEmails([
    {
      email,
      type: "beta_welcome_test",
      resend_id: result?.id ?? null,
      status: result?.ok ? "sent" : "failed",
      error: result?.error ?? null,
    },
  ]);

  if (!result?.ok) {
    return NextResponse.json(
      { error: result?.error || "Send failed" },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true, id: result.id });
}

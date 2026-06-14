import { NextResponse } from "next/server";
import { sendTransactional, notifyAdmin } from "@/lib/email/send";
import {
  ambassadorConfirmation,
  internalNotification,
} from "@/lib/email/templates";
import { clean, splitName, validateEmail } from "@/lib/email/validation";
import { saveSubmission } from "@/lib/db/submissions";
import { upsertSignup } from "@/lib/db/signups";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
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

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 40);
  const institution = clean(body.institution, 120);
  const why = clean(body.why, 1500);
  const roleRaw = clean(body.role, 12);
  const role: "student" | "staff" | undefined =
    roleRaw === "student" || roleRaw === "staff" ? roleRaw : undefined;
  const { firstName, lastName } = splitName(name);

  await Promise.all([
    upsertSignup({
      email,
      first_name: firstName,
      last_name: lastName,
      source: "ambassador",
      phone,
    }),
    saveSubmission({
      kind: "ambassador",
      email,
      name,
      phone,
      role,
      institution,
      why,
    }),
  ]);

  const [confirm, notify] = await Promise.all([
    sendTransactional({
      to: email,
      email: ambassadorConfirmation({ firstName, role, institution }),
      tags: [{ name: "type", value: "ambassador_confirmation" }],
    }),
    notifyAdmin(
      internalNotification({
        kind: "Ambassador",
        payload: { role, name, email, phone, institution, why },
      })
    ),
  ]);

  if (!confirm.ok) {
    console.error("[/api/ambassador] confirmation send failed:", confirm.error);
  }
  if (!notify.ok) {
    console.error("[/api/ambassador] admin notification failed:", notify.error);
  }

  return NextResponse.json({
    ok: true,
    emailDelivered: confirm.ok,
    adminNotified: notify.ok,
  });
}

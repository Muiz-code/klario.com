import { NextResponse } from "next/server";
import { sendTransactional, notifyAdmin } from "@/lib/email/send";
import { betaConfirmation, internalNotification } from "@/lib/email/templates";
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
  const device = clean(body.device, 20);
  const banks = Array.isArray(body.banks)
    ? body.banks
        .filter((b): b is string => typeof b === "string")
        .map((b) => b.trim())
        .filter(Boolean)
        .slice(0, 25)
    : [];
  const bankList = banks.join(", ");
  const { firstName, lastName } = splitName(name);

  await Promise.all([
    upsertSignup({
      email,
      first_name: firstName,
      last_name: lastName,
      source: "beta",
      phone,
      device,
      banks: bankList || undefined,
    }),
    saveSubmission({
      kind: "beta",
      email,
      name,
      phone,
      banks: bankList || undefined,
      device,
    }),
  ]);

  const [confirm, notify] = await Promise.all([
    sendTransactional({
      to: email,
      email: betaConfirmation({ firstName, device, banks: bankList }),
      tags: [{ name: "type", value: "beta_confirmation" }],
    }),
    notifyAdmin(
      internalNotification({
        kind: "Beta",
        payload: {
          name,
          email,
          phone,
          banks: bankList || undefined,
          device,
        },
      })
    ),
  ]);

  if (!confirm.ok) {
    console.error("[/api/beta] confirmation send failed:", confirm.error);
  }
  if (!notify.ok) {
    console.error("[/api/beta] admin notification failed:", notify.error);
  }

  return NextResponse.json({
    ok: true,
    emailDelivered: confirm.ok,
    adminNotified: notify.ok,
  });
}

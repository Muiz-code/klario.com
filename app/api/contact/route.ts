import { NextResponse } from "next/server";
import { sendTransactional, notifyAdmin } from "@/lib/email/send";
import {
  contactAcknowledgement,
  internalNotification,
} from "@/lib/email/templates";
import { clean, splitName, validateEmail } from "@/lib/email/validation";
import { saveSubmission } from "@/lib/db/submissions";

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
  const topic = clean(body.topic, 40);
  const message = clean(body.message, 4000);

  if (!message) {
    return NextResponse.json(
      { error: "A message is required." },
      { status: 400 }
    );
  }

  const { firstName } = splitName(name);

  await saveSubmission({
    kind: "contact",
    email,
    name,
    topic,
    message,
  });

  const [ack, notify] = await Promise.all([
    sendTransactional({
      to: email,
      email: contactAcknowledgement({ firstName, topic }),
      replyTo: process.env.ADMIN_NOTIFY_EMAIL,
      tags: [{ name: "type", value: "contact_ack" }],
    }),
    notifyAdmin(
      internalNotification({
        kind: "Contact",
        payload: { topic, name, email, message },
      })
    ),
  ]);

  if (!ack.ok) {
    console.error("[/api/contact] ack send failed:", ack.error);
  }
  if (!notify.ok) {
    console.error("[/api/contact] admin notification failed:", notify.error);
  }

  return NextResponse.json({
    ok: true,
    emailDelivered: ack.ok,
    adminNotified: notify.ok,
  });
}

import { NextResponse } from "next/server";
import { sendTransactional } from "@/lib/email/send";
import { newsletterWelcome } from "@/lib/email/templates";
import { clean, splitName, validateEmail } from "@/lib/email/validation";
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
  const { firstName, lastName } = splitName(name);

  const signup = await upsertSignup({
    email,
    first_name: firstName,
    last_name: lastName,
    source: "newsletter",
  });

  const welcome = await sendTransactional({
    to: email,
    email: newsletterWelcome({ firstName }),
    tags: [{ name: "type", value: "newsletter_welcome" }],
  });

  if (!welcome.ok) {
    console.error("[/api/newsletter] welcome send failed:", welcome.error);
  }

  return NextResponse.json({
    ok: true,
    saved: Boolean(signup),
    emailDelivered: welcome.ok,
  });
}

import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db/settings";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(req: Request) {
  let body: {
    welcome_subject?: unknown;
    welcome_cta_url?: unknown;
    deliverability_confirmed?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: {
    welcome_subject?: string;
    welcome_cta_url?: string;
    deliverability_confirmed?: boolean;
  } = {};

  if (typeof body.welcome_subject === "string") {
    const v = body.welcome_subject.trim().slice(0, 200);
    if (!v) return NextResponse.json({ error: "Subject cannot be empty." }, { status: 400 });
    patch.welcome_subject = v;
  }
  if (typeof body.welcome_cta_url === "string") {
    const v = body.welcome_cta_url.trim().slice(0, 500);
    try {
      void new URL(v);
    } catch {
      return NextResponse.json({ error: "CTA URL must be a valid URL." }, { status: 400 });
    }
    patch.welcome_cta_url = v;
  }
  if (typeof body.deliverability_confirmed === "boolean") {
    patch.deliverability_confirmed = body.deliverability_confirmed;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const settings = await updateSettings(patch);
  if (!settings) {
    return NextResponse.json({ error: "Update failed." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, settings });
}

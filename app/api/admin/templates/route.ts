import { NextResponse } from "next/server";
import { createTemplate } from "@/lib/db/templates";
import { getAdminEmail } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Create a custom email template. */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: unknown;
    description?: unknown;
    subject?: unknown;
    html?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const html = typeof body.html === "string" ? body.html : "";
  if (!name) {
    return NextResponse.json({ error: "A name is required." }, { status: 400 });
  }
  if (!html.trim()) {
    return NextResponse.json({ error: "Template HTML is required." }, { status: 400 });
  }

  const template = await createTemplate({
    name,
    description:
      typeof body.description === "string" ? body.description.trim().slice(0, 200) : "",
    subject:
      typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "",
    html: html.slice(0, 500_000),
  });
  if (!template) {
    return NextResponse.json({ error: "Could not save template." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, template });
}

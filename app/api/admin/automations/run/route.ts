import { NextResponse } from "next/server";
import { getAutomation } from "@/lib/db/automations";
import { runAutomation } from "@/lib/automations/engine";
import { getAdminEmail } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Manually run one automation now (the "Run now" button). Session-authenticated.
 * Runs regardless of the enabled flag so admins can test, but still respects the
 * per-subscriber dedup, so re-running won't re-send to the same people.
 */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.id !== "string") {
    return NextResponse.json({ error: "Provide an automation id." }, { status: 400 });
  }

  const automation = await getAutomation(body.id);
  if (!automation) {
    return NextResponse.json({ error: "Automation not found." }, { status: 404 });
  }

  const result = await runAutomation(automation);
  return NextResponse.json({ ok: true, result });
}

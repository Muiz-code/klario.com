import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { reconcileFromResend } from "@/lib/email/resend-reconcile";
import { logAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Pull real delivery status from Resend and update our email_log + audit rollups.
 * body: { days?: number } — how far back to reconcile (default 15).
 */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let days = 15;
  try {
    const body = (await req.json()) as { days?: unknown };
    if (typeof body.days === "number" && body.days > 0 && body.days <= 90) {
      days = Math.floor(body.days);
    }
  } catch {
    // default window
  }

  const result = await reconcileFromResend(days);
  if (result.error) {
    return NextResponse.json({ error: result.error, ...result }, { status: 502 });
  }
  await logAction("resend.reconcile", { meta: { ...result } });
  return NextResponse.json({ ok: true, ...result });
}

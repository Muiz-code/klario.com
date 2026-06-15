import { NextResponse } from "next/server";
import { processAutomations } from "@/lib/automations/engine";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily automation runner. Configured as a Vercel Cron (see vercel.json).
 *
 * Auth: Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on cron
 * invocations when CRON_SECRET is set in the project env. We require it so the
 * endpoint can't be triggered by anyone else. (Admins use the separate
 * /api/admin/automations/run route for manual, session-authenticated runs.)
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Cron not configured (CRON_SECRET missing)." },
      { status: 503 }
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await processAutomations();
  const totalSent = results.reduce((n, r) => n + r.sent, 0);
  return NextResponse.json({ ok: true, totalSent, results });
}

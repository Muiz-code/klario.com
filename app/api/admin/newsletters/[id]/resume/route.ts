import { NextResponse, after } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { drainForBudget, scheduleSendWorker } from "@/lib/email/newsletterSender";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUDGET_MS = 45_000; // stay under the 60s function limit

/**
 * Resume an in-progress send when the admin closes the progress modal before the
 * queue is drained. Unlike a fire-and-forget ping, this DRAINS the queue itself
 * on this instance (so it works on localhost and prod alike), then hands off to
 * the background worker only if there's still work after the time budget — the
 * self-ping uses the request's own origin, so it never mis-targets production.
 */
export async function POST(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = new URL(req.url).origin;
  after(async () => {
    const stillPending = await drainForBudget(BUDGET_MS);
    if (stillPending) await scheduleSendWorker(origin);
  });

  return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
}

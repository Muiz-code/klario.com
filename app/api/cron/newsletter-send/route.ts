import { NextResponse, after } from "next/server";
import { drainForBudget, scheduleSendWorker } from "@/lib/email/newsletterSender";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUDGET_MS = 45_000; // stay under the 60s function limit
const CHUNK = 400;

/**
 * Background newsletter sender. Drains the send queue in chunks so a large send
 * completes across many invocations and resumes after any interruption.
 *
 * Returns 202 immediately and does the sending in `after()` (post-response),
 * then pings itself again while work remains — a self-sustaining chain that runs
 * WITHOUT a minute-by-minute cron (no Vercel Pro required). The scheduled cron
 * in vercel.json is only a backstop to restart a stalled queue.
 *
 * Auth: `Authorization: Bearer $CRON_SECRET`.
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

  // Do the actual sending after the response is sent, so the caller's request
  // (and this one) return fast and the chain never blocks.
  const origin = new URL(req.url).origin;
  after(async () => {
    const stillPending = await drainForBudget(BUDGET_MS, CHUNK);
    if (stillPending) await scheduleSendWorker(origin);
  });

  return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
}

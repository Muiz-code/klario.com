import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { processSendChunk } from "@/lib/email/newsletterSender";
import { getQueueCounts, getPendingChunk } from "@/lib/db/newsletterQueue";

export const runtime = "nodejs";
export const maxDuration = 60;

const CHUNK = 200;

/**
 * Send the next batch for a newsletter and report progress. Driven by the send
 * progress modal, one call per batch, so the admin watches the send move. Safe
 * because the modal calls it sequentially (one batch at a time).
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const batch = await processSendChunk(id, CHUNK);
  const counts = await getQueueCounts(id);
  const pendingSample = (await getPendingChunk(id, 8)).map((r) => r.email);

  return NextResponse.json({
    ok: true,
    total: counts.total,
    sent: counts.sent,
    failed: counts.failed,
    pending: counts.pending,
    batchSent: batch.sent,
    batchFailed: batch.failed,
    done: counts.pending === 0,
    pendingSample,
  });
}

import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { processSendChunk } from "@/lib/email/newsletterSender";
import { getQueueCounts, getPendingChunk } from "@/lib/db/newsletterQueue";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_BATCH = 50;
const MAX_BATCH = 500;

/**
 * Send the next batch for a newsletter and report progress. Driven by the send
 * progress modal, one call per batch, so the admin watches the send move batch
 * by batch (first N, then the next N, until the queue is drained). Safe because
 * the modal calls it sequentially (one batch at a time). The batch size comes
 * from the modal so the sender can pace the send (default 50).
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let size = DEFAULT_BATCH;
  try {
    const body = (await req.json()) as { size?: unknown };
    if (typeof body.size === "number" && Number.isFinite(body.size)) {
      size = Math.max(1, Math.min(MAX_BATCH, Math.floor(body.size)));
    }
  } catch {
    // no body -> default batch size
  }

  const batch = await processSendChunk(id, size);
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

import { NextResponse } from "next/server";
import { cleanupOrphanImages } from "@/lib/storage/cleanup";
import { logAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Manually delete orphaned (unreferenced) images from the email-assets bucket. */
export async function POST() {
  const result = await cleanupOrphanImages();
  await logAction("storage.cleanup", { meta: { ...result } });
  return NextResponse.json({ ok: true, ...result });
}

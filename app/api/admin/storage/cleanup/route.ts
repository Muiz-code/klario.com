import { NextResponse } from "next/server";
import { cleanupOrphanImages } from "@/lib/storage/cleanup";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Manually delete orphaned (unreferenced) images from the email-assets bucket. */
export async function POST() {
  const result = await cleanupOrphanImages();
  return NextResponse.json({ ok: true, ...result });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAction } from "@/lib/db/adminActivity";

export const runtime = "nodejs";

const BUCKET = "email-assets";
const IMAGE_MAX = 5 * 1024 * 1024; // 5 MB
const PDF_MAX = 15 * 1024 * 1024; // 15 MB
const VIDEO_MAX = 50 * 1024 * 1024; // 50 MB
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  ...VIDEO_TYPES,
]);

const EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * Upload an image, PDF, or video to the public `email-assets` Storage bucket and
 * return its public URL — for embedding an image, attaching a PDF, or linking a
 * hosted video in composed emails. Create the bucket once in Supabase
 * (Storage > New bucket > name "email-assets", public).
 */
export async function POST(req: Request) {
  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f && typeof f !== "string") file = f;
  } catch {
    return NextResponse.json({ error: "Could not read upload." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, GIF, WebP images or PDF files are allowed." },
      { status: 415 }
    );
  }
  const isPdf = file.type === "application/pdf";
  const isVideo = VIDEO_TYPES.has(file.type);
  const maxBytes = isVideo ? VIDEO_MAX : isPdf ? PDF_MAX : IMAGE_MAX;
  if (file.size > maxBytes) {
    const label = isVideo
      ? "Video too large (max 50 MB)."
      : isPdf
        ? "PDF too large (max 15 MB)."
        : "Image too large (max 5 MB).";
    return NextResponse.json({ error: label }, { status: 413 });
  }

  const ext = EXT[file.type] || file.type.split("/")[1] || "bin";
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${new Date().toISOString().slice(0, 10)}/${rand}.${ext}`;

  const db = supabaseAdmin();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await db.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    const hint = /bucket/i.test(error.message)
      ? " Create a public bucket named 'email-assets' in Supabase Storage."
      : "";
    return NextResponse.json({ error: error.message + hint }, { status: 502 });
  }

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  await logAction("image.upload", { target: data.publicUrl });
  return NextResponse.json({ ok: true, url: data.publicUrl });
}

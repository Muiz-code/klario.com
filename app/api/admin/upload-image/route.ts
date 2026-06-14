import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "email-assets";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

/**
 * Upload an image to the public `email-assets` Storage bucket and return its
 * public URL, for embedding in composed emails. Create the bucket once in the
 * Supabase dashboard (Storage > New bucket > name "email-assets", public).
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
      { error: "Only PNG, JPEG, GIF, or WebP images are allowed." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 5 MB)." }, { status: 413 });
  }

  const ext = file.type.split("/")[1] || "png";
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
  return NextResponse.json({ ok: true, url: data.publicUrl });
}

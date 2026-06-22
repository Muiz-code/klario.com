import { NextResponse } from "next/server";
import { incrementDbPostView } from "@/lib/db/blogPosts";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Public: record one view for an admin-authored blog post. */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  if (isSupabaseConfigured() && slug) {
    try {
      await incrementDbPostView(slug);
    } catch {
      // best-effort; never block the reader
    }
  }
  return new NextResponse(null, { status: 204 });
}

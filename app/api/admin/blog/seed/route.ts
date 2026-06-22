import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/supabase/server";
import { getBlogPosts, serializePostBody } from "@/lib/blog";
import { seedDbPosts } from "@/lib/db/blogPosts";

export const runtime = "nodejs";

/** Import the built-in starter posts into the editable blog_posts table. */
export async function POST() {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seed = getBlogPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    image: p.image ?? null,
    body: serializePostBody(p),
    author_name: p.author.name,
    author_role: p.author.role,
    read_time: p.readTime,
    published_at: new Date(`${p.publishedAtIso}T12:00:00Z`).toISOString(),
  }));

  const result = await seedDbPosts(seed);
  return NextResponse.json({ ok: true, ...result });
}

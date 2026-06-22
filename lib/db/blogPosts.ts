import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Block } from "@/lib/legal";
import type { BlogPost, BlogSection } from "@/lib/blog";

/** True for the "table not found" error you get before the migration runs. */
function isMissingTable(e: { code?: string; message?: string } | null): boolean {
  return (
    !!e &&
    (e.code === "PGRST205" ||
      /schema cache|does not exist/i.test(e.message || ""))
  );
}

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string | null;
  body: string;
  author_name: string;
  author_role: string;
  read_time: string | null;
  published: boolean;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostInput = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image?: string | null;
  body: string;
  author_name?: string;
  author_role?: string;
  read_time?: string | null;
  published?: boolean;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function estimateReadTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/**
 * Parse a markdown-lite body into the section/block shape the blog renderer
 * already understands. Rules: a line starting "## " begins a new titled
 * section, lines starting "- " group into a bullet list, blank lines break
 * paragraphs, everything else is body copy.
 */
export function parseBody(body: string): BlogSection[] {
  const sections: BlogSection[] = [];
  let current: BlogSection = { blocks: [] };
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      current.blocks.push({ type: "p", text: para.join(" ").trim() } as Block);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      current.blocks.push({ type: "list", items: [...list] } as Block);
      list = [];
    }
  };
  const pushSection = () => {
    flushPara();
    flushList();
    if (current.title || current.blocks.length) sections.push(current);
  };

  for (const raw of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
    } else if (line.startsWith("## ")) {
      pushSection();
      current = { title: line.slice(3).trim(), blocks: [] };
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2).trim());
    } else {
      flushList();
      para.push(line);
    }
  }
  pushSection();

  return sections.length ? sections : [{ blocks: [{ type: "p", text: body } as Block] }];
}

/** Map a DB row to the public BlogPost shape used across the blog UI. */
export function rowToPost(r: BlogPostRow): BlogPost {
  const when = r.published_at ?? r.created_at;
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: r.category,
    image: r.image ?? undefined,
    publishedAt: formatDate(when),
    publishedAtIso: when.slice(0, 10),
    readTime: r.read_time || estimateReadTime(r.body),
    author: { name: r.author_name, role: r.author_role },
    sections: parseBody(r.body),
  };
}

/** Published posts for the public blog. */
export async function listPublishedDbPosts(): Promise<BlogPost[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(500);
  if (error) {
    if (!isMissingTable(error)) {
      console.error("[db] listPublishedDbPosts failed:", error.message);
    }
    return [];
  }
  return (data as BlogPostRow[]).map(rowToPost);
}

/** A single published post by slug (public). */
export async function getDbPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    if (!isMissingTable(error)) {
      console.error("[db] getDbPostBySlug failed:", error.message);
    }
    return null;
  }
  return data ? rowToPost(data as BlogPostRow) : null;
}

/** All posts (any status) for the admin list. */
export async function listAllDbPosts(): Promise<BlogPostRow[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    if (!isMissingTable(error)) {
      console.error("[db] listAllDbPosts failed:", error.message);
    }
    return [];
  }
  return (data ?? []) as BlogPostRow[];
}

export async function getDbPostRow(id: string): Promise<BlogPostRow | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db] getDbPostRow failed:", error.message);
    return null;
  }
  return (data as BlogPostRow) ?? null;
}

export async function createDbPost(
  input: BlogPostInput
): Promise<{ id: string } | { error: string }> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("blog_posts")
    .insert({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      category: input.category,
      image: input.image ?? null,
      body: input.body,
      author_name: input.author_name || "Klario Team",
      author_role: input.author_role || "Product",
      read_time: input.read_time ?? null,
      published: input.published ?? false,
      published_at: input.published ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { error: "That slug is already in use." };
    console.error("[db] createDbPost failed:", error.message);
    return { error: "Could not save the post." };
  }
  return { id: data.id as string };
}

export async function updateDbPost(
  id: string,
  input: BlogPostInput
): Promise<{ ok: true } | { error: string }> {
  const db = supabaseAdmin();
  // Stamp published_at the first time a post goes live.
  const existing = await getDbPostRow(id);
  const publishedAt =
    input.published && !existing?.published_at
      ? new Date().toISOString()
      : existing?.published_at ?? null;

  const { error } = await db
    .from("blog_posts")
    .update({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      category: input.category,
      image: input.image ?? null,
      body: input.body,
      author_name: input.author_name || "Klario Team",
      author_role: input.author_role || "Product",
      read_time: input.read_time ?? null,
      published: input.published ?? false,
      published_at: input.published ? publishedAt : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") return { error: "That slug is already in use." };
    console.error("[db] updateDbPost failed:", error.message);
    return { error: "Could not update the post." };
  }
  return { ok: true };
}

export async function deleteDbPost(id: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db.from("blog_posts").delete().eq("id", id);
  if (error) {
    console.error("[db] deleteDbPost failed:", error.message);
    return false;
  }
  return true;
}

export type BlogPostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string | null;
  body: string;
  author_name: string;
  author_role: string;
  read_time: string | null;
  published_at: string;
};

/** Insert seed posts that aren't already in the table (matched by slug). */
export async function seedDbPosts(
  seed: BlogPostSeed[]
): Promise<{ added: number; skipped: number }> {
  const db = supabaseAdmin();
  const { data: existing, error: readErr } = await db
    .from("blog_posts")
    .select("slug")
    .limit(5000);
  if (readErr) {
    console.error("[db] seedDbPosts read failed:", readErr.message);
    return { added: 0, skipped: seed.length };
  }
  const have = new Set((existing ?? []).map((r) => r.slug as string));
  const rows = seed
    .filter((s) => !have.has(s.slug))
    .map((s) => ({ ...s, published: true, views: 0 }));
  if (rows.length === 0) return { added: 0, skipped: seed.length };

  const { error } = await db.from("blog_posts").insert(rows);
  if (error) {
    console.error("[db] seedDbPosts insert failed:", error.message);
    return { added: 0, skipped: seed.length };
  }
  return { added: rows.length, skipped: seed.length - rows.length };
}

/** Increment the public view counter for a published post. */
export async function incrementDbPostView(slug: string): Promise<void> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("blog_posts")
    .select("id, views")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return;
  await db
    .from("blog_posts")
    .update({ views: (data.views as number) + 1 })
    .eq("id", data.id as string);
}

import type { BlogPostInput } from "@/lib/db/blogPosts";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Validate an incoming post payload into a BlogPostInput, or return an error. */
export function parsePostBody(
  body: Record<string, unknown>
): BlogPostInput | { error: string } {
  const title = clean(body.title, 160);
  const content = clean(body.body, 60000);
  if (!title) return { error: "A title is required." };
  if (!content) return { error: "Post body cannot be empty." };

  const slug = slugify(clean(body.slug, 80) || title);
  if (!slug) return { error: "Could not derive a slug from the title." };

  return {
    title,
    slug,
    body: content,
    excerpt: clean(body.excerpt, 320),
    category: clean(body.category, 40) || "Money Tips",
    image: clean(body.image, 500) || null,
    author_name: clean(body.author_name, 80) || "Klario Team",
    author_role: clean(body.author_role, 80) || "Product",
    read_time: clean(body.read_time, 24) || null,
    published: body.published === true,
  };
}

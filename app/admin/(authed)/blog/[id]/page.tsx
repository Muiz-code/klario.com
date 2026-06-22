import { notFound } from "next/navigation";
import { getDbPostRow } from "@/lib/db/blogPosts";
import { PostForm, type PostFormValues } from "../PostForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getDbPostRow(id);
  if (!row) notFound();

  const initial: PostFormValues = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    excerpt: row.excerpt,
    image: row.image ?? "",
    author_name: row.author_name,
    author_role: row.author_role,
    read_time: row.read_time ?? "",
    body: row.body,
    published: row.published,
  };

  return <PostForm initial={initial} />;
}

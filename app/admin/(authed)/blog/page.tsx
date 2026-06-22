import Link from "next/link";
import { PenLine, Eye } from "lucide-react";
import { listAllDbPosts } from "@/lib/db/blogPosts";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { PostRowActions } from "./PostRowActions";
import { SeedButton } from "./SeedButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const configured = isSupabaseConfigured();
  const posts = configured ? await listAllDbPosts() : [];
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-bg">Blog</h1>
          <p className="mt-1 text-sm text-bg/55">
            Write and publish posts to the website, and see how many people read
            each one.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SeedButton />
          <Link
            href="/p@ss1/blog/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            <PenLine size={16} />
            Compose post
          </Link>
        </div>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured yet.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Stat label="Posts" value={posts.length} />
        <Stat label="Published" value={posts.filter((p) => p.published).length} />
        <Stat label="Total reads" value={totalViews} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-bg/10">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-bg/10 bg-bg/4 text-left text-[11px] uppercase tracking-[0.14em] text-bg/45">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reads</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-bg/45">
                  No posts yet. Click &quot;Compose post&quot; to write your first one.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-bg/8 last:border-0 hover:bg-bg/3"
                >
                  <td className="px-4 py-3">
                    <span className="text-bg/85">{p.title}</span>
                    <span className="ml-2 font-mono text-[11px] text-bg/35">
                      /{p.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[11px] " +
                        (p.published
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-bg/10 text-bg/55")
                      }
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-bg/60">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye size={13} className="text-bg/40" />
                      {p.views.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-bg/55">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PostRowActions id={p.id} slug={p.slug} published={p.published} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-bg/10 bg-bg/4 px-4 py-3">
      <p className="font-display text-2xl text-bg">{value.toLocaleString()}</p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-bg/45">{label}</p>
    </div>
  );
}

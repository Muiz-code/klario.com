"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Personal Finance",
  "Money Tips",
  "Technology",
  "Security",
  "Savings",
  "Budgeting",
];

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image: string;
  author_name: string;
  author_role: string;
  read_time: string;
  body: string;
  published: boolean;
};

const input =
  "w-full rounded-lg border border-bg/15 bg-bg/5 px-3 py-2 text-sm text-bg placeholder:text-bg/30 focus:border-gold focus:outline-none";
const label = "text-[12px] font-medium uppercase tracking-[0.14em] text-bg/50";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function PostForm({ initial }: { initial?: PostFormValues }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState<PostFormValues>(
    initial ?? {
      title: "",
      slug: "",
      category: "Money Tips",
      excerpt: "",
      image: "",
      author_name: "Klario Team",
      author_role: "Product",
      read_time: "",
      body: "",
      published: false,
    }
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof PostFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const onTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((p) => ({
      ...p,
      title,
      slug: slugTouched ? p.slug : slugify(title),
    }));
  };

  const submit = async (published: boolean) => {
    setBusy(true);
    setError(null);
    const payload = { ...form, published };
    const res = await fetch(
      editing ? `/api/admin/blog/${initial!.id}` : "/api/admin/blog",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      router.push("/p@ss1/blog");
      router.refresh();
    } else {
      setError(data.error || "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/p@ss1/blog"
            className="inline-flex items-center gap-1.5 text-xs text-bg/50 hover:text-gold"
          >
            <ArrowLeft size={14} /> Back to posts
          </Link>
          <h1 className="mt-2 font-display text-3xl text-bg">
            {editing ? "Edit post" : "Compose post"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Main column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className={label}>Title</span>
            <input
              value={form.title}
              onChange={onTitle}
              placeholder="It's 2026. Stop budgeting in a spreadsheet."
              className={input}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={label}>Excerpt</span>
            <textarea
              value={form.excerpt}
              onChange={set("excerpt")}
              rows={2}
              placeholder="One or two sentences that sell the read."
              className={`${input} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className={label}>Body</span>
              <span className="text-[11px] text-bg/35">
                &quot;## &quot; heading · &quot;- &quot; bullet · blank line = new paragraph
              </span>
            </div>
            <textarea
              value={form.body}
              onChange={set("body")}
              rows={18}
              placeholder={
                "Open with a hook paragraph.\n\n## A section heading\n\nSome supporting copy.\n\n- A bullet point\n- Another bullet point"
              }
              className={`${input} resize-y font-mono text-[13px] leading-relaxed`}
            />
          </div>
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className={label}>Slug</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug")(e);
              }}
              placeholder="auto-from-title"
              className={`${input} font-mono text-[13px]`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={label}>Category</span>
            <select value={form.category} onChange={set("category")} className={input}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="text-ink">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={label}>Cover image URL</span>
            <input
              value={form.image}
              onChange={set("image")}
              placeholder="https://images.unsplash.com/..."
              className={input}
            />
            <span className="text-[11px] text-bg/35">
              Leave blank to use a branded graphic cover.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className={label}>Author</span>
              <input value={form.author_name} onChange={set("author_name")} className={input} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={label}>Role</span>
              <input value={form.author_role} onChange={set("author_role")} className={input} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={label}>Read time (optional)</span>
            <input
              value={form.read_time}
              onChange={set("read_time")}
              placeholder="auto-estimated"
              className={input}
            />
          </div>

          <div className="mt-2 flex flex-col gap-2 border-t border-bg/10 pt-4">
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink hover:scale-[1.01] disabled:opacity-60"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Save & publish" : "Publish post"}
            </button>
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-full border border-bg/15 px-5 py-2.5 text-sm text-bg/75 hover:border-bg/30 hover:text-bg disabled:opacity-60"
            >
              Save as draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

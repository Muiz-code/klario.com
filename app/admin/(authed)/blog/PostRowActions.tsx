"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

export function PostRowActions({
  id,
  slug,
  published,
}: {
  id: string;
  slug: string;
  published: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const remove = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    setBusy(false);
    setConfirm(false);
    if (res.ok) startTransition(() => router.refresh());
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {published && (
        <Link
          href={`/blog/${slug}`}
          target="_blank"
          aria-label="View on site"
          className="rounded-md p-1.5 text-bg/55 hover:bg-bg/10 hover:text-bg"
        >
          <ExternalLink size={14} />
        </Link>
      )}
      <Link
        href={`/p@ss1/blog/${id}`}
        aria-label="Edit"
        className="rounded-md p-1.5 text-bg/55 hover:bg-gold/10 hover:text-gold"
      >
        <Pencil size={14} />
      </Link>
      {confirm ? (
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={remove}
            disabled={busy || pending}
            className="rounded-md px-2 py-1 text-[11px] text-red-300 hover:bg-red-400/10 disabled:opacity-50"
          >
            {busy ? "..." : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="rounded-md px-2 py-1 text-[11px] text-bg/50 hover:text-bg"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          aria-label="Delete"
          className="rounded-md p-1.5 text-bg/55 hover:bg-red-400/10 hover:text-red-300"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DownloadCloud, Loader2 } from "lucide-react";

export function SeedButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/blog/seed", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setMsg(
        data.added > 0
          ? `Imported ${data.added} post${data.added === 1 ? "" : "s"}.`
          : "All starter posts are already imported."
      );
      startTransition(() => router.refresh());
    } else {
      setMsg(data.error || "Import failed.");
    }
  };

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-[12px] text-bg/55">{msg}</span>}
      <button
        type="button"
        onClick={run}
        disabled={busy || pending}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-bg/15 px-4 py-2.5 text-sm text-bg/75 transition-colors hover:border-bg/30 hover:text-bg disabled:opacity-50"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <DownloadCloud size={15} />}
        Import starter posts
      </button>
    </div>
  );
}

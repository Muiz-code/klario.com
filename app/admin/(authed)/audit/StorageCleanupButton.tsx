"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { InfoModal } from "../_components/Modal";

export function StorageCleanupButton() {
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<{ title: string; message: string; ok?: boolean } | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/storage/cleanup", { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInfo({ title: "Cleanup failed", message: d.error || "Try again.", ok: false });
        return;
      }
      const mb = (d.freedBytes / (1024 * 1024)).toFixed(2);
      setInfo({
        title: "Storage cleaned",
        message:
          d.deleted > 0
            ? `Deleted ${d.deleted} unused image${d.deleted === 1 ? "" : "s"} (${mb} MB freed). ${d.kept} kept.`
            : `Nothing to clean. ${d.kept} image${d.kept === 1 ? "" : "s"} in use.`,
        ok: true,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl border border-bg/15 px-3.5 py-2 text-sm text-bg/80 hover:border-gold/40 hover:text-bg disabled:opacity-50"
        title="Delete images not used by any newsletter"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        Clean up storage
      </button>
      <InfoModal state={info} onClose={() => setInfo(null)} />
    </>
  );
}

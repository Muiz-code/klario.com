"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { InfoModal } from "../_components/Modal";

/**
 * Pulls real delivery status from Resend (source of truth) into our email_log +
 * audit rollups, so DELIVERED/OPENED are accurate even when webhooks miss events.
 */
export function SyncFromResendButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<{ title: string; message: string; ok?: boolean } | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/resend-reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 15 }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInfo({
          title: "Sync failed",
          message: d.error || "Could not reach Resend. Try again.",
          ok: false,
        });
        return;
      }
      const parts: string[] = [];
      if (d.updated > 0)
        parts.push(`updated ${d.updated} (${d.delivered} delivered, ${d.opened} opened, ${d.bounced} bounced)`);
      if (d.inserted > 0) parts.push(`backfilled ${d.inserted} missing`);
      if (d.audits > 0) parts.push(`${d.audits} campaign${d.audits === 1 ? "" : "s"} refreshed`);
      setInfo({
        title: d.skipped ? "Sync already running" : "Synced from Resend",
        message: d.skipped
          ? "Another sync is in progress — try again in a moment."
          : parts.length
            ? `Done: ${parts.join(" · ")}.`
            : `Everything was already up to date (${d.matched} checked against Resend).`,
        ok: true,
      });
      router.refresh();
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
        title="Pull real delivery status from Resend (last 15 days)"
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <RefreshCw size={14} />
        )}
        {busy ? "Syncing…" : "Sync from Resend"}
      </button>
      <InfoModal state={info} onClose={() => setInfo(null)} />
    </>
  );
}

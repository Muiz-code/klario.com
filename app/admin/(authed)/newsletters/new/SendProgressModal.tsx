"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, X, AlertTriangle } from "lucide-react";

type Progress = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  batchSent: number;
  done: boolean;
  pendingSample: string[];
};

/**
 * Drives a newsletter send one batch at a time and shows live progress. Keeping
 * it open is what advances the send; closing early hands the rest to the
 * background worker (via /resume).
 */
export function SendProgressModal({
  newsletterId,
  total,
  onClose,
}: {
  newsletterId: string;
  total: number;
  onClose: () => void;
}) {
  const [p, setP] = useState<Progress>({
    total,
    sent: 0,
    failed: 0,
    pending: total,
    batchSent: 0,
    done: total === 0,
    pendingSample: [],
  });
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    (async () => {
      // Keep sending the next batch until the queue is drained.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (cancelled.current) return;
        try {
          const res = await fetch(`/api/admin/newsletters/${newsletterId}/process`, {
            method: "POST",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error || "Sending hit a snag. It will keep retrying.");
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          if (cancelled.current) return;
          setP({
            total: data.total ?? total,
            sent: data.sent ?? 0,
            failed: data.failed ?? 0,
            pending: data.pending ?? 0,
            batchSent: data.batchSent ?? 0,
            done: !!data.done,
            pendingSample: data.pendingSample ?? [],
          });
          if (data.done) return;
          await new Promise((r) => setTimeout(r, 250)); // let the UI breathe
        } catch {
          setError("Network hiccup — retrying…");
          await new Promise((r) => setTimeout(r, 2500));
        }
      }
    })();
    return () => {
      cancelled.current = true;
    };
  }, [newsletterId, total]);

  const pct = p.total > 0 ? Math.round(((p.sent + p.failed) / p.total) * 100) : 100;

  const close = async () => {
    cancelled.current = true;
    // Not finished? Let the background worker take it the rest of the way.
    if (!p.done && p.pending > 0) {
      const ok = window.confirm(
        `${p.pending} still not sent. Close anyway? The rest will keep sending in the background.`
      );
      if (!ok) return;
      fetch(`/api/admin/newsletters/${newsletterId}/resume`, { method: "POST" }).catch(
        () => {}
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl">
        <div className="flex items-center justify-between border-b border-bg/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            {p.done ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <Loader2 size={18} className="animate-spin text-gold" />
            )}
            <p className="text-sm font-semibold text-bg">
              {p.done ? "All sent" : "Sending…"}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1.5 text-bg/50 hover:bg-bg/5 hover:text-bg"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {!p.done && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2.5 text-[12.5px] text-amber-200/90">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Keep this open until it finishes. If you close, the rest still
                send in the background — this just lets you watch it.
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[13px]">
              <span className="font-medium text-bg">
                {p.sent + p.failed} / {p.total}
              </span>
              <span className="text-bg/55">{pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-bg/10">
              <div
                className="h-full rounded-full bg-gold transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-bg/10 bg-bg/[0.03] py-2.5">
              <p className="font-display text-xl text-emerald-400">{p.sent}</p>
              <p className="text-[11px] text-bg/50">Delivered</p>
            </div>
            <div className="rounded-lg border border-bg/10 bg-bg/[0.03] py-2.5">
              <p className="font-display text-xl text-bg/80">{p.pending}</p>
              <p className="text-[11px] text-bg/50">Not sent yet</p>
            </div>
            <div className="rounded-lg border border-bg/10 bg-bg/[0.03] py-2.5">
              <p className={"font-display text-xl " + (p.failed ? "text-red-300" : "text-bg/50")}>
                {p.failed}
              </p>
              <p className="text-[11px] text-bg/50">Failed</p>
            </div>
          </div>

          {!p.done && (
            <p className="text-center text-[12px] text-bg/45">
              {p.batchSent > 0
                ? `Last batch: ${p.batchSent} sent · sending the next…`
                : "Sending the next batch…"}
            </p>
          )}

          {/* People not sent to */}
          {p.pending > 0 && p.pendingSample.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-[0.12em] text-bg/45">
                Still to send ({p.pending})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.pendingSample.map((e) => (
                  <span
                    key={e}
                    className="rounded-full border border-bg/12 bg-bg/[0.03] px-2.5 py-1 text-[12px] text-bg/70"
                  >
                    {e}
                  </span>
                ))}
                {p.pending > p.pendingSample.length && (
                  <span className="px-2 py-1 text-[12px] text-bg/40">
                    +{p.pending - p.pendingSample.length} more
                  </span>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="text-[12px] text-amber-300/80">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-bg/10 px-6 py-4">
          {p.done ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              className="rounded-lg border border-bg/15 px-4 py-2 text-sm text-bg/70 hover:text-bg"
            >
              Close (finish in background)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

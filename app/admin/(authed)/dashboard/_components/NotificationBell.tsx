"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, RotateCw, AlertTriangle } from "lucide-react";
import type { FailedSend } from "@/lib/db/email-log";

export function NotificationBell({ failures }: { failures: FailedSend[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const count = failures.length;

  const retry = async (ids: string[]) => {
    if (ids.length === 0 || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/email/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setNotice(data.error || "Retry failed.");
      else {
        setNotice(`Resent ${data.sent}, failed ${data.failed}.`);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const allIds = failures.map((f) => f.id);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-bg/12 bg-bg/4 text-bg/70 hover:border-gold/40 hover:text-bg"
      >
        <Bell size={16} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl">
          <div className="flex items-center justify-between border-b border-bg/10 px-4 py-3">
            <span className="text-[13px] font-medium text-bg">Failed sends</span>
            {count > 0 && (
              <button
                type="button"
                onClick={() => retry(allIds)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-[11px] font-medium text-ink disabled:opacity-50"
              >
                <RotateCw size={11} className={busy ? "animate-spin" : ""} /> Retry all
              </button>
            )}
          </div>

          {notice && (
            <div className="border-b border-bg/10 px-4 py-2 text-[12px] text-bg/70">
              {notice}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? (
              <p className="px-4 py-6 text-center text-[12px] text-bg/45">
                No failed sends. You&apos;re all caught up.
              </p>
            ) : (
              <ul className="flex flex-col">
                {failures.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-start gap-2.5 border-b border-bg/8 px-4 py-2.5 last:border-0"
                  >
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-300" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-bg/85">{f.email}</p>
                      <p className="truncate text-[11px] text-bg/45">
                        {f.type} · {f.error || "send failed"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => retry([f.id])}
                      disabled={busy}
                      className="shrink-0 rounded-md px-2 py-1 text-[11px] text-bg/60 hover:bg-bg/8 hover:text-bg disabled:opacity-40"
                    >
                      Retry
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

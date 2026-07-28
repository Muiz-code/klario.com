"use client";

import { useEffect, useState } from "react";
import { Send, AlertTriangle, RefreshCw } from "lucide-react";

type Win = {
  sent: number;
  limit: number;
  remaining: number;
  delivered: number;
  opened: number;
};
type Usage = {
  day: Win;
  month: Win;
  approximate: boolean;
  asOf: string;
  error?: string;
};

function fmt(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

function barColor(ratio: number): string {
  if (ratio >= 1) return "bg-red-400";
  if (ratio >= 0.8) return "bg-amber-400";
  return "bg-gold";
}

function Meter({
  label,
  win,
  approximate,
}: {
  label: string;
  win: Win;
  approximate?: boolean;
}) {
  const ratio = win.limit > 0 ? win.sent / win.limit : 0;
  const pct = Math.min(100, Math.round(ratio * 100));
  return (
    <div className="min-w-31">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.12em] text-bg/40">
          {label}
        </span>
        <span className="text-[12px] text-bg/70">
          <span className="font-semibold text-bg">
            {approximate ? "≥" : ""}
            {fmt(win.sent)}
          </span>
          <span className="text-bg/40"> / {fmt(win.limit)}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg/10">
        <div
          className={"h-full rounded-full transition-[width] duration-500 " + barColor(ratio)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex items-center gap-2 text-[10.5px] text-bg/45">
        <span className="text-emerald-400/80">{fmt(win.delivered)} delivered</span>
        <span>·</span>
        <span>{fmt(win.opened)} opened</span>
      </div>
    </div>
  );
}

/**
 * Live Resend send usage — daily + monthly — read from Resend itself via
 * /api/admin/resend-usage (cached 60s server-side, refreshed here every 60s).
 * `fallbackDay` shows our own logged count until the first Resend response lands.
 */
export function ResendUsage({ fallbackDay }: { fallbackDay: number }) {
  const [u, setU] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errored, setErrored] = useState(false);

  const load = async (opts?: { force?: boolean }) => {
    if (opts?.force) setRefreshing(true);
    try {
      const res = await fetch(
        `/api/admin/resend-usage${opts?.force ? "?force=1" : ""}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as Usage;
      if (res.ok && !data.error) {
        setU(data);
        setErrored(false);
      } else {
        setErrored(true);
      }
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!u) {
    // No Resend data yet. Be honest about what the number is: while loading we
    // show our logged count clearly labelled "logged"; on error we say so
    // rather than passing a stale number off as the live Resend figure.
    return (
      <button
        type="button"
        onClick={() => load({ force: true })}
        title={errored ? "Couldn't reach Resend — click to retry" : "Loading from Resend…"}
        className="inline-flex items-center gap-1.5 rounded-xl border border-bg/12 bg-bg/4 px-3 py-2 text-[13px] text-bg/70 hover:border-gold/40"
      >
        {errored ? (
          <AlertTriangle size={13} className="text-amber-400" />
        ) : (
          <Send size={13} className={"text-gold " + (loading ? "animate-pulse" : "")} />
        )}
        {errored ? (
          <span>Resend unavailable</span>
        ) : (
          <>
            <span className="font-medium text-bg">{fallbackDay}</span>
            <span className="text-bg/45"> logged today</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-4 rounded-xl border border-bg/12 bg-bg/4 px-3.5 py-2"
      title={
        u.error
          ? `Resend unreachable — showing last known. (${u.error})`
          : `Live from Resend · updated ${new Date(u.asOf).toLocaleTimeString()}`
      }
    >
      <Send size={14} className="shrink-0 text-gold" />
      <Meter label="Today" win={u.day} />
      <div className="h-10 w-px bg-bg/10" />
      <Meter label="This month" win={u.month} approximate={u.approximate} />
      {u.error && (
        <AlertTriangle size={13} className="shrink-0 text-amber-400" />
      )}
      <button
        type="button"
        onClick={() => load({ force: true })}
        disabled={refreshing}
        aria-label="Refresh from Resend"
        title="Refresh now from Resend"
        className="shrink-0 rounded-md p-1 text-bg/40 hover:bg-bg/10 hover:text-bg disabled:opacity-50"
      >
        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

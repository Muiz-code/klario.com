"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmt(key: string, withYear: boolean): string {
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
  });
}

type Preset = { label: string; range: () => { from: string; to: string } };

const PRESETS: Preset[] = [
  {
    label: "Today",
    range: () => {
      const t = ymd(new Date());
      return { from: t, to: t };
    },
  },
  {
    label: "Yesterday",
    range: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const t = ymd(d);
      return { from: t, to: t };
    },
  },
  {
    label: "Last 7 days",
    range: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 6);
      return { from: ymd(from), to: ymd(to) };
    },
  },
  {
    label: "Last 30 days",
    range: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 29);
      return { from: ymd(from), to: ymd(to) };
    },
  },
  {
    label: "Last 90 days",
    range: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 89);
      return { from: ymd(from), to: ymd(to) };
    },
  },
  {
    label: "This month",
    range: () => {
      const to = new Date();
      const from = new Date(to.getFullYear(), to.getMonth(), 1);
      return { from: ymd(from), to: ymd(to) };
    },
  },
  {
    label: "This year",
    range: () => {
      const to = new Date();
      const from = new Date(to.getFullYear(), 0, 1);
      return { from: ymd(from), to: ymd(to) };
    },
  },
];

export function DateRangePicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const apply = (f: string, t: string) => {
    setOpen(false);
    const range = Date.parse(f) <= Date.parse(t) ? { f, t } : { f: t, t: f };
    router.push(`/p@ss1/dashboard?from=${range.f}&to=${range.t}`);
  };

  const reset = () => {
    setOpen(false);
    router.push("/p@ss1/dashboard");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setDraftFrom(from);
          setDraftTo(to);
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-bg/12 bg-bg/4 px-3.5 py-2 text-[13px] text-bg/70 hover:border-gold/40 hover:text-bg"
      >
        <Calendar size={14} className="text-gold" />
        {!from || !to
          ? "Pick a range"
          : from === to
            ? fmt(to, true)
            : `${fmt(from, false)} - ${fmt(to, true)}`}
        <ChevronDown size={13} className="text-bg/45" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-bg/12 bg-[#0d0e12] p-3 shadow-2xl">
          <div className="flex flex-col gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  const r = p.range();
                  apply(r.from, r.to);
                }}
                className="rounded-lg px-3 py-1.5 text-left text-[13px] text-bg/70 hover:bg-bg/8 hover:text-bg"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="my-3 h-px bg-bg/10" />

          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between gap-2 text-[12px] text-bg/55">
              From
              <input
                type="date"
                value={draftFrom}
                max={draftTo || undefined}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-[13px] text-bg scheme-dark focus:border-gold/50 focus:outline-none"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-[12px] text-bg/55">
              To
              <input
                type="date"
                value={draftTo}
                min={draftFrom || undefined}
                onChange={(e) => setDraftTo(e.target.value)}
                className="rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-[13px] text-bg scheme-dark focus:border-gold/50 focus:outline-none"
              />
            </label>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-bg/15 px-3 py-1.5 text-[13px] text-bg/70 hover:border-bg/30 hover:text-bg"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => draftFrom && draftTo && apply(draftFrom, draftTo)}
                disabled={!draftFrom || !draftTo}
                className="flex-1 rounded-lg bg-gold px-3 py-1.5 text-[13px] font-medium text-ink transition-transform hover:scale-[1.01] disabled:opacity-40"
              >
                Apply range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

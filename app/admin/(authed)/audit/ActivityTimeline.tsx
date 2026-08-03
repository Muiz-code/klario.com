"use client";

import { useMemo, useState } from "react";
import { Search, History, ShieldCheck } from "lucide-react";
import type { TimelineEvent, TimelineSource } from "@/lib/db/activityTimeline";

const SOURCE_STYLE: Record<TimelineSource, string> = {
  logged: "border-emerald-400/25 text-emerald-200/80",
  send: "border-gold/25 text-gold/80",
  reconstructed: "border-bg/15 text-bg/40",
};
const SOURCE_LABEL: Record<TimelineSource, string> = {
  logged: "logged",
  send: "send",
  reconstructed: "reconstructed",
};

/**
 * Everything that happened on the admin: who did what, when. Filterable by
 * person and area. Reconstructed rows (inferred from old data, before actions
 * were logged) are marked and can be hidden.
 */
export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  const [q, setQ] = useState("");
  const [actor, setActor] = useState("all");
  const [area, setArea] = useState("all");
  const [showHistory, setShowHistory] = useState(true);

  const actors = useMemo(
    () => [...new Set(events.map((e) => e.actor).filter(Boolean))].sort() as string[],
    [events]
  );
  const areas = useMemo(
    () => [...new Set(events.map((e) => e.area))].sort(),
    [events]
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return events.filter((e) => {
      if (!showHistory && e.source === "reconstructed") return false;
      if (actor !== "all" && e.actor !== actor) return false;
      if (area !== "all" && e.area !== area) return false;
      if (!needle) return true;
      return [e.actor, e.description, e.target, e.area]
        .map((v) => (v ?? "").toLowerCase())
        .some((v) => v.includes(needle));
    });
  }, [events, q, actor, area, showHistory]);

  const select =
    "rounded-lg border border-bg/15 bg-bg/[0.03] px-2.5 py-2 text-[13px] text-bg/80 scheme-dark focus:border-gold/50 focus:outline-none";
  // The native dropdown popup is drawn by the OS on a white background, so the
  // options need their own dark background or they're unreadable.
  const opt = "bg-[#16181d] text-bg";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bg/40" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search person, action or target…"
            className="w-full rounded-lg border border-bg/15 bg-bg/[0.03] py-2 pl-9 pr-3 text-sm text-bg placeholder:text-bg/40 focus:border-gold/50 focus:outline-none"
          />
        </div>
        <select value={actor} onChange={(e) => setActor(e.target.value)} className={select}>
          <option value="all" className={opt}>Everyone</option>
          {actors.map((a) => (
            <option key={a} value={a} className={opt}>
              {a}
            </option>
          ))}
        </select>
        <select value={area} onChange={(e) => setArea(e.target.value)} className={select}>
          <option value="all" className={opt}>All areas</option>
          {areas.map((a) => (
            <option key={a} value={a} className={opt}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          title="Events inferred from data created before action logging existed"
          className={
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] transition-colors " +
            (showHistory
              ? "border-gold/40 text-gold"
              : "border-bg/15 text-bg/60 hover:text-bg")
          }
        >
          <History size={14} /> Older history
        </button>
      </div>

      <p className="text-[12px] text-bg/40">
        {rows.length.toLocaleString()} event{rows.length === 1 ? "" : "s"} ·{" "}
        <span className="text-emerald-200/70">logged</span> = actor recorded at the time ·{" "}
        <span className="text-bg/50">reconstructed</span> = inferred from older data, actor
        usually unknown
      </p>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-bg/10 bg-bg/4 p-6 text-sm text-bg/55">
          Nothing matches those filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-bg/10">
          <ul className="max-h-[70vh] overflow-y-auto">
            {rows.map((e) => (
              <li
                key={e.id}
                className="flex items-start justify-between gap-3 border-b border-bg/6 px-4 py-2.5 text-[13px] last:border-0"
              >
                <span className="min-w-0 text-bg/85">
                  <span className={e.actor ? "text-gold/80" : "text-bg/35"}>
                    {e.actor ?? "unknown"}
                  </span>{" "}
                  {e.description}
                  {e.target && <span className="text-bg/50"> · {e.target}</span>}
                  {e.source === "send" && e.meta ? (
                    <span className="text-bg/35">
                      {" "}
                      · {String(e.meta.sent ?? 0)}/{String(e.meta.recipients ?? 0)} sent
                    </span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    title={
                      e.source === "reconstructed"
                        ? "Inferred from existing data — not recorded at the time"
                        : "Recorded when it happened"
                    }
                    className={
                      "rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] " +
                      SOURCE_STYLE[e.source]
                    }
                  >
                    {SOURCE_LABEL[e.source]}
                  </span>
                  <span suppressHydrationWarning className="text-[11px] text-bg/40">
                    {new Date(e.at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[11.5px] text-bg/35">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        Every mutating admin action now writes an entry as it happens. Anything older than
        that logging is reconstructed from the records themselves, so the person who did it
        was usually never captured.
      </p>
    </div>
  );
}

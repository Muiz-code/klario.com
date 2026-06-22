"use client";

import { useState } from "react";
import { TrendChart } from "./TrendChart";
import type { GrowthSeries } from "@/lib/db/analytics";

const RANGES = [
  { key: "30", label: "30D" },
  { key: "90", label: "90D" },
  { key: "365", label: "1Y" },
  { key: "all", label: "All" },
];

/**
 * Audience growth chart with its own range filter, independent of the
 * dashboard's date picker - it always shows the overall running subscriber
 * total, narrowed to the selected window.
 */
export function AudienceGrowth({
  initial,
  initialKey = "all",
  className,
}: {
  initial: GrowthSeries;
  initialKey?: string;
  className?: string;
}) {
  const [data, setData] = useState<GrowthSeries>(initial);
  const [active, setActive] = useState(initialKey);
  const [loading, setLoading] = useState(false);

  const select = async (key: string) => {
    if (key === active || loading) return;
    setActive(key);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/growth?days=${key}`);
      const d = await res.json().catch(() => null);
      if (d && Array.isArray(d.days)) setData(d as GrowthSeries);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={"rounded-2xl border border-bg/10 bg-bg/4 p-5 " + (className ?? "")}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg text-bg">Audience growth</p>
          <p className="mt-0.5 text-[12px] text-bg/50">
            Total subscribers over time
          </p>
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-bg/12 bg-bg/4 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => select(r.key)}
              className={
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors " +
                (active === r.key
                  ? "bg-gold text-ink"
                  : "text-bg/55 hover:text-bg")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.days.length > 0 ? (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <TrendChart
            days={data.days}
            legend="last"
            lines={[
              {
                key: "subscribers",
                label: "Subscribers",
                values: data.values,
                color: "#d4a853",
              },
            ]}
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-bg/10 text-[12px] text-bg/40">
          No data yet.
        </div>
      )}
    </div>
  );
}

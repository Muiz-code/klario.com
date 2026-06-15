"use client";

import { useId, useRef, useState } from "react";

export type ChartLine = {
  key: string;
  label: string;
  values: number[];
  color: string;
};

type TrendChartProps = {
  /** UTC day keys (YYYY-MM-DD), ascending. */
  days: string[];
  lines: ChartLine[];
  height?: number;
  /**
   * What the legend shows next to each series:
   * - "sum" (default): total of all points — right for per-day counts.
   * - "last": the final point — right for a cumulative/running total.
   * - "none": no number.
   */
  legend?: "sum" | "last" | "none";
};

// Internal SVG coordinate system; the SVG scales responsively via viewBox.
const W = 760;
const PAD = { top: 14, right: 14, bottom: 24, left: 14 };

function niceMax(value: number): number {
  if (value <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  // Pick the next "nice" step with ~5% headroom, so the line uses the chart
  // height instead of floating low (e.g. 105 → 120, not 200).
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => s >= n * 1.05) ?? 10;
  return step * pow;
}

function formatDay(key: string): string {
  // key is YYYY-MM-DD (UTC); render as "Jun 3".
  const [, m, d] = key.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[Number(m) - 1]} ${Number(d)}`;
}

export function TrendChart({
  days,
  lines,
  height = 220,
  legend = "sum",
}: TrendChartProps) {
  const uid = useId().replace(/[:]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const n = days.length;
  const H = height;

  if (n === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-bg/10 text-[12px] text-bg/40"
        style={{ height }}
      >
        No data yet.
      </div>
    );
  }

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxVal = niceMax(
    Math.max(1, ...lines.flatMap((l) => l.values))
  );

  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / maxVal) * plotH;

  const linePath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");

  const areaPath = (values: number[]) =>
    `${linePath(values)} L${x(n - 1)},${PAD.top + plotH} L${x(0)},${PAD.top + plotH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  // Tick labels: up to ~5 evenly spaced dates, de-duplicated so short ranges
  // (where the rounded indices collide) don't produce duplicate React keys.
  const tickIdx = [
    ...new Set(
      n <= 1 ? [0] : [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * (n - 1)))
    ),
  ];

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const el = svgRef.current;
    if (!el || n === 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const i = Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))));
    setHover(i);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          {lines.map((l) => (
            <linearGradient
              key={l.key}
              id={`grad-${uid}-${l.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={l.color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={l.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal gridlines */}
        {gridLines.map((f) => (
          <line
            key={f}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + plotH * f}
            y2={PAD.top + plotH * f}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}

        {/* Areas + lines */}
        {lines.map((l) => (
          <g key={l.key}>
            <path d={areaPath(l.values)} fill={`url(#grad-${uid}-${l.key})`} />
            <path
              d={linePath(l.values)}
              fill="none"
              stroke={l.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {/* Hover guide + points */}
        {hover !== null && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            {lines.map((l) => (
              <circle
                key={l.key}
                cx={x(hover)}
                cy={y(l.values[hover])}
                r={3.5}
                fill={l.color}
                stroke="#0d0e12"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}

        {/* X tick labels */}
        {tickIdx.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            className="fill-current"
            fontSize={11}
            opacity={0.4}
          >
            {formatDay(days[i])}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg border border-bg/15 bg-[#0d0e12] px-2.5 py-1.5 text-[11px] shadow-xl"
          style={{ left: `${(hover / Math.max(1, n - 1)) * 100}%` }}
        >
          <p className="mb-1 font-medium text-bg/80">{formatDay(days[hover])}</p>
          <div className="flex flex-col gap-0.5">
            {lines.map((l) => (
              <div key={l.key} className="flex items-center gap-1.5 whitespace-nowrap">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: l.color }}
                />
                <span className="text-bg/55">{l.label}</span>
                <span className="ml-auto font-medium text-bg">
                  {l.values[hover]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {lines.map((l) => {
          const num =
            legend === "last"
              ? l.values[l.values.length - 1]
              : l.values.reduce((a, b) => a + b, 0);
          return (
            <div key={l.key} className="flex items-center gap-1.5 text-[12px]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-bg/60">{l.label}</span>
              {legend !== "none" && (
                <span className="font-medium text-bg/85">
                  {num.toLocaleString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

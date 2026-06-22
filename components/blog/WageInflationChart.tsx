"use client";

import { useRef, useState } from "react";

// 2010 -> 2026, one value per year.
const YEARS = Array.from({ length: 17 }, (_, i) => 2010 + i);
// National minimum wage, monthly, in thousands of naira (7.5 = ₦7,500).
const WAGE = [7.5, 18, 18, 18, 18, 18, 18, 18, 18, 30, 30, 30, 30, 30, 70, 70, 70];
// Annual average inflation rate, %.
const INFL = [13.7, 10.8, 12.2, 8.5, 8.1, 9.0, 15.7, 16.5, 12.1, 11.4, 13.2, 17.0, 18.8, 24.7, 33.2, 28.0, 22.0];
// Unemployment rate, % (rebased ILO-aligned methodology from 2023, so the step
// down is a definition change, not a sudden recovery).
const UNEMP = [21, 24, 27, 25, 23, 24, 27, 30, 33, 33, 33, 33, 33, 5.0, 4.9, 4.5, 4.5];

const W = 760;
const H = 340;
const PAD = { top: 16, right: 46, bottom: 44, left: 48 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;
const L_MAX = 80; // left axis: ₦'000
const R_MAX = 40; // right axis: %
const n = YEARS.length;

const xAt = (i: number) => PAD.left + (i / (n - 1)) * plotW;
const yLeft = (v: number) => PAD.top + plotH - (v / L_MAX) * plotH;
const yRight = (v: number) => PAD.top + plotH - (v / R_MAX) * plotH;

const lineLeft = WAGE.map((v, i) => `${xAt(i)},${yLeft(v)}`).join(" ");
const lineInfl = INFL.map((v, i) => `${xAt(i)},${yRight(v)}`).join(" ");
const lineUnemp = UNEMP.map((v, i) => `${xAt(i)},${yRight(v)}`).join(" ");
const areaWage = `${PAD.left},${PAD.top + plotH} ${lineLeft} ${PAD.left + plotW},${PAD.top + plotH}`;

const COLORS = { wage: "#d4a853", infl: "#e07a55", unemp: "#5b9bd0" };

const fmtNaira = (thousands: number) => `₦${(thousands * 1000).toLocaleString()}`;

export function WageInflationChart() {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const vbX = ratio * W;
    const i = Math.max(
      0,
      Math.min(n - 1, Math.round(((vbX - PAD.left) / plotW) * (n - 1)))
    );
    setHover(i);
  };

  return (
    <div className="text-white/85">
      <div className="relative">
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none"
          role="img"
          aria-label="Minimum wage, inflation and unemployment in Nigeria, 2010 to date"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="wageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.wage} stopOpacity={0.18} />
              <stop offset="100%" stopColor={COLORS.wage} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Gridlines + left (₦) ticks */}
          {[0, 20, 40, 60, 80].map((t) => (
            <g key={`l${t}`}>
              <line
                x1={PAD.left}
                x2={PAD.left + plotW}
                y1={yLeft(t)}
                y2={yLeft(t)}
                stroke="currentColor"
                strokeOpacity={0.12}
              />
              <text
                x={PAD.left - 8}
                y={yLeft(t) + 3}
                textAnchor="end"
                fontSize={10}
                className="fill-current"
                opacity={0.45}
              >
                ₦{t}k
              </text>
            </g>
          ))}

          {/* Right (%) ticks */}
          {[0, 10, 20, 30, 40].map((t) => (
            <text
              key={`r${t}`}
              x={PAD.left + plotW + 8}
              y={yRight(t) + 3}
              textAnchor="start"
              fontSize={10}
              className="fill-current"
              opacity={0.45}
            >
              {t}%
            </text>
          ))}

          {/* Wage area + lines */}
          <polygon points={areaWage} fill="url(#wageFill)" />
          <polyline points={lineUnemp} fill="none" stroke={COLORS.unemp} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={lineInfl} fill="none" stroke={COLORS.infl} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={lineLeft} fill="none" stroke={COLORS.wage} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* Hover guide + points */}
          {hover !== null && (
            <>
              <line
                x1={xAt(hover)}
                x2={xAt(hover)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <circle cx={xAt(hover)} cy={yLeft(WAGE[hover])} r={3.5} fill={COLORS.wage} stroke="#0c0c0f" strokeWidth={1.5} />
              <circle cx={xAt(hover)} cy={yRight(INFL[hover])} r={3.5} fill={COLORS.infl} stroke="#0c0c0f" strokeWidth={1.5} />
              <circle cx={xAt(hover)} cy={yRight(UNEMP[hover])} r={3.5} fill={COLORS.unemp} stroke="#0c0c0f" strokeWidth={1.5} />
            </>
          )}

          {/* X-axis year labels (every 4 years) */}
          {YEARS.map((yr, i) =>
            (yr - 2010) % 4 === 0 || yr === 2026 ? (
              <text
                key={yr}
                x={xAt(i)}
                y={H - 22}
                textAnchor="middle"
                fontSize={10}
                className="fill-current"
                opacity={0.5}
              >
                {yr}
              </text>
            ) : null
          )}
        </svg>

        {/* Tooltip */}
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-white/15 bg-[#0c0c0f] px-3 py-2 text-[11px]"
            style={{ left: `${(xAt(hover) / W) * 100}%` }}
          >
            <p className="mb-1.5 font-medium text-white/85">{YEARS[hover]}</p>
            <div className="flex flex-col gap-1">
              <Row color={COLORS.wage} label="Min. wage" value={fmtNaira(WAGE[hover])} />
              <Row color={COLORS.infl} label="Inflation" value={`${INFL[hover]}%`} />
              <Row color={COLORS.unemp} label="Unemployment" value={`${UNEMP[hover]}%`} />
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {[
          { c: COLORS.wage, label: "Minimum wage (₦, left)" },
          { c: COLORS.infl, label: "Inflation rate (%, right)" },
          { c: COLORS.unemp, label: "Unemployment rate (%, right)" },
        ].map((it) => (
          <span key={it.label} className="flex items-center gap-2 text-[12px] text-white/65">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.c }} />
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Row({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      <span className="text-white/55">{label}</span>
      <span className="ml-auto font-medium text-white">{value}</span>
    </div>
  );
}

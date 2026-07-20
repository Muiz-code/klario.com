"use client";

// Self-contained SVG charts for the beta research (no chart library). Brand
// palette only. Designed to sit on the dark (ink) investor research section.
// Pies draw and bars fill when scrolled into view (framer-motion whileInView).

import { motion } from "framer-motion";

type Slice = { label: string; value: number; color: string };
type Bar = { label: string; value: number; suffix?: string };

const ease = [0.16, 1, 0.3, 1] as const;

// Brand tones that read on a dark ground.
const PIE = ["#E6C989", "#C19A6B", "#F4E4C5", "#9c7a52", "#6b5236"];
const BAR_GOLD = "#C19A6B";

function Donut({ title, sub, data }: { title: string; sub: string; data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 190;
  const stroke = 30;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  // Cumulative fraction offset per slice, computed up-front so nothing is
  // reassigned mid-render (satisfies the React Compiler immutability rule).
  const cumulative = data.map((_, i) =>
    data.slice(0, i).reduce((sum, s) => sum + s.value / total, 0),
  );

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-bg/10 bg-bg/[0.03] p-7">
      <div>
        <h4 className="font-display text-lg text-bg">{title}</h4>
        <p className="mt-1 text-[12.5px] text-bg/55">{sub}</p>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-40 w-40 shrink-0">
          {/* pathLength/pathOffset are normalised (0-1); framer animates the
              visible arc from 0 to its slice fraction as it scrolls in. */}
          <g transform={`rotate(-90 ${cx} ${cx})`}>
            {data.map((d, i) => {
              const frac = d.value / total;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cx}
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={stroke}
                  initial={{ pathLength: 0, pathOffset: cumulative[i] }}
                  whileInView={{ pathLength: frac, pathOffset: cumulative[i] }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1, delay: i * 0.12, ease }}
                />
              );
            })}
          </g>
          <text x={cx} y={cx - 4} textAnchor="middle" className="fill-bg font-mono" fontSize="26" fontWeight="700">
            {total}
          </text>
          <text x={cx} y={cx + 16} textAnchor="middle" className="fill-bg/50 font-mono" fontSize="9" letterSpacing="1">
            RESPONSES
          </text>
        </svg>
        <ul className="flex flex-1 flex-col gap-2">
          {data.map((d, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[13px] text-bg/75">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="flex-1">{d.label}</span>
              <span className="font-mono text-bg/55">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Bars({ title, sub, data }: { title: string; sub: string; data: Bar[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-bg/10 bg-bg/[0.03] p-7">
      <div>
        <h4 className="font-display text-lg text-bg">{title}</h4>
        <p className="mt-1 text-[12.5px] text-bg/55">{sub}</p>
      </div>
      <ul className="flex flex-col gap-3.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-3">
            <span className="w-[42%] shrink-0 text-right text-[12.5px] text-bg/70">{d.label}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg/10">
              <motion.span
                className="block h-full rounded-full"
                style={{ backgroundColor: BAR_GOLD }}
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max((d.value / max) * 100, 3)}%` }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, delay: i * 0.07, ease }}
              />
            </span>
            <span className="w-10 shrink-0 font-mono text-[12.5px] text-gold">
              {d.value}
              {d.suffix ?? ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResearchCharts() {
  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <Donut
        title="Who answered"
        sub="The two groups with the most accounts and the least tooling (n = 331)"
        data={[
          { label: "Employed", value: 132, color: PIE[0] },
          { label: "Student", value: 113, color: PIE[1] },
          { label: "Business owner", value: 41, color: PIE[2] },
          { label: "Other / unstated", value: 30, color: PIE[3] },
          { label: "Freelancer", value: 15, color: PIE[4] },
        ]}
      />
      <Donut
        title="Do they lose track of their money?"
        sub="79% feel confused about where it went (n = 160)"
        data={[
          { label: "Yes, very often", value: 64, color: PIE[1] },
          { label: "Sometimes", value: 63, color: PIE[0] },
          { label: "Rarely", value: 29, color: PIE[2] },
          { label: "Never", value: 4, color: PIE[3] },
        ]}
      />
      <Bars
        title="Most-wanted features (in their words)"
        sub="Every top request is already in Klario's build (n = 171)"
        data={[
          { label: "All accounts in one view", value: 60 },
          { label: "Save better & hit goals", value: 60 },
          { label: "Alerts & reminders", value: 57 },
          { label: "Spend less, curb impulse", value: 52 },
          { label: "Transactions sorted for me", value: 44 },
          { label: "Plain-English advice", value: 36 },
        ]}
      />
      {/*
        Wave B willingness-to-pay, reconciled to the full n=171 (no responses dropped):
          - Conditional ("if it saves me money"): 62
          - Free tier only:                       51
          - Named a specific price/range:         58  (broken out below)
        The 58 named prices, folding the small raw buckets into their nearest band:
          Under ₦2,500 = ₦1,000-2,500 (2) + ₦1,500 (1)      -> 3
          ₦2,500-4,000 = base 27 + one "₦2,500+" (1)        -> 28
          ₦4,000-5,500 = base 9  + ₦4,500 (1)               -> 10
          ₦5,500-7,000                                       -> 14
          Above ₦10,000 = ₦10,000 (2) + ₦30,000 (1)         -> 3
        Total: 62 + 51 + (3 + 28 + 10 + 14 + 3 = 58) = 171.
      */}
      <Bars
        title="What they'd pay"
        sub="The largest group pays if it demonstrably saves them money (n = 171)"
        data={[
          { label: "If it saves me money", value: 62 },
          { label: "Free forever", value: 51 },
          { label: "₦2,500 – 4,000", value: 28 },
          { label: "₦5,500 – 7,000", value: 14 },
          { label: "₦4,000 – 5,500", value: 10 },
          { label: "Under ₦2,500", value: 3 },
          { label: "Above ₦10,000", value: 3 },
        ]}
      />
    </div>
  );
}

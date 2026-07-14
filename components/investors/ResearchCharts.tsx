"use client";

// Self-contained SVG charts for the beta research (no chart library). Brand
// palette only. Designed to sit on the dark (ink) investor research section.

type Slice = { label: string; value: number; color: string };
type Bar = { label: string; value: number; suffix?: string };

// Brand tones that read on a dark ground.
const PIE = ["#E6C989", "#C19A6B", "#F4E4C5", "#9c7a52", "#6b5236"];
const BAR_GOLD = "#C19A6B";

function Donut({ title, sub, data }: { title: string; sub: string; data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 190;
  const stroke = 30;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  let acc = 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-bg/10 bg-bg/[0.03] p-7">
      <div>
        <h4 className="font-display text-lg text-bg">{title}</h4>
        <p className="mt-1 text-[12.5px] text-bg/55">{sub}</p>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-40 w-40 shrink-0">
          <g transform={`rotate(-90 ${cx} ${cx})`}>
            {data.map((d, i) => {
              const frac = d.value / total;
              const seg = (
                <circle
                  key={i}
                  cx={cx}
                  cy={cx}
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${frac * c} ${c}`}
                  strokeDashoffset={`${-acc * c}`}
                />
              );
              acc += frac;
              return seg;
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
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-3">
            <span className="w-[42%] shrink-0 text-right text-[12.5px] text-bg/70">{d.label}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg/10">
              <span
                className="block h-full rounded-full"
                style={{ width: `${Math.max((d.value / max) * 100, 3)}%`, backgroundColor: BAR_GOLD }}
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
        sub="The two groups with the most accounts and the least tooling (n = 310)"
        data={[
          { label: "Employed", value: 129, color: PIE[0] },
          { label: "Student", value: 104, color: PIE[1] },
          { label: "Business owner", value: 39, color: PIE[2] },
          { label: "Other / unstated", value: 28, color: PIE[3] },
          { label: "Freelancer", value: 10, color: PIE[4] },
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
        sub="Every top request is already in Klario's build (n = 310)"
        data={[
          { label: "Track spending automatically", value: 76 },
          { label: "Save better & hit goals", value: 52 },
          { label: "Alerts & reminders", value: 41 },
          { label: "All accounts in one view", value: 39 },
          { label: "Spend less, curb impulse", value: 32 },
          { label: "Plain-English advice", value: 28 },
          { label: "Budget & stick to it", value: 13 },
        ]}
      />
      <Bars
        title="What they'd pay"
        sub="The largest group pays if it demonstrably saves them money (n = 150)"
        data={[
          { label: "If it saves me money", value: 38 },
          { label: "Free forever", value: 31 },
          { label: "₦2,500 – 4,000", value: 13 },
          { label: "₦5,500 – 7,000", value: 7 },
          { label: "₦4,000 – 5,500", value: 6 },
          { label: "Above ₦10,000", value: 3 },
        ]}
      />
    </div>
  );
}

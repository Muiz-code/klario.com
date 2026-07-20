"use client";

// Target-audience split. Bars fill from zero when scrolled into view.

import { motion } from "framer-motion";

type Segment = { label: string; pct: number; primary?: boolean };

const ease = [0.16, 1, 0.3, 1] as const;

export function AudienceMix({ segments }: { segments: readonly Segment[] }) {
  return (
    <div className="mt-1 flex flex-col gap-2.5">
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-center gap-3">
          <span
            className={
              "w-32 shrink-0 text-[12.5px] " +
              (seg.primary ? "font-semibold text-ink" : "text-body/70")
            }
          >
            {seg.label}
          </span>
          <span className="block h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
            <motion.span
              className={"block h-full rounded-full " + (seg.primary ? "bg-gold" : "bg-gold/50")}
              initial={{ width: 0 }}
              whileInView={{ width: `${seg.pct}%` }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, delay: i * 0.1, ease }}
            />
          </span>
          <span className="w-9 shrink-0 text-right font-display text-[13px] text-gold">{seg.pct}%</span>
        </div>
      ))}
    </div>
  );
}

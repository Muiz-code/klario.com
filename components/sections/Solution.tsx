"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Landmark,
  Sparkles,
  PiggyBank,
  Zap,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SOLUTION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  DashboardVisual,
  AIVisual,
  SavingsVisual,
  BillsVisual,
  ManagerVisual,
} from "./SolutionVisuals";

const ease = [0.16, 1, 0.3, 1] as const;

const icons: Record<string, LucideIcon> = {
  Landmark,
  Sparkles,
  PiggyBank,
  Zap,
  UserRound,
};

const visuals: Record<string, () => React.ReactNode> = {
  dashboard: DashboardVisual,
  ai: AIVisual,
  savings: SavingsVisual,
  bills: BillsVisual,
  manager: ManagerVisual,
};

export function Solution() {
  const [active, setActive] = useState(0);
  const tab = SOLUTION.tabs[active];
  const Visual = visuals[tab.id];

  return (
    <Section
      id="features"
      label={SOLUTION.label}
      heading={SOLUTION.heading}
      emphasis={SOLUTION.emphasis}
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-14">
        <ul
          role="tablist"
          className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {SOLUTION.tabs.map((t, i) => {
            const TabIcon = icons[t.icon];
            const isActive = i === active;
            return (
              <li key={t.id} className="flex-shrink-0 lg:w-full">
                <button
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-left transition-colors lg:px-5 lg:py-4",
                    isActive
                      ? "bg-card text-ink"
                      : "text-body/70 hover:bg-card/50 hover:text-ink"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="solution-active"
                      transition={{ duration: 0.4, ease }}
                      className="absolute inset-y-2 left-0 hidden w-[3px] rounded-full bg-gold lg:block"
                    />
                  )}
                  <TabIcon
                    size={18}
                    className={isActive ? "text-gold" : "text-body/55"}
                  />
                  <span className="font-display text-sm md:text-[15px]">
                    {t.eyebrow}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="min-h-[460px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease }}
              className="flex flex-col gap-7"
            >
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-balance text-2xl leading-[1.15] text-ink md:text-3xl lg:text-4xl">
                  {tab.title}
                </h3>
                <p className="max-w-[540px] text-[15px] leading-relaxed text-body/75 md:text-base">
                  {tab.body}
                </p>
              </div>

              <div className="rounded-2xl border border-ink/10 bg-phone-dark p-6 text-white/95 shadow-[0_30px_80px_-30px_rgba(13,13,14,0.4)] md:p-7">
                <Visual />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

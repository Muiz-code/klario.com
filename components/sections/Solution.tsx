"use client";

import {
  Landmark,
  Sparkles,
  TrendingDown,
  Zap,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { StackedCards } from "@/components/ui/StackedCards";
import { AppScreen } from "@/components/ui/AppScreen";
import { SOLUTION } from "@/lib/constants";
import {
  DashboardVisual,
  AIVisual,
  SavingsVisual,
  BillsVisual,
  ManagerVisual,
} from "./SolutionVisuals";

const icons: Record<string, LucideIcon> = {
  Landmark,
  Sparkles,
  TrendingDown,
  Zap,
  UserRound,
};

const visuals: Record<string, () => React.ReactNode> = {
  dashboard: DashboardVisual,
  ai: AIVisual,
  debt: SavingsVisual,
  bills: BillsVisual,
  manager: ManagerVisual,
};

export function Solution() {
  return (
    <Section
      id="features"
      label={SOLUTION.label}
      heading={SOLUTION.heading}
      emphasis={SOLUTION.emphasis}
    >
      {/* Each feature pins and reveals on scroll, with its own app visual. */}
      <StackedCards heightClass="h-[80vh] md:h-[90vh]">
        {SOLUTION.tabs.map((t) => {
          const Icon = icons[t.icon];
          const Visual = visuals[t.id];
          return (
            <article
              key={t.id}
              className="card-edge-engrave relative flex flex-col gap-6 overflow-hidden rounded-2xl bg-[#f6f2ea] p-7 shadow-[0_30px_80px_-32px_rgba(60,40,20,0.5)] md:flex-row md:items-center md:gap-9 md:p-9"
            >
              <div className="flex flex-col gap-3 md:flex-1">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  <Icon size={15} strokeWidth={1.9} />
                  {t.eyebrow}
                </span>
                <h3 className="font-display text-balance text-2xl leading-[1.12] text-ink md:text-3xl">
                  {t.title}
                </h3>
                <p className="max-w-[520px] text-[15px] leading-relaxed text-body/75">
                  {t.body}
                </p>
              </div>

              <div className="flex items-center justify-center md:w-[46%] md:shrink-0">
                {/* Uses public/screens/<id>.(png|jpg|jpeg|webp) if present, else the mockup.
                    The dark panel is applied only to the mockup, not the screenshot. */}
                <AppScreen
                  base={`/screens/${t.id}`}
                  alt={`Klario ${t.eyebrow} screen`}
                  fallback={<Visual />}
                  fallbackClassName="w-full rounded-2xl border border-ink/10 bg-phone-dark p-5 text-white/95 shadow-[0_30px_80px_-30px_rgba(13,13,14,0.4)] md:p-6"
                />
              </div>
            </article>
          );
        })}
      </StackedCards>
    </Section>
  );
}

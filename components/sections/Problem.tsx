"use client";

import { Landmark, Bot, TrendingDown, PiggyBank } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { StackedCards } from "@/components/ui/StackedCards";
import { IconCard } from "@/components/ui/IconCard";
import { PROBLEM } from "@/lib/constants";

const icons = { Landmark, Bot, TrendingDown, PiggyBank } as const;

export function Problem() {
  return (
    <Section
      id="problem"
      layout="split"
      label={PROBLEM.label}
      sub={{ lead: PROBLEM.heading.lead, emphasis: PROBLEM.heading.emphasis }}
      // Tighter top than the default py-24/md:py-32 (tune the pt-* here).
      className="pt-5 md:pt-5"
    >
      {/* Scroll-driven stack: one card pinned at a time, the next reveals on scroll. */}
      <StackedCards>
        {PROBLEM.cards.map((c) => (
          <IconCard
            key={c.title}
            icon={icons[c.icon as keyof typeof icons]}
            title={c.title}
            body={c.body}
            stat={c.stat}
            className="card-edge-engrave min-h-[420px] bg-[#f6f2ea] shadow-[0_30px_80px_-32px_rgba(60,40,20,0.55)]"
          />
        ))}
      </StackedCards>
    </Section>
  );
}

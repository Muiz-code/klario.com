"use client";

import { Landmark, Bot, TrendingDown, PiggyBank, Briefcase, CreditCard, ArrowLeftRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { StackedCards } from "@/components/ui/StackedCards";
import { IconCard } from "@/components/ui/IconCard";
import { PROBLEM } from "@/lib/constants";

const icons = { Landmark, Bot, TrendingDown, PiggyBank, Briefcase, CreditCard, ArrowLeftRight } as const;

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
      {/* ONE child, deliberately.
          Section's split layout drops children into a `flex flex-col`, so a
          second sibling turned the stack into a shrinkable flex item and
          collapsed it — the heading rendered and every card vanished. Wrapping
          both keeps Section seeing a single child, exactly as before. */}
      <div>
        {/* Scroll-driven stack: one card pinned at a time, the next reveals on scroll. */}
        <StackedCards>
          {PROBLEM.cards.map((c) => (
            <IconCard
              key={c.title}
              icon={icons[c.icon as keyof typeof icons]}
              title={c.title}
              body={c.body}
              stat={"stat" in c ? c.stat : undefined}
              className="card-edge-engrave min-h-[420px] bg-[#f6f2ea] shadow-[0_30px_80px_-32px_rgba(60,40,20,0.55)]"
            />
          ))}
        </StackedCards>

        {/* Sourced, like every figure on the investor page. A stat with no
            provenance is worth less than no stat at all on a finance site. */}
        <p className="mx-auto mt-8 max-w-2xl text-center font-mono text-[11px] leading-relaxed text-body/45">
          {PROBLEM.sources}
        </p>
      </div>
    </Section>
  );
}

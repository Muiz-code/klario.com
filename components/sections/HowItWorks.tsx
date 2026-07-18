"use client";

import {
  Smartphone,
  Link as LinkIcon,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { StackedCards } from "@/components/ui/StackedCards";
import { HOW_IT_WORKS } from "@/lib/constants";

const icons: Record<string, LucideIcon> = {
  Smartphone,
  Link: LinkIcon,
  Lightbulb,
};

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      layout="split"
      titleSide="right"
      label={HOW_IT_WORKS.label}
      sub={{ lead: HOW_IT_WORKS.heading, emphasis: HOW_IT_WORKS.emphasis }}
      className="bg-surface"
    >
      <StackedCards heightClass="h-[66vh] md:h-[76vh]">
        {HOW_IT_WORKS.steps.map((step, i) => {
          const Icon = icons[step.icon];
          return (
            <article
              key={step.title}
              className="card-edge-engrave relative flex min-h-[340px] flex-col gap-6 overflow-hidden rounded-2xl bg-[#f6f2ea] p-8 shadow-[0_30px_80px_-32px_rgba(60,40,20,0.5)] md:p-10"
            >
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl leading-none text-gold/35 md:text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border-gold bg-bg text-gold">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-xl text-ink md:text-2xl">
                  {step.title}
                </h3>
                <p className="max-w-md text-[15px] leading-relaxed text-body/75">
                  {step.body}
                </p>
              </div>
            </article>
          );
        })}
      </StackedCards>
    </Section>
  );
}

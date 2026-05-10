"use client";

import { motion } from "framer-motion";
import {
  Smartphone,
  Link as LinkIcon,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { HOW_IT_WORKS } from "@/lib/constants";

const ease = [0.16, 1, 0.3, 1] as const;

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
      heading={HOW_IT_WORKS.heading}
      emphasis={HOW_IT_WORKS.emphasis}
      className="bg-surface"
    >
      <ol className="flex flex-col gap-10">
        {HOW_IT_WORKS.steps.map((step, i) => {
          const Icon = icons[step.icon];
          return (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              className="flex flex-col gap-5"
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
            </motion.li>
          );
        })}
      </ol>
    </Section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Landmark, Bot, TrendingDown, PiggyBank, type LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { IconCard } from "@/components/ui/IconCard";
import { staggerContainer } from "@/components/ui/ScrollReveal";
import { PROBLEM } from "@/lib/constants";

const icons: Record<string, LucideIcon> = { Landmark, Bot, TrendingDown, PiggyBank };

export function Problem() {
  return (
    <Section
      id="problem"
      layout="split"
      label={PROBLEM.label}
      heading={PROBLEM.heading.lead}
      emphasis={PROBLEM.heading.emphasis}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid gap-5 md:grid-cols-2"
      >
        {PROBLEM.cards.map((c) => (
          <IconCard
            key={c.title}
            icon={icons[c.icon]}
            title={c.title}
            body={c.body}
            stat={c.stat}
          />
        ))}
      </motion.div>
    </Section>
  );
}

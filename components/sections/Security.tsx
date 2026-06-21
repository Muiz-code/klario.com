"use client";

import { motion, type Variants } from "framer-motion";
import {
  Fingerprint,
  ShieldCheck,
  BadgeCheck,
  KeyRound,
  Webhook,
  DatabaseZap,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { staggerContainer, staggerItem } from "@/components/ui/ScrollReveal";
import { SECURITY } from "@/lib/constants";

const icons: Record<string, LucideIcon> = {
  Fingerprint,
  ShieldCheck,
  BadgeCheck,
  KeyRound,
  Webhook,
  DatabaseZap,
};

const cardVariant: Variants = staggerItem;

export function Security() {
  return (
    <Section
      id="security"
      tone="dark"
      label={SECURITY.label}
      heading={SECURITY.heading}
      emphasis={SECURITY.emphasis}
      intro={SECURITY.intro}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {SECURITY.cards.map((c) => {
          const Icon = icons[c.icon];
          return (
            <motion.article
              key={c.title}
              variants={cardVariant}
              className="glass-card group relative flex flex-col gap-4 overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:border-emerald-400/40 hover:shadow-[0_24px_60px_-30px_rgba(0,255,135,0.45)]"
            >
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-emerald-400/10 text-emerald-400 transition-colors group-hover:bg-emerald-400/20">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h3 className="relative font-display text-lg text-bg md:text-xl">
                {c.title}
              </h3>
              <p className="relative text-[14px] leading-relaxed text-bg/65">
                {c.body}
              </p>
            </motion.article>
          );
        })}
      </motion.div>

    </Section>
  );
}

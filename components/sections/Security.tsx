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
              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-bg/10 bg-bg/[0.03] p-6 transition-all duration-500 hover:border-emerald-400/40 hover:bg-bg/[0.05] hover:shadow-[0_24px_60px_-30px_rgba(0,255,135,0.45)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 transition-colors group-hover:bg-emerald-400/20">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-lg text-bg md:text-xl">
                {c.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-bg/65">{c.body}</p>
            </motion.article>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-gold/30 bg-gold/[0.06] px-8 py-5"
      >
        {SECURITY.compliance.map((label, i) => (
          <span
            key={label}
            className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-gold"
          >
            {label}
            {i < SECURITY.compliance.length - 1 && (
              <span aria-hidden className="h-3 w-px bg-gold/40" />
            )}
          </span>
        ))}
      </motion.div>
    </Section>
  );
}

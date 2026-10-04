"use client";

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
import { SECURITY } from "@/lib/constants";

const icons: Record<string, LucideIcon> = {
  Fingerprint,
  ShieldCheck,
  BadgeCheck,
  KeyRound,
  Webhook,
  DatabaseZap,
};

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
      {/* The six protections side by side, all in view at once. */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SECURITY.cards.map((c) => {
          const Icon = icons[c.icon];
          return (
            <article
              key={c.title}
              className="card-edge-engrave-gold relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-bg/10 bg-[#141419] p-7 shadow-[0_30px_80px_-34px_rgba(0,0,0,0.85)] md:p-8"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold-dim text-gold">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-lg text-bg md:text-xl">{c.title}</h3>
              <p className="text-[14px] leading-relaxed text-bg/65">{c.body}</p>
            </article>
          );
        })}
      </div>

      {/* The backend, layer by layer, for the reader who wants to know how. */}
      <div className="mt-16 rounded-2xl border border-bg/10 bg-[#141419] p-8 md:mt-24 md:p-10">
        <h3 className="font-display text-2xl text-bg md:text-3xl">{SECURITY.stack.heading}</h3>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-bg/65">{SECURITY.stack.intro}</p>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-bg/10 bg-bg/10 md:grid-cols-2 lg:grid-cols-3">
          {SECURITY.stack.rows.map((r) => (
            <div key={r.label} className="flex flex-col gap-2 bg-[#141419] p-6">
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">{r.label}</dt>
              <dd className="text-[14px] leading-relaxed text-bg/70">{r.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

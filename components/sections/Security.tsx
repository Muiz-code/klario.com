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
import { StackedCards } from "@/components/ui/StackedCards";
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
      {/* Shorter per-card scroll (6 cards) so the section doesn't over-scroll. */}
      <StackedCards heightClass="h-[50vh] md:h-[58vh]" dimClassName="bg-black">
        {SECURITY.cards.map((c) => {
          const Icon = icons[c.icon];
          return (
            <article
              key={c.title}
              className="card-edge-engrave-gold relative flex min-h-[340px] flex-col gap-5 overflow-hidden rounded-2xl border border-bg/10 bg-[#141419] p-8 shadow-[0_30px_80px_-34px_rgba(0,0,0,0.85)] md:p-9"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold-dim text-gold">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-xl text-bg md:text-2xl">{c.title}</h3>
              <p className="max-w-xl text-[15px] leading-relaxed text-bg/65">{c.body}</p>
            </article>
          );
        })}
      </StackedCards>
    </Section>
  );
}

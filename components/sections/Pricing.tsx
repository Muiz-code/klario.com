"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PRICING, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

type Cycle = "monthly" | "annual";

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const isAnnual = cycle === "annual";
  const reveal = PRICING.revealPrices;

  return (
    <Section
      id="pricing"
      label={PRICING.label}
      heading={PRICING.heading}
      emphasis={PRICING.emphasis}
    >
      {reveal && (
      <div className="mb-12 flex justify-center">
        <div
          role="tablist"
          aria-label="Billing cycle"
          className="relative inline-flex rounded-full border border-border-gold bg-card/60 p-1"
        >
          {(["monthly", "annual"] as const).map((c) => {
            const active = c === cycle;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                onClick={() => setCycle(c)}
                className={cn(
                  "relative z-10 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-body/65 hover:text-ink"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="cycle-active"
                    transition={{ duration: 0.4, ease }}
                    className="absolute inset-0 -z-10 rounded-full bg-gold"
                  />
                )}
                {c === "monthly" ? "Monthly" : "Annual"}
                {c === "annual" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      active ? "bg-ink/15 text-ink" : "bg-gold/15 text-gold"
                    )}
                  >
                    −10%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
        {PRICING.tiers.map((tier, i) => {
          const featured = "featured" in tier && tier.featured;
          const monthly = isAnnual
            ? Math.round(tier.monthly * (1 - PRICING.annualDiscount))
            : tier.monthly;

          return (
            <motion.article
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7 transition-all duration-500",
                featured
                  ? "border-gold bg-card shadow-[0_28px_80px_-30px_rgba(212,168,83,0.45)] lg:scale-[1.04]"
                  : "border-border-gold/60 bg-card/50 hover:border-gold"
              )}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                  Most Popular
                </span>
              )}

              <h3 className="font-display text-xl text-ink">{tier.name}</h3>
              <p className="mt-1 max-w-[260px] text-sm text-body/65">
                {tier.tagline}
              </p>

              {reveal ? (
                <>
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-mono text-base text-ink/55">₦</span>
                    <span className="relative inline-flex h-12 items-baseline overflow-hidden md:h-14">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${tier.id}-${cycle}`}
                          initial={{ y: "100%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-100%", opacity: 0 }}
                          transition={{ duration: 0.35, ease }}
                          className="font-mono text-4xl font-medium text-ink md:text-5xl"
                        >
                          {monthly.toLocaleString("en-NG")}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className="text-sm text-body/55">/month</span>
                  </div>
                  <p className="mt-1 min-h-[18px] text-xs text-body/50">
                    {isAnnual && tier.monthly > 0
                      ? `Billed ₦${(monthly * 12).toLocaleString("en-NG")} annually`
                      : tier.monthly === 0
                        ? "Free, forever."
                        : "Cancel anytime."}
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-mono text-base text-ink/55">₦</span>
                    <span className="font-mono text-4xl font-medium tracking-wider text-ink/35 md:text-5xl">
                      {tier.monthly === 0 ? "0" : "###"}
                    </span>
                    <span className="text-sm text-body/45">/month</span>
                  </div>
                  <p className="mt-1 min-h-[18px] text-xs text-gold/80">
                    {tier.monthly === 0 ? "Free, forever." : "Pricing coming soon."}
                  </p>
                </>
              )}

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-body/85"
                  >
                    <Check
                      size={15}
                      strokeWidth={2.5}
                      className="mt-[3px] shrink-0 text-gold"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  href={SITE.downloadHref}
                  size="lg"
                  variant={featured ? "solid" : "outline"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </Section>
  );
}

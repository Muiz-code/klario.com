"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { FAQS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section
      id="faq"
      label="Frequently Asked"
      heading="Questions,"
      emphasis="answered."
    >
      <ul className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <li
              key={f.q}
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}
              className={cn(
                "glass-card-dark overflow-hidden rounded-2xl transition-colors",
                isOpen ? "border-gold" : "hover:border-gold/80"
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="flex w-full items-center gap-4 p-5 text-left md:p-6"
              >
                <span className="flex-1 font-display text-[15px] leading-snug text-ink md:text-lg">
                  {f.q}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-dim text-gold"
                >
                  <Plus size={15} strokeWidth={2.25} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="panel"
                    id={`faq-panel-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    <p className="border-t border-border-gold/40 px-5 py-4 text-[15px] leading-relaxed text-body/80 md:px-6 md:py-5 md:text-base">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

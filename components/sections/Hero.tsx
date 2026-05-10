"use client";

import { motion, type Variants } from "framer-motion";
import { Apple, Smartphone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlassPills } from "@/components/ui/GlassPills";
import { WordRotator } from "@/components/ui/WordRotator";
import { HERO, SITE } from "@/lib/constants";

const ease = [0.16, 1, 0.3, 1] as const;

const lineParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const line: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.9, ease } },
};

const fade: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100dvh] items-center overflow-hidden bg-black pt-28 pb-20 text-bg md:pt-32"
    >
      <GlassPills />

      <Container className="relative z-10 flex flex-col items-center gap-6 px-4 text-center md:gap-8">
        <motion.div initial="hidden" animate="visible" variants={fade}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border-gold bg-gold-dim px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-green pulse-dot" />
            {HERO.badge}
          </span>
        </motion.div>

        <motion.h1
          variants={lineParent}
          initial="hidden"
          animate="visible"
          className="font-display text-balance text-4xl leading-[0.95] capitalize sm:text-5xl md:text-6xl lg:text-[5rem]"
        >
          <span className="block overflow-hidden pb-[0.14em]">
            <motion.span variants={line} className="block text-bg">
              {HERO.line1.lead}{" "}
              <span className="italic text-gold">{HERO.line1.emphasis}</span>
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.14em]">
            <motion.span variants={line} className="block text-bg">
              {HERO.line2.prefix}{" "}
              <WordRotator
                words={HERO.rotatingWords}
                className="capitalize italic text-gold"
              />
              {HERO.line2.suffix}
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          variants={fade}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="max-w-[560px] text-sm leading-relaxed text-bg/70 md:text-[17px]"
        >
          {HERO.sub}
        </motion.p>

        <motion.div
          variants={fade}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.75 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button href={SITE.downloadHref} size="lg" variant="solid">
            <Apple size={16} /> Download on iOS
          </Button>
          <Button
            href={SITE.downloadHref}
            size="lg"
            variant="outline"
            className="border-bg/25 text-bg hover:border-bg hover:bg-bg/10"
          >
            <Smartphone size={16} /> Get on Android
          </Button>
        </motion.div>

      </Container>
    </section>
  );
}

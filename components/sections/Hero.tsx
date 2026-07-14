"use client";

import { motion, type Variants } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlassPills } from "@/components/ui/GlassPills";
import { WordRotator } from "@/components/ui/WordRotator";
import { HERO, SITE } from "@/lib/constants";

function AppleLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 384 512"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function AndroidLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  );
}

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
      className="relative isolate flex min-h-[100dvh] items-center overflow-hidden bg-ink pt-28 pb-20 text-bg md:pt-32"
    >
      <GlassPills />

      <Container className="relative z-10 flex flex-col items-center gap-6 px-4 text-center md:gap-8">
        <motion.div initial="hidden" animate="visible" variants={fade}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border-gold bg-gold-dim px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold pulse-dot" />
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
          className="flex w-full max-w-sm items-center justify-center gap-2 sm:w-auto sm:max-w-none sm:gap-3"
        >
          <Button
            href={SITE.downloadHref}
            size="lg"
            variant="solid"
            className="flex-1 px-4 sm:flex-none sm:px-6"
          >
            <AppleLogo size={16} />{" "}
            <span className="hidden sm:inline">Download on </span>iOS
          </Button>
          <Button
            href={SITE.downloadHref}
            size="lg"
            variant="outline"
            className="flex-1 border-bg/25 px-4 text-bg hover:border-bg hover:bg-bg/10 sm:flex-none sm:px-6"
          >
            <AndroidLogo size={16} />{" "}
            <span className="hidden sm:inline">Get on </span>Android
          </Button>
        </motion.div>

      </Container>
    </section>
  );
}

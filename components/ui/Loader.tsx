"use client";

import { motion, type Variants } from "framer-motion";
import { SITE } from "@/lib/constants";

const ease = [0.16, 1, 0.3, 1] as const;

const dot: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.35, ease } },
};

const kla: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease, delay: 0.35 } },
};

const rio: Variants = {
  hidden: { opacity: 0, x: -24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease, delay: 0.85 },
  },
};

const tagline: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: 1.4 } },
};

export function Loader() {
  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center bg-ink"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease } }}
    >
      <div className="relative flex flex-col items-center">
        <motion.span
          variants={dot}
          initial="hidden"
          animate="visible"
          className="pulse-dot absolute -top-10 h-2 w-2 rounded-full bg-gold"
        />
        <div className="font-display flex items-baseline text-6xl leading-none tracking-tight md:text-8xl">
          <motion.span variants={kla} initial="hidden" animate="visible" className="text-bg">
            KLA
          </motion.span>
          <motion.span variants={rio} initial="hidden" animate="visible" className="text-gold">
            RIO
          </motion.span>
        </div>
        <motion.p
          variants={tagline}
          initial="hidden"
          animate="visible"
          className="font-serif-italic mt-6 text-base text-gold/70 md:text-lg"
        >
          {SITE.tagline}
        </motion.p>
      </div>
    </motion.div>
  );
}

"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.25,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /**
   * How much of the element must be visible before it reveals.
   *
   * A number is a FRACTION OF THE ELEMENT, so it breaks silently on tall
   * content: 0.25 of a five-viewport-high container can never be on screen, the
   * reveal never fires, and its children stay invisible with no error anywhere.
   * Use "some" for anything whose height you do not control.
   */
  amount?: number | "some" | "all";
  as?: "div" | "section" | "article" | "li" | "header";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      data-reveal
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={defaultVariants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

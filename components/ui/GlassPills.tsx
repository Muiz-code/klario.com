"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const pillVariant = (i: number): Variants => ({
  hidden: { opacity: 0, y: 80, scale: 0.86, rotateY: -14 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: { delay: 0.2 + i * 0.09, duration: 1.05, ease },
  },
});

export function GlassPills({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Pills use the same static .glass-card style as the Security cards — no
          backdrop-filter, so there's nothing to re-sample on scroll (no jank). */}
      <div className="flex" style={{ perspective: 1200 }}>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate="visible"
            variants={pillVariant(i)}
            className="glass-card relative h-[68vh] max-h-[680px] w-[140px] overflow-hidden rounded-full md:w-[200px]"
            style={{
              marginLeft: i === 0 ? 0 : -10,
              willChange: "transform, opacity",
            }}
          >
            {/* Glossy specular highlight along the top edge. */}
            <span
              className="absolute inset-x-2 top-2 h-12 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.5), transparent)",
                filter: "blur(5px)",
              }}
            />
            {/* Bright vertical rim light down one side, like curved glass. */}
            <span
              className="absolute inset-y-6 left-2 w-px"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(255,255,255,0.4), transparent)",
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

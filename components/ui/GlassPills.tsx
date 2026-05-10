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

const chrome =
  "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(170,170,182,0.28) 7%, rgba(48,48,58,0.55) 32%, rgba(18,18,24,0.88) 50%, rgba(52,52,62,0.62) 68%, rgba(180,180,192,0.32) 93%, rgba(255,255,255,0.74) 100%)";

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
      <div className="flex" style={{ perspective: 1200 }}>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate="visible"
            variants={pillVariant(i)}
            className="relative h-[68vh] max-h-[680px] w-[140px] rounded-full md:w-[200px]"
            style={{
              marginLeft: i === 0 ? 0 : -10,
              background: chrome,
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(255,255,255,0.45)",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    </div>
  );
}

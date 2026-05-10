"use client";

import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function IconCard({
  icon: Icon,
  title,
  body,
  stat,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  stat?: string;
  className?: string;
}) {
  return (
    <motion.article
      variants={item}
      className={cn(
        "group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border-gold/60 bg-card/60 p-7 transition-all duration-500 hover:border-gold hover:bg-card hover:shadow-[0_24px_60px_-30px_rgba(212,168,83,0.45)]",
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-gold transition-all duration-500 group-hover:w-1"
      />

      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-dim text-gold">
        <Icon size={20} strokeWidth={1.75} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl text-ink md:text-[22px]">{title}</h3>
        <p className="text-[15px] leading-relaxed text-body/75">{body}</p>
      </div>

      {stat && (
        <div className="mt-auto pt-4">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-gold/85">
            {stat}
          </span>
        </div>
      )}
    </motion.article>
  );
}

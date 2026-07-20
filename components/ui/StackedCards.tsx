"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

function StackItem({
  index,
  total,
  progress,
  heightClass,
  dimClassName,
  isDesktop,
  children,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  heightClass: string;
  dimClassName: string;
  isDesktop: boolean;
  children: ReactNode;
}) {
  // Hooks must run unconditionally, so compute the transforms every render and
  // only apply them on desktop.
  // Cards behind shrink a touch for depth...
  const targetScale = 1 - (total - 1 - index) * 0.045;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);
  // ...and only darken AFTER the next card has landed on top (never while this
  // one is still the front card), so it stays fully readable during its turn.
  const dim = useTransform(
    progress,
    [(index + 1) / total, (index + 1.4) / total],
    [0, 0.6]
  );

  // Mobile: the scroll-pin stack needs a tall runway per card, which reads as
  // large gaps on a small screen. Fall back to a plain vertical list.
  if (!isDesktop) {
    return <div className={cn("w-full", index > 0 && "mt-4")}>{children}</div>;
  }

  const isLast = index === total - 1;

  return (
    <div
      className={cn(
        "flex justify-center",
        isLast
          // Last card: no tall pinned region, so there's no empty runway (gap)
          // trailing the stack.
          ? "items-start pt-6"
          : "sticky top-0 items-center",
        isLast ? undefined : heightClass
      )}
    >
      <motion.div
        style={{ scale, top: index * 16 }}
        className="relative w-full origin-top will-change-transform"
      >
        {children}
        {index < total - 1 && (
          <motion.div
            aria-hidden
            style={{ opacity: dim }}
            className={`pointer-events-none absolute inset-0 rounded-2xl ${dimClassName}`}
          />
        )}
      </motion.div>
    </div>
  );
}

/**
 * Scroll-driven card stack (desktop): one card is pinned in view at a time; as
 * you scroll, the next slides up and stacks over it while the ones behind scale
 * down and darken (only once covered). On mobile it degrades to a plain vertical
 * list of the same cards, because the pinned runway leaves awkward gaps on small
 * screens. Each child is one card.
 *
 * @param heightClass  scroll length per card as a (responsive) height utility,
 *                     e.g. "h-[72vh] md:h-[85vh]" (desktop only now).
 * @param dimClassName background utility for the recede scrim (default bg-ink).
 */
export function StackedCards({
  children,
  heightClass = "h-[72vh] md:h-[85vh]",
  dimClassName = "bg-ink",
}: {
  children: ReactNode;
  heightClass?: string;
  dimClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const items = Children.toArray(children);

  // Progressive enhancement: render the simple list first (matches SSR), then
  // enable the pinned stack once we confirm a desktop-width viewport.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div ref={ref} className="relative">
      {items.map((child, i) => {
        const key = (child as { key?: React.Key | null }).key ?? i;
        return (
          <StackItem
            key={key}
            index={i}
            total={items.length}
            progress={scrollYProgress}
            heightClass={heightClass}
            dimClassName={dimClassName}
            isDesktop={isDesktop}
          >
            {child}
          </StackItem>
        );
      })}
    </div>
  );
}

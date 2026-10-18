"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Landmark,
  Sparkles,
  TrendingDown,
  Zap,
  UserRound,
  Send,
  PiggyBank,
  PieChart,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CoinMark } from "@/components/ui/CoinMark";
import { GuillocheRosette } from "@/components/ui/Engraving";
import { SOLUTION } from "@/lib/constants";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const icons: Record<string, LucideIcon> = {
  Landmark,
  Sparkles,
  TrendingDown,
  Zap,
  UserRound,
  Send,
  PiggyBank,
  PieChart,
};

const TABS = SOLUTION.tabs;
const N = TABS.length;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const screen = (id: string) => `/screens/${id}.jpeg`;
const ease = [0.16, 1, 0.3, 1] as const;

/** A phone frame showing one of several screenshots, crossfading to `active`. */
function Phone({ active, className }: { active: number; className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-591/1280 w-[min(60vw,250px)] overflow-hidden rounded-[1.8rem] border-[6px] md:w-[clamp(220px,19vw,300px)] md:rounded-[2.6rem] md:border-[9px] border-[#161412] bg-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85),0_0_0_1px_rgba(232,213,173,0.18)]",
        className
      )}
    >
      {TABS.map((t, i) => (
        <Image
          key={t.id}
          src={screen(t.id)}
          alt={i === active ? `Klario ${t.eyebrow} screen` : ""}
          fill
          sizes="300px"
          className={cn(
            "object-cover object-top transition-[opacity,scale] duration-700 ease-out",
            i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
          )}
        />
      ))}
    </div>
  );
}

/**
 * How Klario helps, as a guided tour. A bold headline, then on desktop the
 * stage pins and walks through every feature as you scroll: the numbered
 * list on the left tracks progress on a gold rail, the phone in the middle
 * swaps to that feature's real screen, and its story comes in on the right.
 * Clicking a feature scrolls to it. Phones get the same tour stacked: a
 * counter and progress bar, the phone, then the story. Reduced motion gets the same
 * features as a plain stacked list.
 */
export function Solution() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-sw]", {
          yPercent: 110,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-sol-head]", start: "top 85%", once: true },
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage.current,
            start: "top top",
            end: `+=${N * 55}%`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: (self) => {
              const i = Math.min(N - 1, Math.floor(self.progress * N));
              setActive((prev) => (prev === i ? prev : i));
            },
          },
        });
        trigger.current = tl.scrollTrigger ?? null;
        tl.fromTo("[data-rail]", { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)
          .fromTo("[data-rail-x]", { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
          .fromTo(
          "[data-rosette]",
          { rotation: 0 },
          { rotation: 180, svgOrigin: "250 250", duration: 1 },
          0
        );
        return () => {
          trigger.current = null;
        };
      });
    },
    { scope: root }
  );

  /** Scroll to the middle of feature i's stretch of the pin. */
  const goTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    window.scrollTo({ top: st.start + ((i + 0.5) / N) * (st.end - st.start), behavior: "smooth" });
  };

  const tab = TABS[active];
  const ActiveIcon = icons[tab.icon];

  return (
    <section ref={root} id="features" className="relative bg-ink text-bg">
      {/* Headline */}
      <Container className="pt-24 pb-10 md:pt-32 md:pb-4">
        <p className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-gold uppercase">
          <CoinMark className="w-4" />
          {SOLUTION.label}
        </p>
        <h2
          data-sol-head
          className="font-display mt-6 text-[clamp(2.5rem,6.4vw,6.75rem)] leading-[0.9] font-bold tracking-[-0.045em] uppercase"
        >
          <span className="block overflow-hidden pb-[0.05em]">
            <span data-sw className="block text-cream-gold">
              {SOLUTION.heading}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.05em]">
            <span data-sw className="block text-gold">
              {SOLUTION.emphasis}
            </span>
          </span>
        </h2>
      </Container>

      {/* The tour: pinned stage, on every screen size. Large viewport, not
          dvh, for the same reason as the hero: the pin freezes the height and
          phone browser chrome collapses mid-scroll. The bottom padding (zero
          on desktop) keeps the content inside the visible area meanwhile. */}
      <div ref={stage} className="relative isolate hidden h-lvh overflow-hidden motion-safe:block">
        <GuillocheRosette
          spin="scroll"
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[125%] w-auto -translate-x-1/2 -translate-y-1/2 text-gold-hi opacity-20"
        />
        <Container className="flex h-full flex-col items-center justify-center gap-4 pt-16 pb-[calc(100lvh-100svh)] md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-10 md:pt-0 lg:gap-16">
          {/* Phones: counter and progress bar in place of the list. */}
          <div className="flex w-full max-w-xs items-center gap-3 md:hidden">
            <span className="font-mono text-xs text-gold">{pad(active)}</span>
            <span aria-hidden className="relative h-px flex-1 bg-bg/15">
              <span data-rail-x className="absolute inset-0 origin-left bg-gold" />
            </span>
            <span className="font-mono text-xs text-bg/40">{pad(N - 1)}</span>
          </div>

          {/* Feature list with progress rail */}
          <nav aria-label="Klario features" className="relative hidden pl-6 md:block">
            <span aria-hidden className="absolute top-1 bottom-1 left-0 w-px bg-bg/15" />
            <span aria-hidden data-rail className="absolute top-1 bottom-1 left-0 w-px origin-top bg-gold" />
            <ol className="flex flex-col gap-1">
              {TABS.map((t, i) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className={cn(
                      "group flex w-full items-baseline gap-4 py-2 text-left transition-colors duration-300",
                      i === active ? "text-cream-gold" : "text-bg/40 hover:text-bg/75"
                    )}
                  >
                    <span className={cn("font-mono text-xs", i === active ? "text-gold" : "")}>{pad(i)}</span>
                    <span
                      className={cn(
                        "font-display text-lg font-semibold tracking-tight transition-[font-size] duration-300 lg:text-xl",
                        i === active && "text-xl lg:text-2xl"
                      )}
                    >
                      {t.eyebrow}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {/* Phone, with a soft gold glow behind. A whole phone plus the story
              is taller than a phone screen, so there the frame is cut to the
              room left over and fades out at the bottom: the top of each
              screen is the part worth reading. */}
          <div className="relative">
            <div aria-hidden className="absolute inset-[-18%] -z-10 rounded-full bg-gold/25 blur-[90px]" />
            <div className="max-md:max-h-[calc(100svh-21rem)] max-md:overflow-hidden max-md:mask-b-from-70%">
              <Phone active={active} />
            </div>
          </div>

          {/* The active feature's story */}
          <div className="relative min-h-44 w-full max-w-md text-center md:min-h-72 md:text-left">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease }}
              >
                <p className="hidden font-mono text-[clamp(4rem,7vw,7rem)] leading-none md:block font-medium tracking-tighter text-gold/25">
                  {pad(active)}
                </p>
                <p className="inline-flex items-center gap-2 font-mono text-[11px] md:mt-4 tracking-[0.2em] text-gold uppercase">
                  <ActiveIcon size={15} strokeWidth={1.9} aria-hidden />
                  {tab.eyebrow}
                </p>
                <h3 className="font-display mt-3 text-[clamp(1.75rem,2.6vw,2.75rem)] leading-[1.05] font-bold tracking-tight text-balance text-cream-gold">
                  {tab.title}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-bg/70 md:mx-0 md:mt-4">{tab.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Container>
      </div>

      {/* Reduced motion: the same features, stacked, no pin. */}
      <Container className="flex flex-col gap-16 pt-6 pb-24 motion-safe:hidden">
        {TABS.map((t, i) => {
          const Icon = icons[t.icon];
          return (
            <article key={t.id} className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
              <div className="md:flex-1">
                <p className="font-mono text-xs text-gold">{pad(i)}</p>
                <p className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-gold uppercase">
                  <Icon size={15} strokeWidth={1.9} aria-hidden />
                  {t.eyebrow}
                </p>
                <h3 className="font-display mt-3 text-3xl leading-[1.05] font-bold tracking-tight text-balance text-cream-gold">
                  {t.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-bg/70">{t.body}</p>
              </div>
              <div className="relative aspect-591/1280 w-[min(70vw,260px)] overflow-hidden rounded-[2.4rem] border-8 border-[#161412] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)]">
                <Image src={screen(t.id)} alt={`Klario ${t.eyebrow} screen`} fill sizes="260px" className="object-cover object-top" />
              </div>
            </article>
          );
        })}
      </Container>
    </section>
  );
}

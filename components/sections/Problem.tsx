"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Landmark, Bot, TrendingDown, PiggyBank, Briefcase, CreditCard, ArrowLeftRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CoinMark } from "@/components/ui/CoinMark";
import { GuillocheRosette } from "@/components/ui/Engraving";
import { PROBLEM } from "@/lib/constants";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const icons = { Landmark, Bot, TrendingDown, PiggyBank, Briefcase, CreditCard, ArrowLeftRight } as const;

// Bento placement on the 6-column grid, in card order: the first stat runs
// wide, the four that follow share the next rows, the two stat-less cards
// close it out as a dark pair.
const SPANS = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-3", "md:col-span-3"];

// Every card spans four rows of the section grid and lays its parts on them
// (subgrid), so the number, stat line, title and body each start on the same
// line as the cards beside them, however long any one of them runs.
const CARD_GRID = "flex flex-col md:row-span-4 md:grid md:grid-rows-subgrid md:gap-y-0";

/** "92% use two or more banks" -> { value: 92, suffix: "%", rest: "use two or more banks" } */
function splitStat(stat: string) {
  const m = stat.match(/^(\d+)(\S*)\s+(.*)$/);
  return m ? { value: Number(m[1]), suffix: m[2], rest: m[3] } : null;
}

type Card = (typeof PROBLEM.cards)[number];

function StatCard({ card, wide, span }: { card: Card; wide: boolean; span: string }) {
  const Icon = icons[card.icon as keyof typeof icons];
  const stat = "stat" in card ? splitStat(card.stat) : null;
  return (
    <article
      data-card
      className={cn(
        CARD_GRID,
        span,
        "group card-edge-engrave-gold relative overflow-hidden rounded-3xl border border-gold/15 bg-[#15120f] p-7 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.8)] transition-[translate,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-[0_36px_80px_-36px_rgba(193,154,107,0.35)] md:p-8"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          {stat && (
            <p
              className={cn(
                "font-display leading-[0.85] font-bold tracking-[-0.05em] text-gold",
                wide ? "text-[clamp(4.5rem,9vw,9rem)]" : "text-[clamp(3.75rem,6vw,6rem)]"
              )}
            >
              <span data-count={stat.value}>{stat.value}</span>
              {stat.suffix}
            </p>
          )}
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-dim text-gold transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-8">
            <Icon size={20} strokeWidth={1.6} aria-hidden />
          </span>
        </div>
        {/* The figure as a bar, filled to its share on arrival. */}
        {stat && (
          <div aria-hidden className="mt-6 h-1 w-full overflow-hidden rounded-full bg-gold/15">
            <div
              data-bar
              className="h-full origin-left rounded-full bg-gold"
              style={{ transform: `scaleX(${stat.value / 100})` }}
            />
          </div>
        )}
      </div>
      <p className="mt-6 font-mono text-[11px] tracking-[0.18em] text-gold uppercase">{stat?.rest}</p>
      <h3 className="font-display mt-3 text-xl font-semibold tracking-tight text-balance text-cream-gold md:text-2xl">
        {card.title}
      </h3>
      <p className={cn("mt-2 text-sm leading-relaxed text-bg/65 md:text-[15px]", wide && "md:max-w-xl")}>
        {card.body}
      </p>
    </article>
  );
}

function DarkCard({ card, reverse, span }: { card: Card; reverse: boolean; span: string }) {
  const Icon = icons[card.icon as keyof typeof icons];
  return (
    <article
      data-card
      className={cn(
        CARD_GRID,
        span,
        "group card-edge-engrave-gold relative isolate overflow-hidden rounded-3xl border border-gold/15 bg-[#15120f] p-7 text-bg transition-[translate] duration-500 ease-out hover:-translate-y-1.5 md:p-8"
      )}
    >
      <GuillocheRosette
        reverse={reverse}
        className="pointer-events-none absolute -top-1/3 -right-1/4 -z-10 h-[150%] w-auto text-gold-hi opacity-25 transition-opacity duration-500 group-hover:opacity-45"
      />
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 text-gold-hi transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-8">
        <Icon size={26} strokeWidth={1.5} aria-hidden />
      </span>
      <span aria-hidden />
      <h3 className="font-display mt-10 text-2xl font-semibold tracking-tight text-balance text-cream-gold md:text-3xl">
        {card.title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-bg/70 md:text-[15px]">{card.body}</p>
    </article>
  );
}

const HEAD_WORDS = PROBLEM.heading.lead.split(" ");

/**
 * The problem, stat first. The headline rises in word by word and its last
 * word ("blind.") comes into focus as you scroll into it. Below, a bento of
 * the problems: each sourced figure leads its card as a big number that
 * counts up, with a bar filling to its share; the two problems without a
 * figure close the grid as dark cards. Static and fully visible for reduced
 * motion.
 */
export function Problem() {
  const root = useRef<HTMLElement>(null);
  let dark = 0;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Headline: each word rises out of its own mask, then "blind." sharpens.
        gsap.from("[data-hw]", {
          yPercent: 110,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.05,
          scrollTrigger: { trigger: "[data-headline]", start: "top 85%", once: true },
        });
        gsap.fromTo(
          "[data-blind]",
          { filter: "blur(14px)", opacity: 0.35 },
          {
            filter: "blur(0px)",
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-headline]", start: "top 75%", end: "top 30%", scrub: 0.5 },
          }
        );

        // Cards come up a row at a time, slightly tipped, and settle.
        ScrollTrigger.batch("[data-card]", {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { y: 60, opacity: 0, rotateX: 8, transformPerspective: 900 },
              { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, clearProps: "transform" }
            ),
        });
        gsap.set("[data-card]", { opacity: 0 });

        // Numbers count up and bars fill as each card arrives.
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          const n = { v: 0 };
          el.textContent = "0";
          gsap.to(n, {
            v: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(n.v));
            },
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>("[data-bar]").forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            duration: 1.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="problem" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <Container>
        <p className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-gold uppercase">
          <CoinMark className="w-4" />
          {PROBLEM.label}
        </p>
        <h2
          data-headline
          className="font-display mt-6 max-w-6xl text-[clamp(2.5rem,6vw,6.25rem)] leading-[0.92] font-bold tracking-[-0.045em] text-cream-gold uppercase"
        >
          {HEAD_WORDS.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <span data-hw className="inline-block">
                {w}
              </span>
              {" "}
            </span>
          ))}
          <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
            <span data-hw className="inline-block">
              <span data-blind className="inline-block text-gold">
                {PROBLEM.heading.emphasis}
              </span>
            </span>
          </span>
        </h2>

        <div data-grid className="mt-14 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-6 md:gap-5">
          {PROBLEM.cards.map((card, i) => {
            const span = SPANS[i] ?? "md:col-span-2";
            return "stat" in card ? (
              <StatCard key={card.title} card={card} wide={i === 0} span={span} />
            ) : (
              <DarkCard key={card.title} card={card} reverse={dark++ % 2 === 1} span={span} />
            );
          })}
        </div>

        {/* Sourced, like every figure on the investor page. A stat with no
            provenance is worth less than no stat at all on a finance site. */}
        <p className="mt-8 max-w-3xl font-mono text-[11px] leading-relaxed text-bg/40">{PROBLEM.sources}</p>
      </Container>
    </section>
  );
}

"use client";

import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { WordRotator } from "@/components/ui/WordRotator";
import { CAROUSEL, Crossfade, useSlideshow } from "@/components/ui/Slideshow";
import { HERO, NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { computeBento, FALLBACK, GAP, type BentoLayout, type TileShape } from "./bentoShapes";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Flip words carry their own full stop (see the headline for why).
const FLIP_WORDS = HERO.flipWords.map((w) => `${w}${HERO.headline.suffix}`);
const PRODUCT_WORDS = HERO.product.words.map((w) => `${w}.`);

// Fill for the knocked-out statement: engraved naira-note portrait, brown
// line work on pale blue, so the letters stay crisp on ink.
const PORTRAIT = "/hero/portrait.jpg";

/**
 * Two lines of uppercase display type, first flush left and spanning the
 * tile, second flush right, with a slideshow of photos showing through the
 * letters. SVG so the block scales with the tile: the clipPath is the text,
 * every photo is stacked underneath and crossfades on a timer.
 */
// Where each word of the statement sits in the 1000 x 360 canvas, whose top
// is the title's bottom edge. The phone hangs over the right ~25% of the
// canvas down to y≈100, so only KNOW (left) may sit high; YOUR stays below
// that line. FINANCE is letter-spaced across the full width. Tilts are small
// so rows never cross (a 2° tilt lifts the far end of a 940-unit word ~33).
const SCATTER: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  rotate: number;
  /** Stretch the word to this width with letter-spacing. */
  spread?: number;
  /** Italic serif (Fraunces) instead of the display face. */
  serif?: boolean;
  upper?: boolean;
}> = [
  { x: 0, y: 128, size: 160, rotate: -3, serif: true },
  { x: 560, y: 110, size: 90, rotate: 4, serif: true },
  { x: 20, y: 236, size: 96, rotate: -1.5, spread: 960, upper: true },
  { x: 120, y: 326, size: 84, rotate: 5, serif: true },
  { x: 380, y: 352, size: 160, rotate: -2, serif: true },
];

function KnockoutStatement({ words, images }: { words: readonly string[]; images: string[] }) {
  const id = useId();
  const index = useSlideshow(images.length);

  return (
    <svg
      className="font-display h-full w-full"
      viewBox="0 0 1000 360"
      preserveAspectRatio="xMinYMin meet"
      role="img"
      aria-label={words.join(" ")}
    >
      {/* One group per word so each can drift on its own (.bento-float in
          globals.css): the clip and the photo move together. */}
      {words.map((w, i) => {
        const s = SCATTER[i % SCATTER.length];
        const clipId = `${id}-${i}`;
        return (
          <g
            key={w}
            className="bento-float"
            style={{ animationDuration: `${6.5 + i * 1.3}s`, animationDelay: `${-i * 2.1}s` }}
          >
            <clipPath id={clipId}>
              <text
                x={s.x}
                y={s.y}
                fontSize={s.size}
                fontWeight={s.serif ? "500" : "700"}
                letterSpacing={s.serif ? "-4" : "-2"}
                className={s.serif ? "font-serif italic" : undefined}
                transform={`rotate(${s.rotate} ${s.x} ${s.y})`}
                {...(s.spread ? { textLength: s.spread, lengthAdjust: "spacing" as const } : {})}
              >
                {s.upper ? w.toUpperCase() : w}
              </text>
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              {images.map((src, j) => (
                <image
                  key={src}
                  href={src}
                  width="1000"
                  height="360"
                  preserveAspectRatio="xMidYMid slice"
                  style={{ opacity: j === index ? 1 : 0, transition: "opacity 1.2s ease" }}
                />
              ))}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/** One rounded cell. Every tile carries data-tile so the scatter can find it. */
function Tile({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      data-tile
      style={style}
      className={cn(
        "relative overflow-hidden rounded-[22px] will-change-transform md:rounded-[28px]",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Shaped tile: on md+ it is placed absolutely from CSS vars and cut with a
 * clip-path. Before the first measurement the vars hold the plain grid cell
 * (see FALLBACK), so the server render already has the right layout.
 */
function Shaped({
  shape,
  fallback,
  clip = true,
  className,
  children,
}: {
  shape: TileShape | undefined;
  fallback: Record<string, string>;
  /** False for a tile on the page's own ink, where the cut-out is invisible. */
  clip?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const vars = shape
    ? {
        "--l": `${shape.x}px`,
        "--t": `${shape.y}px`,
        "--w": `${shape.w}px`,
        "--h": `${shape.h}px`,
        "--clip": clip ? shape.clip : "none",
      }
    : fallback;
  return (
    <Tile
      style={vars as CSSProperties}
      className={cn(
        "md:absolute md:left-(--l) md:top-(--t) md:h-(--h) md:w-(--w) md:rounded-none md:[clip-path:var(--clip)]",
        className
      )}
    >
      {children}
    </Tile>
  );
}

/**
 * Landing hero as a bento grid on the brand's dark base. The top row is the
 * page's navigation (the site Navbar slides in once this has scrolled away).
 * On md+ the section pins for ~1.2 screens and the tiles scatter off in
 * random directions. Static, stacked cards on phones and for reduced motion.
 */
export function BentoHero() {
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<BentoLayout | null>(null);

  // Measure the canvas and build the tile shapes; redo on resize. Below md
  // the tiles stack as plain rounded cards, so no shapes there.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const measure = () => {
      if (!mq.matches) return setLayout(null);
      const { width, height } = el.getBoundingClientRect();
      setLayout(computeBento(width, height));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      // Desktop only: on phones the grid stacks taller than the screen, so a
      // pinned scatter would fling tiles the visitor can't see. matchMedia
      // also tears the trigger down on its own when the viewport changes.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        // Each tile flies away from the centre of the grid, with its own spin
        // and a touch of randomness so the exit never looks like one block.
        tl.to(tiles, {
          x: () => gsap.utils.random(-70, 70, 5) + "vw",
          y: () => gsap.utils.random(-70, 70, 5) + "vh",
          rotation: () => gsap.utils.random(-28, 28, 2),
          scale: 0.6,
          opacity: 0,
          ease: "power2.in",
          stagger: { each: 0.04, from: "random" },
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="hero"
      className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink px-4 pt-20 pb-4 text-bg md:h-dvh md:min-h-160 md:px-8 md:pt-4 md:pb-4 lg:px-10"
    >
      <div className="flex w-full flex-1 flex-col gap-3 md:min-h-0">
        {/* Row 1 is the navigation: logo | links | CTA. Phones use the site
            Navbar instead (it is always visible there), so this row hides. */}
        <div className="hidden grid-cols-12 gap-3 md:grid">
          <Tile className="flex items-center bg-bg/[0.06] px-5 py-3 md:col-span-2">
            <Logo onDark />
          </Tile>
          <Tile className="flex items-center justify-center gap-8 bg-bg/[0.06] px-6 py-3 md:col-span-6 md:col-start-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-bg/75 transition-colors hover:text-gold"
              >
                {l.label}
              </a>
            ))}
          </Tile>
          <Tile className="md:col-span-2 md:col-start-11">
            <a
              href="/beta"
              className="foil-gold flex h-full items-center justify-center gap-1.5 bg-gold px-4 py-3 text-sm font-medium text-ink"
            >
              Get Started <ArrowUpRight size={14} />
            </a>
          </Tile>
        </div>

        {/* The four shaped tiles. Stacked on phones; a measured canvas on md+. */}
        <div
          ref={wrap}
          className="flex flex-col gap-3 md:relative md:block md:min-h-0 md:flex-1"
        >
          <Shaped
            shape={layout?.title}
            fallback={FALLBACK.title}
            className="flex flex-col items-center justify-center gap-8 bg-cream-gold p-5 text-center text-mahogany md:p-8 lg:p-10"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-gold bg-gold-dim px-3 py-1 text-[11px] font-medium tracking-wide text-mahogany">
                <span className="h-1.5 w-1.5 rounded-full bg-gold pulse-dot" />
                {HERO.badge}
              </span>
              <h1 className="font-display mt-5 text-balance text-[clamp(2rem,min(4vw,6.2vh),4.75rem)] leading-[0.98] text-mahogany">
                {HERO.headline.lead} <em className="not-italic text-gold">{HERO.headline.emphasis}</em>{" "}
                {HERO.headline.bridge}{" "}
                {/* Own centred line, period included in each word: the slot is
                    sized to the widest word, so a trailing period would sit
                    after a gap whenever a shorter word is showing. */}
                <WordRotator
                  words={FLIP_WORDS}
                  interval={4200}
                  mode="flip"
                  className="grid justify-items-center text-gold uppercase"
                />
              </h1>
            </div>

            <div className="flex w-full max-w-md flex-wrap justify-center gap-3">
              <Button href={SITE.downloadHref} size="lg" variant="solid" className="min-w-48 flex-1">
                Download on iOS
              </Button>
              <Button
                href={SITE.downloadHref}
                size="lg"
                variant="outline"
                className="min-w-48 flex-1 border-mahogany/30 text-mahogany hover:border-mahogany hover:bg-mahogany/5"
              >
                Get on Android
              </Button>
            </div>
          </Shaped>

          <Shaped shape={layout?.phone} fallback={FALLBACK.phone} className="min-h-65 bg-mahogany">
            <Crossfade images={CAROUSEL} sizes="(min-width: 768px) 50vw, 100vw" />
            <span className="absolute top-4 right-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-bg backdrop-blur">
              Every account, one screen
            </span>
          </Shaped>

          {/* The statement tile has no background and no clip: its box overlaps
              the phone's tongue and the product wedge, and only the two lines
              of knocked-out type should show. The right padding below keeps
              the type out of the wedge. */}
          <Shaped shape={layout?.wide} fallback={FALLBACK.wide} clip={false} className="flex min-h-40 items-center bg-transparent">
            {/* Right padding clears the product wedge's notch. The phone's
                overhang on the right is handled by where the words sit. */}
            <div
              className="h-full w-full"
              style={layout ? { paddingRight: layout.wide.w - layout.product.x + GAP } : undefined}
            >
              <KnockoutStatement words={HERO.statement.words} images={[PORTRAIT]} />
            </div>
          </Shaped>

          <Shaped shape={layout?.product} fallback={FALLBACK.product} className="min-h-55 bg-surface">
            {/* Engraved scene drawn by scripts/hero-illustration.mjs; its motifs
                keep clear of the bottom-right, where the text sits. SVG, so it
                skips the image optimiser. */}
            <Image
              src="/hero/illustration.svg"
              alt="Engraved illustration: a budget ledger, a shopfront, a debt card cut in two and stamped paid, and a piggy bank with naira coins"
              fill
              unoptimized
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover object-top-left"
            />
            <div className="absolute inset-0 flex flex-col items-end justify-end bg-linear-to-tl from-cream-gold via-cream-gold/70 via-35% to-transparent to-60% p-5 text-right text-mahogany">
              <span className="text-[11px] font-semibold tracking-wide text-mahogany/70">{HERO.product.label}</span>
              <p className="font-display mt-1 max-w-72 text-balance text-2xl leading-tight lg:text-3xl">
                {HERO.product.lead}{" "}
                <WordRotator
                  words={PRODUCT_WORDS}
                  interval={4800}
                  mode="flip"
                  className="grid justify-items-end text-gold uppercase"
                />
              </p>
            </div>
          </Shaped>
        </div>
      </div>
    </section>
  );
}

import { Fragment } from "react";
import { CoinMark } from "@/components/ui/CoinMark";
import { GuillocheRosette } from "@/components/ui/Engraving";
import { WordRotator } from "@/components/ui/WordRotator";
import { HERO } from "@/lib/constants";
import { cn } from "@/lib/utils";

// The landing hero's three beats, in scroll order: the verbs, the
// positioning line, the tagline. KlarioHero stacks them and plays them in
// turn as you scroll, on every screen size; with reduced motion the verbs
// stay in the hero and the other two show in HeroCopyFallback below it.
// Every piece is decorative (aria-hidden): KlarioHero's sr-only h1 carries
// the words once.
//
// `hidden` starts a piece fully transparent in CSS, so nothing flashes
// before the scroll timeline takes over. Hooks for that timeline:
// data-reveal="verb" | "word", data-split="left" | "right", data-mark.

const SENTENCE_WORDS = [
  ...HERO.headline.lead.split(" ").map((w) => ({ w, gold: false })),
  ...HERO.headline.emphasis.split(" ").map((w) => ({ w, gold: true })),
].map((x, i, all) => (i === all.length - 1 ? { ...x, w: `${x.w}${HERO.headline.suffix}` } : x));

// The flip word carries its own full stop so it never trails a gap when a
// short word shows in a slot sized for the longest one.
const TAGLINE_WORDS = HERO.rotatingWords.map((w) => `${w}${HERO.line2.suffix}`);

export const HERO_SENTENCE = [
  `${HERO.flipWords.map((w) => w[0].toUpperCase() + w.slice(1)).join(", ")}.`,
  `${HERO.headline.lead} ${HERO.headline.emphasis}${HERO.headline.suffix}`,
  `${HERO.line1.lead} ${HERO.line1.emphasis} ${HERO.line2.prefix} ${HERO.rotatingWords[0]}${HERO.line2.suffix}`,
].join(" ");

/** Beat 1: CONNECT ◐ TRACK ◐ UNDERSTAND, the coins from the wordmark. */
export function Verbs({ className }: { className?: string }) {
  return (
    <p
      aria-hidden
      className={cn(
        "font-display flex flex-col items-center justify-center gap-y-[0.18em] text-center text-[clamp(3rem,13vw,5rem)] md:flex-row md:flex-nowrap md:gap-x-[0.4em] md:text-[clamp(2.5rem,5.2vw,7rem)] leading-none font-bold tracking-[-0.035em] text-cream-gold uppercase",
        className
      )}
    >
      {HERO.flipWords.map((w, i) => (
        <Fragment key={w}>
          {i > 0 && <CoinMark data-reveal="verb" className="w-[0.42em] md:w-[0.55em]" />}
          <span data-reveal="verb">{w}</span>
        </Fragment>
      ))}
    </p>
  );
}

/** Beat 2: the positioning line, one span per word. */
export function Sentence({ hidden = false, className }: { hidden?: boolean; className?: string }) {
  return (
    <p
      aria-hidden
      className={cn(
        "font-display mx-auto max-w-6xl text-center text-[clamp(2.5rem,10.5vw,3.75rem)] leading-[1.02] md:text-[clamp(2.25rem,5.4vw,6rem)] font-bold tracking-[-0.035em] text-balance",
        className
      )}
    >
      {SENTENCE_WORDS.map(({ w, gold }, i) => (
        <span
          key={i}
          data-reveal="word"
          className={cn("inline-block", gold ? "text-gold" : "text-cream-gold", hidden && "opacity-0")}
        >
          {w}
          {i < SENTENCE_WORDS.length - 1 && " "}
        </span>
      ))}
    </p>
  );
}

/** Beat 3: YOUR MONEY, FINALLY ◐ IN YOUR [flip], split to the two sides. */
export function Tagline({ hidden = false, className }: { hidden?: boolean; className?: string }) {
  return (
    <p
      aria-hidden
      className={cn(
        "font-display flex w-full flex-col gap-4 text-[clamp(2.75rem,12.5vw,4.5rem)] leading-[0.86] md:text-[clamp(2.5rem,6.2vw,7.75rem)] font-bold tracking-[-0.045em] uppercase md:w-auto md:flex-row md:items-center md:justify-center md:gap-[4vw]",
        className
      )}
    >
      <span data-split="left" className={cn("block text-cream-gold md:whitespace-nowrap", hidden && "opacity-0")}>
        {HERO.line1.lead}
        <br />
        {HERO.line1.emphasis}
      </span>
      {/* Flex item, so it sits mid-gap however wide each half is. Phones
          stack the halves, so there is no gap to fill there. */}
      <CoinMark
        data-mark
        className={cn(
          "hidden w-[min(6vw,110px)] shrink-0 drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)] md:block",
          hidden && "opacity-0"
        )}
      />
      <span data-split="right" className={cn("block md:text-right md:whitespace-nowrap", hidden && "opacity-0")}>
        <span className="text-cream-gold">{HERO.line2.prefix}</span>
        <br />
        <WordRotator
          words={TAGLINE_WORDS}
          interval={4200}
          mode="flip"
          className="grid justify-items-start text-gold md:justify-items-end"
        />
      </span>
    </p>
  );
}

/**
 * Beats 2 and 3 as a plain section, for reduced motion only (the hero
 * doesn't pin then). Everyone else sees them play in the hero.
 */
export function HeroCopyFallback() {
  return (
    <section
      aria-hidden
      className="relative isolate flex flex-col items-center justify-center gap-20 overflow-hidden bg-ink px-6 py-24 text-bg motion-safe:hidden"
    >
      <GuillocheRosette className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[120%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />
      <Sentence />
      <Tagline />
    </section>
  );
}

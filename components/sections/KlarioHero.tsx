"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Building2, Landmark, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GuillocheRosette } from "@/components/ui/Engraving";
import { Logo } from "@/components/layout/Logo";
import { QrCode } from "@/components/ui/QrCode";
import { CAROUSEL, Crossfade } from "@/components/ui/Slideshow";
import { HERO_SENTENCE, Sentence, Tagline, Verbs } from "@/components/sections/HeroCopy";
import { HERO, NAV_LINKS, SITE } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TRUST_ICONS = { Building2, Landmark, Lock } as const;

/**
 * Full-bleed landing hero: the painting carousel behind an ink wash, a glass
 * nav pill, a scan-to-join card and a trust row, with three beats of copy
 * stacked in the middle (see HeroCopy). The hero pins and plays
 * them in turn as you scroll: the verbs, then the positioning line word by
 * word, then the tagline sliding in from the sides, on phones and desktop
 * alike. Reduced motion sees the verbs here and the other two beats in
 * HeroCopyFallback.
 */
export function KlarioHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=300%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        tl.to("[data-bg]", { scale: 1.12, duration: 3.9 }, 0)
          // Beat 1 leaves, with the chrome around it.
          .to("[data-reveal='verb']", { opacity: 0, y: -40, duration: 0.5, stagger: 0.05 }, 0)
          .to("[data-trust]", { opacity: 0, duration: 0.4 }, 0)
          .to("[data-dim]", { opacity: 0.5, duration: 0.6 }, 0.2)
          // Beat 2 lights up word by word, holds, then leaves.
          .fromTo(
            "[data-reveal='word']",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: "power2.out" },
            0.6
          )
          .to("[data-reveal='word']", { opacity: 0, y: -30, duration: 0.4 }, 2.4)
          // Beat 3 slides in from the sides and holds.
          .fromTo("[data-split='left']", { xPercent: -45, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, 2.8)
          .fromTo("[data-split='right']", { xPercent: 45, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, 2.8)
          .fromTo("[data-mark]", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }, 2.95)
          .to({}, { duration: 0.4 })
          // The rosettes turn with the scroll for the whole pin, in opposite
          // directions.
          .fromTo("[data-rosette='fwd']", { rotation: 0 }, { rotation: 220, svgOrigin: "250 250", duration: 3.9 }, 0)
          .fromTo("[data-rosette='rev']", { rotation: 0 }, { rotation: -220, svgOrigin: "250 250", duration: 3.9 }, 0);
      });
    },
    { scope: root }
  );

  // Sized to the large viewport, not dvh: the pin freezes the hero at its
  // measured height, and on phones the browser chrome collapses as you scroll,
  // so a dvh hero would end short of the screen and leave an ink band below.
  // The trust row's bottom padding adds back the chrome's height (lvh - svh,
  // zero on desktop) so the button still clears it before it collapses.
  return (
    <section
      ref={root}
      id="hero"
      className="relative isolate flex h-lvh min-h-160 flex-col overflow-hidden bg-ink text-bg"
    >
      <h1 className="sr-only">{HERO_SENTENCE}</h1>

      {/* Background: carousel, then an ink wash darker at top and bottom so
          the nav and trust row stay legible on any painting. The dim layer
          deepens the wash once the first beat has gone. */}
      <div data-bg className="absolute inset-0 -z-10">
        <Crossfade images={CAROUSEL} sizes="100vw" ms={6000} kenBurns />
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-ink/70 via-ink/35 to-ink/85" />
      <div data-dim aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-ink opacity-0" />

      {/* Engraved rosettes bleeding off opposite corners, turned by the
          scroll timeline above. */}
      <GuillocheRosette
        spin="scroll"
        className="pointer-events-none absolute top-[-16%] right-[-30%] z-0 h-[48%] w-auto md:right-[-9%] md:h-[78%] text-gold-hi opacity-60 mix-blend-screen"
      />
      <GuillocheRosette
        spin="scroll"
        reverse
        className="pointer-events-none absolute bottom-[-20%] left-[-34%] z-0 h-[40%] w-auto md:left-[-10%] md:h-[60%] text-gold-hi opacity-45 mix-blend-screen"
      />

      {/* Glass nav pill. Phones get the site Navbar instead. */}
      <header data-pill className="relative z-20 mx-4 mt-4 hidden items-center justify-between rounded-full border border-bg/15 bg-ink/25 py-2 pr-2 pl-6 backdrop-blur-md md:mx-8 md:flex lg:mx-auto lg:w-full lg:max-w-6xl">
        <Logo onDark />
        <nav className="flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-bg/85 transition-colors hover:text-gold">
              {l.label}
            </a>
          ))}
        </nav>
        <Button href="/beta" size="md" className="px-6">
          Get Started <ArrowUpRight size={15} />
        </Button>
      </header>

      {/* The three beats, stacked in one stage. Beats 2 and 3 start hidden
          in CSS and only exist here where the hero pins. */}
      <div className="relative z-10 flex-1">
        <div className="absolute inset-0 flex items-center justify-center px-6 pt-16 md:pt-0">
          <Verbs />
        </div>
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center px-6 motion-safe:flex">
          <Sentence hidden />
        </div>
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center px-6 motion-safe:flex md:px-12">
          <Tagline hidden />
        </div>
      </div>

      {/* Scan card on desktop (scanning your own screen on a phone is
          pointless); a plain button on phones. */}
      <div className="relative z-10 flex justify-center pb-6">
        <a
          data-scan
          href={HERO.scan.href}
          className="hidden items-center gap-6 rounded-2xl bg-bg py-3.5 pr-3.5 pl-5 text-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-0.5 md:flex"
        >
          <span>
            <span className="font-display block text-xl leading-[0.95] font-bold tracking-tight text-mahogany uppercase">
              {HERO.scan.title[0]}
              <br />
              {HERO.scan.title[1]}
            </span>
            <span className="mt-1.5 block text-xs text-body">{HERO.scan.body}</span>
          </span>
          <QrCode value={`${SITE.url}${HERO.scan.href}`} className="h-18 w-18" color="#4e2c20" background="#f4f1e8" />
        </a>
        <Button href={HERO.scan.href} size="lg" className="md:hidden">
          Join the beta <ArrowUpRight size={16} />
        </Button>
      </div>

      {/* Trust row */}
      <ul data-trust className="relative z-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 pb-[calc(1.5rem+100lvh-100svh)] text-xs font-medium text-bg/80">
        {HERO.trust.map((t) => {
          const Icon = TRUST_ICONS[t.icon];
          return (
            <li key={t.label} className="flex items-center gap-2">
              <Icon size={14} className="text-gold" aria-hidden />
              {t.label}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

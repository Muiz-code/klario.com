"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GuillocheRosette } from "@/components/ui/Engraving";
import { TEAM, TEAM_INTRO, DISCIPLINES, initialsOf } from "@/lib/team";

/**
 * How much scrolling each person gets while the panel is pinned. The track is
 * this tall per member, on top of the one screen the pin itself occupies.
 */
const DWELL_VH = 30;


/**
 * The roster: nine people on the left, one portrait on the right.
 *
 * On desktop the panel is PINNED — it holds still while you scroll, stepping
 * through the team one at a time, and only releases once the last person has
 * had their turn. Without that you scroll past mid-portrait and never actually
 * see anyone.
 *
 * The page is never hijacked: a tall track behind a `sticky` panel does the
 * work, so scrolling stays at whatever speed the reader chose and a flick of
 * the wheel still carries them straight past.
 *
 * Below the pin breakpoint it's ordinary flow — pinning a full-height panel on
 * a phone costs more than it gives — and rows are tapped instead.
 */
export function Team() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Only where the panel actually pins.
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const box = track.getBoundingClientRect();
      // How far the track scrolls while the panel is stuck to the top.
      const travel = box.height - window.innerHeight;
      if (travel <= 0) return;
      const progress = Math.min(Math.max(-box.top / travel, 0), 1);
      setActive(Math.min(TEAM.length - 1, Math.floor(progress * TEAM.length)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="team" className="relative bg-ink text-bg">
      {/* Intro scrolls in normally, then hands over to the pinned panel. */}
      <Container className="relative z-10 pt-24 md:pt-32">
        <ScrollReveal>
          <SectionLabel>{TEAM_INTRO.eyebrow}</SectionLabel>
          <h2 className="mt-5 max-w-[16ch] font-display text-3xl leading-[1.06] tracking-tight text-cream-gold sm:text-4xl md:text-5xl">
            {TEAM_INTRO.heading}{" "}
            <span className="text-gold-hi">{TEAM_INTRO.emphasis}</span>
          </h2>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-bg/65 md:text-base">
            {TEAM_INTRO.lede}
          </p>
        </ScrollReveal>
      </Container>

      {/*
        The track. Its height is what the pin spends: one screen for the panel,
        plus a slice per person. On mobile it collapses to normal flow.
      */}
      <div
        ref={trackRef}
        className="relative md:h-(--team-track)"
        style={{ "--team-track": `${100 + TEAM.length * DWELL_VH}vh` } as React.CSSProperties}
      >
        <div className="md:sticky md:top-0 md:flex md:h-screen md:items-center">
          {/* Clipped in its own layer: overflow-hidden on an ancestor of the
              sticky panel would stop it sticking at all. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <GuillocheRosette className="absolute left-1/2 top-1/2 w-[min(1400px,150vw)] -translate-x-1/2 -translate-y-1/2 opacity-[0.10]" />
          </div>

          <Container className="relative z-10 w-full py-12 md:py-0">
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
              {/* Roster */}
              <ul className="order-2 list-none border-t border-bg/10 md:order-1">
                {TEAM.map((person, i) => {
                  const on = i === active;
                  return (
                    <li key={`${person.name}-${i}`}>
                      <button
                        type="button"
                        aria-current={on}
                        aria-controls="team-portrait"
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        onClick={() => setActive(i)}
                        className={
                          "group grid w-full grid-cols-[44px_1fr_auto] items-center gap-3.5 border-b border-bg/10 py-3.5 pr-1.5 text-left transition-all duration-300 ease-out hover:pl-3 focus-visible:pl-3 focus-visible:outline-none " +
                          (on
                            ? "bg-linear-to-r from-gold/10 to-transparent pl-3"
                            : "pl-0 hover:bg-linear-to-r hover:from-gold/[0.07] hover:to-transparent")
                        }
                      >
                        <span
                          className={
                            "font-mono text-[11px] font-bold tracking-[0.1em] transition-colors " +
                            (on ? "text-gold-hi" : "text-bg/40")
                          }
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span
                            className={
                              "block font-display text-base font-bold leading-tight transition-colors sm:text-lg md:text-[1.05rem] lg:text-xl " +
                              (on ? "text-cream-gold" : "text-bg/75 group-hover:text-cream-gold")
                            }
                          >
                            <span
                              className={
                                "mr-2 font-mono text-[0.72em] font-bold tracking-[0.08em] transition-colors " +
                                (on ? "text-gold-hi" : "text-gold/55")
                              }
                            >
                              {person.initials ?? initialsOf(person.name)}
                            </span>
                            {person.name}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] text-bg/45">
                            {person.role}
                          </span>
                        </span>
                        <ArrowRight
                          size={15}
                          aria-hidden
                          className={
                            "text-gold transition-all duration-300 " +
                            (on
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-1.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")
                          }
                        />
                      </button>

                      {/*
                        Mobile: the portrait belongs under the row you tapped.
                        Above md it lives in the pinned column instead, so this
                        whole panel is hidden there rather than duplicated.
                        The 0fr→1fr grid trick animates the height without
                        having to measure it.
                      */}
                      <div
                        className={
                          "grid overflow-hidden transition-all duration-500 ease-out md:hidden " +
                          (on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
                        }
                      >
                        <div className="min-h-0">
                          <div className="relative h-[64vw] max-h-[380px] w-full">
                            <span
                              aria-hidden
                              className="absolute inset-x-0 bottom-0 top-[8%] bg-[radial-gradient(closest-side_at_50%_60%,rgba(193,154,107,0.16),transparent_78%)]"
                            />
                            {person.photo ? (
                              <Image
                                src={person.photo}
                                alt={person.name}
                                fill
                                sizes="92vw"
                                className="object-contain object-bottom"
                              />
                            ) : (
                              <div className="grid h-full place-items-center">
                                <span className="font-display text-6xl font-bold tracking-wide text-gold/85">
                                  {person.initials ?? initialsOf(person.name)}
                                </span>
                              </div>
                            )}
                            <span
                              aria-hidden
                              className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-b from-transparent to-ink"
                            />
                          </div>
                          {person.division && (
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bg/40">
                              {person.division}
                            </p>
                          )}
                          <p className="mb-4 mt-2 text-[13.5px] leading-relaxed text-bg/70">
                            {person.line}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* The shape of the team, for mobile — desktop shows it under
                  the pinned portrait instead. */}
              <dl className="order-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-bg/10 pt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-bg/45 md:hidden">
                {DISCIPLINES.map((d) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <dt>{d.label}</dt>
                    <dd className="text-cream-gold">{d.count}</dd>
                  </div>
                ))}
              </dl>

              {/* Portrait — no frame, no panel: the cut-out floats on the
                  section itself, in its own colour. */}
              <div className="order-1 hidden md:order-2 md:block">
                <div
                  id="team-portrait"
                  className="relative h-[54vw] max-h-[420px] md:h-[min(56vh,520px)] md:max-h-none"
                >
                  {/* A soft pool of warm light, so the figure is seated in the
                      page rather than pasted onto it. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 top-[8%] bg-[radial-gradient(closest-side_at_50%_60%,rgba(193,154,107,0.16),transparent_78%)]"
                  />

                  {TEAM.map((person, i) => {
                    const on = i === active;
                    return (
                      <div
                        key={`${person.name}-${i}`}
                        aria-hidden={!on}
                        className={
                          "absolute inset-0 transition-all duration-500 ease-out " +
                          (on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")
                        }
                      >
                        {person.photo ? (
                          <Image
                            src={person.photo}
                            alt={person.name}
                            fill
                            sizes="(max-width: 768px) 92vw, 40vw"
                            // Cut-out PNG, shown as shot — no colour filters. Contain keeps
                            // the head whole and bottom-alignment stands the
                            // person on the caption below.
                            className="object-contain object-bottom"
                            priority={i === 0}
                          />
                        ) : (
                          <div className="grid h-full place-items-center">
                            <span className="font-display text-6xl font-bold tracking-wide text-gold/85 md:text-7xl">
                              {person.initials ?? initialsOf(person.name)}
                            </span>
                          </div>
                        )}

                        {/* Fades the cut-off base of the figure into the page,
                            so it floats instead of ending on a hard edge. */}
                        <span
                          aria-hidden
                          className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-b from-transparent to-ink"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Caption sits under the figure — no card, no overlay. */}
                <div className="mt-5 min-h-[132px]">
                  {TEAM.map((person, i) =>
                    i === active ? (
                      <div key={`${person.name}-caption-${i}`}>
                        <p className="font-display text-xl font-bold text-cream-gold sm:text-2xl">
                          {person.name}
                        </p>
                        <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold-hi">
                          {person.role}
                        </p>
                        {person.division && (
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bg/40">
                            {person.division}
                          </p>
                        )}
                        <p className="mt-3 max-w-[42ch] text-[13.5px] leading-relaxed text-bg/70">
                          {person.line}
                        </p>
                      </div>
                    ) : null
                  )}
                </div>

                <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-bg/10 pt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-bg/45">
                  {DISCIPLINES.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <dt>{d.label}</dt>
                      <dd className="text-cream-gold">{d.count}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Tail, so the pin releases into space rather than straight into the
          next section's heading. */}
      <div className="h-16 md:h-24" />
    </section>
  );
}

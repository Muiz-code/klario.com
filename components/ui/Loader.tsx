"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import wordmark from "@/public/Klario-primary-and-secondary-Logo.png";

// The alignment mark, generated from maths (never an image). Two arcs per ring
// interrupted by the vertical channel; left arc -> .hl plate, right arc -> .hr.
const NS = "http://www.w3.org/2000/svg";
const C = 100;
const CHAN = 7.6;
const RINGS: [number, string, boolean][] = [
  [69, "r1", false],
  [50, "r2", true],
  [33, "r3", false],
];

function arcs(r: number): [string, string] {
  const phi = Math.asin(Math.min(1, CHAN / r));
  const dx = r * Math.cos(phi);
  const dy = r * Math.sin(phi);
  return [
    `M ${(C + dx).toFixed(2)} ${(C - dy).toFixed(2)} A ${r} ${r} 0 0 1 ${(C + dx).toFixed(2)} ${(C + dy).toFixed(2)}`,
    `M ${(C - dx).toFixed(2)} ${(C + dy).toFixed(2)} A ${r} ${r} 0 0 1 ${(C - dx).toFixed(2)} ${(C - dy).toFixed(2)}`,
  ];
}

function buildDial(svg: SVGSVGElement | null) {
  if (!svg) return;
  svg.replaceChildren();
  const grp = document.createElementNS(NS, "g");
  grp.setAttribute("class", "grp");
  const HL = document.createElementNS(NS, "g");
  HL.setAttribute("class", "hl");
  const HR = document.createElementNS(NS, "g");
  HR.setAttribute("class", "hr");

  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const long = i % 4 === 0;
    const r0 = 80;
    const r1 = long ? 86 : 83;
    const x1 = C + r0 * Math.cos(a);
    const y1 = C + r0 * Math.sin(a);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", x1.toFixed(2));
    l.setAttribute("y1", y1.toFixed(2));
    l.setAttribute("x2", (C + r1 * Math.cos(a)).toFixed(2));
    l.setAttribute("y2", (C + r1 * Math.sin(a)).toFixed(2));
    l.setAttribute("class", "tick");
    (x1 < C ? HL : HR).appendChild(l);
  }

  RINGS.forEach(([r, cls, soft]) => {
    const gL = document.createElementNS(NS, "g");
    gL.setAttribute("class", cls);
    const gR = document.createElementNS(NS, "g");
    gR.setAttribute("class", cls);
    const [right, left] = arcs(r);
    ([[left, gL], [right, gR]] as const).forEach(([d, g]) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("class", "ring" + (soft ? " soft" : ""));
      g.appendChild(p);
    });
    HL.appendChild(gL);
    HR.appendChild(gR);
  });

  grp.appendChild(HL);
  grp.appendChild(HR);
  svg.appendChild(grp);
}

// Timeline presets. `cycle` is the dial's spin/settle duration; the rings lock
// aligned at ~75% of it, so `line` (guide grows) must come after that, then
// `open` (page splits). Splash also swaps the intro line to the message.
const TIMINGS = {
  splash: { cycle: "1.8s", line: 1450, swap: 1750, open: 2350, done: 3150 },
  quick: { cycle: "0.9s", line: 760, swap: 760, open: 1280, done: 1900 },
};

// One half of the loader composition. Both halves render the SAME screen-centred
// dial + tagline; each curtain clips it to its side, so together they read as one
// and split apart when the curtains part.
function Half({
  svgRef,
  labelled,
  tagline,
  showLogo,
  cycle,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  labelled?: boolean;
  tagline: string;
  showLogo: boolean;
  cycle: string;
}) {
  return (
    <div className="flex h-full w-screen flex-col items-center justify-center gap-8">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        {...(labelled ? { role: "img", "aria-label": "Loading" } : { "aria-hidden": true })}
        className="kdial spin h-28 w-28 md:h-32 md:w-32"
        style={{ "--cycle": cycle } as React.CSSProperties}
      />
      {showLogo ? (
        <Image
          src={wordmark}
          alt="Klario"
          priority
          className="animate-[fadeUp_0.5s_ease] h-auto w-52 md:w-64"
        />
      ) : (
        <p
          key={tagline}
          className="animate-[fadeUp_0.5s_ease] whitespace-nowrap font-display text-xl font-medium tracking-tight text-gold/85 md:text-2xl"
        >
          {tagline}
        </p>
      )}
    </div>
  );
}

/**
 * Full-screen reveal: the dial settles, a guide line grows to full page height,
 * then the two halves split the page (mark + tagline included) to reveal the
 * content behind. `intro` (optional) shows first and swaps to `message`.
 */
export function Loader({
  message,
  intro,
  logo = false,
  quick = false,
  onFinished,
}: {
  message: string;
  intro?: string;
  logo?: boolean;
  quick?: boolean;
  onFinished?: () => void;
}) {
  const leftRef = useRef<SVGSVGElement>(null);
  const rightRef = useRef<SVGSVGElement>(null);
  const [tagline, setTagline] = useState(intro ?? message);
  const [showLogo, setShowLogo] = useState(false);
  const [lineFull, setLineFull] = useState(false);
  const [opening, setOpening] = useState(false);
  const cycle = (quick ? TIMINGS.quick : TIMINGS.splash).cycle;

  useEffect(() => {
    buildDial(leftRef.current);
    buildDial(rightRef.current);
  }, []);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const t = setTimeout(() => onFinished?.(), 400);
      return () => clearTimeout(t);
    }

    const T = quick ? TIMINGS.quick : TIMINGS.splash;
    const timers = [
      setTimeout(() => setLineFull(true), T.line),
      setTimeout(() => setOpening(true), T.open),
      setTimeout(() => onFinished?.(), T.done),
    ];
    if (intro)
      timers.push(
        setTimeout(() => {
          if (logo) setShowLogo(true);
          else setTagline(message);
        }, T.swap)
      );
    return () => timers.forEach(clearTimeout);
  }, [intro, message, logo, quick, onFinished]);

  const curtain = "transform 800ms cubic-bezier(.5,0,.2,1)";

  return (
    <div className="fixed inset-0 z-100 overflow-hidden" aria-hidden={opening}>
      {/* LEFT half of the page — carries the left half of the mark + tagline */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 overflow-hidden bg-ink"
        style={{ transform: opening ? "translateX(-100%)" : "translateX(0)", transition: curtain }}
      >
        <div className="absolute inset-y-0 left-0">
          <Half svgRef={leftRef} tagline={tagline} showLogo={showLogo} cycle={cycle} />
        </div>
      </div>

      {/* RIGHT half — carries the right half; shifted so its composition is
          centred on the same screen point as the left one */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 overflow-hidden bg-ink"
        style={{ transform: opening ? "translateX(100%)" : "translateX(0)", transition: curtain }}
      >
        <div className="absolute inset-y-0" style={{ left: "-50vw" }}>
          <Half svgRef={rightRef} labelled tagline={tagline} showLogo={showLogo} cycle={cycle} />
        </div>
      </div>

      {/* the guide line: grows from the centre to the full page height, then the
          page splits along it */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-1/2 w-px bg-gold"
        style={{
          transformOrigin: "center",
          transform: `translateX(-50%) scaleY(${lineFull ? 1 : 0})`,
          opacity: opening ? 0 : lineFull ? 0.75 : 0,
          transition: "transform 560ms ease-out, opacity 400ms ease",
        }}
      />
    </div>
  );
}

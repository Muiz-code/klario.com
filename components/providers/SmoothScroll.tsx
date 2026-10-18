"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling for the marketing pages (Lenis). In-page links such as
 * #security glide to their section. Anything that scrolls on its own (a
 * modal, a list) keeps its own scroll. Skipped on the admin console, which
 * is a working tool, and for anyone who asked their system for reduced
 * motion.
 *
 * Lenis is driven from GSAP's ticker rather than its own rAF so ScrollTrigger
 * (the bento hero's scatter) reads the same scroll position on the same frame.
 * Two clocks here and pinned sections judder.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const off = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (off || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: false, anchors: true, allowNestedScroll: true, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [off]);

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Smooth scrolling for the marketing pages (Lenis). In-page links such as
 * #security glide to their section. Anything that scrolls on its own (a
 * modal, a list) keeps its own scroll. Skipped on the admin console, which
 * is a working tool, and for anyone who asked their system for reduced
 * motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const off = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (off || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, allowNestedScroll: true, lerp: 0.1 });
    return () => lenis.destroy();
  }, [off]);

  return null;
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// The landing carousel: Caro1–Caro10.webp in public/hero/caro. Warm and busy,
// so they hold up under an ink wash. Change the count when slides are added
// or removed; a missing file shows as a blank slide, not a build error.
export const CAROUSEL = Array.from({ length: 10 }, (_, i) => `/hero/caro/Caro${i + 1}.webp`);
export const CAROUSEL_MS = 3800;

/** Advances through `n` slides on a timer; stays on the first for reduced motion. */
export function useSlideshow(n: number, ms = CAROUSEL_MS) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms]);
  return index;
}

/**
 * Photos stacked edge to edge, crossfading on the slideshow timer. With
 * `kenBurns`, the showing slide also eases in by a few percent over its turn.
 */
export function Crossfade({
  images,
  sizes,
  ms = CAROUSEL_MS,
  kenBurns = false,
}: {
  images: string[];
  sizes: string;
  ms?: number;
  kenBurns?: boolean;
}) {
  const index = useSlideshow(images.length, ms);
  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes={sizes}
          style={kenBurns ? { transitionDuration: `1000ms, ${ms + 1000}ms` } : undefined}
          className={cn(
            "object-cover ease-in-out",
            kenBurns ? "transition-[opacity,transform]" : "transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
            kenBurns && (i === index ? "scale-[1.08]" : "scale-100")
          )}
        />
      ))}
    </>
  );
}

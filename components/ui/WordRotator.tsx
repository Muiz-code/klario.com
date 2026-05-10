"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLITCH_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ$%&#@!*+=";

export function WordRotator({
  words,
  interval = 2600,
  scrambleMs = 420,
  className,
}: {
  words: readonly string[];
  interval?: number;
  scrambleMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(words[0]);
  const [glitching, setGlitching] = useState(false);
  const isFirst = useRef(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const target = words[index];
    setGlitching(true);
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / scrambleMs, 1);
      const reveal = Math.floor(t * target.length);
      let out = "";
      for (let i = 0; i < target.length; i++) {
        out +=
          i < reveal
            ? target[i]
            : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
      setDisplay(out);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        setGlitching(false);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [index, words, scrambleMs]);

  return (
    <span
      className={cn("inline-block whitespace-nowrap align-baseline", className)}
      style={{
        textShadow: glitching
          ? "2px 0 rgba(255,0,60,0.55), -2px 0 rgba(0,229,255,0.55)"
          : "none",
        transform: glitching ? "translateX(-1px)" : "translateX(0)",
        transition: glitching ? "none" : "text-shadow 0.18s, transform 0.18s",
      }}
    >
      {display}
    </span>
  );
}

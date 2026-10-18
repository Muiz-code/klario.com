"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const GLITCH_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ$%&#@!*+=";
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Cycles through `words`. Two transitions: "glitch" scrambles characters
 * into the next word (the original), "flip" turns the word over on a
 * horizontal axis like a split-flap board.
 */
export function WordRotator({
  words,
  interval = 2600,
  scrambleMs = 420,
  mode = "glitch",
  className,
}: {
  words: readonly string[];
  interval?: number;
  scrambleMs?: number;
  mode?: "glitch" | "flip";
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  if (mode === "flip") return <Flip words={words} word={words[index]} className={className} />;
  return <Glitch words={words} index={index} scrambleMs={scrambleMs} className={className} />;
}

function Flip({ words, word, className }: { words: readonly string[]; word: string; className?: string }) {
  return (
    <span
      className={cn("inline-grid whitespace-nowrap align-baseline", className)}
      style={{ perspective: "600px" }}
    >
      {/* Invisible copies of every word share the cell, so the slot is always
          as wide as the widest word and the sentence around it never reflows. */}
      {words.map((w) => (
        <span key={w} aria-hidden className="invisible col-start-1 row-start-1">
          {w}
        </span>
      ))}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={word}
          className="col-start-1 row-start-1 inline-block"
          style={{ transformOrigin: "50% 50% -0.45em", backfaceVisibility: "hidden" }}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Glitch({
  words,
  index,
  scrambleMs,
  className,
}: {
  words: readonly string[];
  index: number;
  scrambleMs: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(words[0]);
  const [glitching, setGlitching] = useState(false);
  const isFirst = useRef(true);
  const rafRef = useRef<number | null>(null);

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

"use client";

import Image from "next/image";
import { useState } from "react";

// Try these formats in order; whichever file exists wins.
const EXTS = ["png", "jpg", "jpeg", "webp"] as const;

/**
 * Renders a real app screenshot from /public (in a phone frame) if a file exists
 * at `base` with any common extension (.png/.jpg/.jpeg/.webp), otherwise shows
 * `fallback` (a built mockup) with no broken-image flash. Drop a file at e.g.
 * public/screens/dashboard.jpg and it appears automatically - no code change.
 */
export function AppScreen({
  base,
  alt,
  fallback,
  fallbackClassName,
}: {
  base: string;
  alt: string;
  fallback: React.ReactNode;
  /** Wrapper applied only to the mockup fallback (e.g. its dark panel). The
   *  real screenshot renders bare in the phone frame, with no background. */
  fallbackClassName?: string;
}) {
  const [extIndex, setExtIndex] = useState(0);
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");

  const handleError = () => {
    // Not this format - try the next one; give up (show mockup) once exhausted.
    if (extIndex < EXTS.length - 1) setExtIndex((i) => i + 1);
    else setStatus("fail");
  };

  return (
    <>
      {status !== "ok" && <div className={fallbackClassName}>{fallback}</div>}
      {status !== "fail" && (
        <div
          className={
            status === "ok"
              ? "mx-auto w-full max-w-[232px] overflow-hidden rounded-4xl border border-white/10 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]"
              : "sr-only"
          }
        >
          <Image
            key={EXTS[extIndex]}
            src={`${base}.${EXTS[extIndex]}`}
            alt={alt}
            width={591}
            height={1280}
            unoptimized
            onLoad={() => setStatus("ok")}
            onError={handleError}
            className="block h-auto w-full"
          />
        </div>
      )}
    </>
  );
}

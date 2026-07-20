"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

/**
 * The export bakes one keyframe per frame but omits the `i`/`o` easing and `e`
 * end-value fields lottie-web needs to interpolate. Left as-is, lottie never
 * initialises the layer transforms and hides six of the seven letters, so the
 * wordmark renders blank. Since the values are already baked at 60fps, marking
 * each keyframe as a hold replays exactly what was authored - no interpolation
 * is required, and no easing is stacked on top of the baked easing.
 *
 * Done here rather than in the asset so the source JSON stays untouched.
 */
type Keyframe = { t: number; h?: number };
type Prop = { a?: number; k?: unknown };

function holdKeyframes<T>(data: T): T {
  const layers = (data as { layers?: { ks?: Record<string, Prop> }[] }).layers ?? [];
  for (const layer of layers) {
    for (const prop of Object.values(layer.ks ?? {})) {
      if (prop?.a !== 1 || !Array.isArray(prop.k)) continue;
      for (const kf of prop.k as Keyframe[]) {
        if (kf && typeof kf === "object" && "t" in kf) kf.h = 1;
      }
    }
  }
  return data;
}

/**
 * The animated Klario wordmark (K·L·A·R·I·O dropping into place), played from
 * the After Effects Lottie export at /animations/klario-logo.json.
 *
 * The comp is a full 1920x1080 canvas with the wordmark centred in a narrow
 * band (x 399-1521, y 432-648), so the stage is oversized and cropped: at 171%
 * width the letters span the full container width, and the 1122/300 aspect
 * keeps just the letter band (plus headroom for the drop-in overshoot) visible.
 *
 * Mounts loading immediately so the JSON is ready before `play` flips true.
 */
export function KlarioLogoLottie({
  play = true,
  className = "",
  labelled = false,
}: {
  play?: boolean;
  className?: string;
  labelled?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const playRef = useRef(play);
  playRef.current = play;

  useEffect(() => {
    let disposed = false;
    let anim: AnimationItem | null = null;

    Promise.all([
      import("lottie-web"),
      fetch("/animations/klario-logo.json").then((r) => r.json()),
    ]).then(([{ default: lottie }, data]) => {
      if (disposed || !stageRef.current) return;
      anim = lottie.loadAnimation({
        container: stageRef.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: holdKeyframes(data),
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      animRef.current = anim;
      // If play was requested before the data arrived, start on load.
      anim.addEventListener("DOMLoaded", () => {
        if (playRef.current) anim?.play();
      });
    });

    return () => {
      disposed = true;
      animRef.current = null;
      anim?.destroy();
    };
  }, []);

  useEffect(() => {
    if (play && animRef.current?.isLoaded) animRef.current.play();
  }, [play]);

  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ aspectRatio: "1122 / 300" }}
      {...(labelled
        ? { role: "img", "aria-label": "Klario" }
        : { "aria-hidden": true })}
    >
      <div
        ref={stageRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "171%", aspectRatio: "16 / 9" }}
      />
    </span>
  );
}

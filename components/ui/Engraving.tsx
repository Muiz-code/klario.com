import { cn } from "@/lib/utils";

// Reusable intaglio / banknote-engraving illustrations. Pure SVG line art
// (fine curves only, no dots/beads/halftones), coloured via `currentColor`
// (default gold) so callers control tone and opacity from the outside.

const CX = 500;
const CY = 480;

// Nested currency curves - upward-bulging "ripple" arcs, like the contour
// engraving on a banknote. Open arcs only (no closed circles).
const ARCS = Array.from({ length: 14 }, (_, i) => {
  const r = 60 + i * 34;
  const a0 = (200 * Math.PI) / 180;
  const a1 = (340 * Math.PI) / 180;
  const x0 = (CX + r * Math.cos(a0)).toFixed(1);
  const y0 = (CY + r * Math.sin(a0)).toFixed(1);
  const x1 = (CX + r * Math.cos(a1)).toFixed(1);
  const y1 = (CY + r * Math.sin(a1)).toFixed(1);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
});

// Fine radiating lines that cross the arcs to create an engine-turned weave.
const RAYS = Array.from({ length: 15 }, (_, i) => {
  const a = ((200 + (140 * i) / 14) * Math.PI) / 180;
  const rIn = 46;
  const rOut = 60 + 13 * 34 + 22;
  const x0 = (CX + rIn * Math.cos(a)).toFixed(1);
  const y0 = (CY + rIn * Math.sin(a)).toFixed(1);
  const x1 = (CX + rOut * Math.cos(a)).toFixed(1);
  const y1 = (CY + rOut * Math.sin(a)).toFixed(1);
  return `M ${x0} ${y0} L ${x1} ${y1}`;
});

/** A radiating fan of engraved currency curves. Place low-opacity behind content. */
export function CurrencyFan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 500"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMax slice"
      className={cn("text-gold", className)}
    >
      <g stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.75">
        {ARCS.map((d, i) => (
          <path key={`a${i}`} d={d} />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4">
        {RAYS.map((d, i) => (
          <path key={`r${i}`} d={d} />
        ))}
      </g>
    </svg>
  );
}

// Engine-turned guilloche rosette (the spirograph "flower" on banknotes and
// the brand-guide cover): many fine ellipses, each offset from centre and
// rotated around it, so their overlaps weave the interference pattern.
const ROSETTE_N = 80;
const ROSETTE_ANGLES = Array.from({ length: ROSETTE_N }, (_, i) => ((i * 360) / ROSETTE_N).toFixed(2));

/**
 * A large engine-turned guilloche rosette. Place low-opacity behind content.
 * The pattern rotates slowly around its own centre (paused for reduced-motion);
 * pass `reverse` to spin counter-clockwise so adjacent rosettes differ.
 */
export function GuillocheRosette({
  className,
  reverse = false,
}: {
  className?: string;
  reverse?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
      className={cn("text-gold", className)}
    >
      <g
        className={cn("engrave-rotate", reverse && "engrave-rotate-rev")}
        stroke="currentColor"
        strokeWidth="0.4"
        strokeOpacity="0.75"
      >
        {ROSETTE_ANGLES.map((ang, i) => (
          <ellipse
            key={i}
            cx="250"
            cy="140"
            rx="158"
            ry="64"
            transform={`rotate(${ang} 250 250)`}
          />
        ))}
      </g>
    </svg>
  );
}

/** Certificate-style divider: nested currency curves flanked by hairlines. */
export function CertificateDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center gap-4", className)}>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold/40" />
      <svg
        width="120"
        height="20"
        viewBox="0 0 120 20"
        fill="none"
        className="shrink-0 text-gold"
      >
        <g stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.7">
          <path d="M4 16 Q60 -6 116 16" />
          <path d="M4 16 Q60 2 116 16" />
          <path d="M4 16 Q60 9 116 16" />
        </g>
      </svg>
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold/40" />
    </div>
  );
}

/**
 * KlarioLoader for Next.js / React web. One self-contained file:
 * no CSS file, no fonts to load, no animation library, no "use client".
 *
 *   <KlarioLoader />          small mark loader (k + split coin) for buttons, cards, inline states
 *   <KlarioLoaderScreen />    full-screen loader with the "klario" wordmark only (no k mark)
 *
 * The wordmark is drawn from SVG paths (Bricolage Grotesque ExtraBold, OFL), so it
 * looks identical everywhere without loading a web font.
 */
import React from 'react';

const PALETTES = {
  dark: { ink: '#ECE6D8', coin: '#E6C989', bg: '#0B0B0E' },  // noir screens
  light: { ink: '#4E2C20', coin: '#C19A6B', bg: '#ECE6D8' }, // cream / white screens
} as const;
type Variant = keyof typeof PALETTES;

const WORDMARK_VIEWBOX = '-10 -740 2610 770';
const LETTERS = [
  "M36 0V-700H194V-329Q228 -347 252.5 -370.0Q277 -393 294.0 -419.5Q311 -446 321.5 -473.5Q332 -501 339 -528H525Q514 -488 493.5 -450.5Q473 -413 443.0 -380.5Q413 -348 373.5 -322.0Q334 -296 286 -279V-271Q348 -281 387.5 -273.5Q427 -266 450.0 -245.5Q473 -225 485.5 -194.0Q498 -163 505 -125L528 0H353L342 -88Q338 -120 331.0 -148.0Q324 -176 304.0 -193.5Q284 -211 241 -211H194V0Z", // k,
  "M589.0 0V-700H751.0V0Z", // l,
  "M974.0 14Q934.0 14 898.0 0.0Q862.0 -14 839.0 -45.5Q816.0 -77 816.0 -130Q816.0 -179 835.0 -209.5Q854.0 -240 886.0 -258.5Q918.0 -277 956.0 -286.5Q994.0 -296 1031.0 -303Q1083.0 -313 1109.0 -319.0Q1135.0 -325 1144.5 -333.0Q1154.0 -341 1154.0 -355Q1154.0 -384 1132.5 -399.0Q1111.0 -414 1076.0 -414Q1054.0 -414 1032.0 -406.0Q1010.0 -398 996.0 -377.5Q982.0 -357 983.0 -319L839.0 -329Q837.0 -392 858.0 -433.5Q879.0 -475 915.5 -498.5Q952.0 -522 995.5 -532.0Q1039.0 -542 1082.0 -542Q1161.0 -542 1212.0 -512.5Q1263.0 -483 1287.5 -427.5Q1312.0 -372 1312.0 -293V-199Q1312.0 -166 1312.0 -132.5Q1312.0 -99 1312.0 -66.0Q1312.0 -33 1312.0 0H1172.0Q1172.0 -36 1172.0 -73.0Q1172.0 -110 1172.0 -151H1166.0Q1162.0 -106 1136.5 -68.5Q1111.0 -31 1069.5 -8.5Q1028.0 14 974.0 14ZM1041.0 -104Q1058.0 -104 1077.5 -110.5Q1097.0 -117 1114.5 -132.0Q1132.0 -147 1143.0 -173.5Q1154.0 -200 1154.0 -239V-263L1181.0 -266Q1173.0 -253 1154.5 -245.0Q1136.0 -237 1113.0 -232.5Q1090.0 -228 1066.5 -223.5Q1043.0 -219 1023.0 -211.5Q1003.0 -204 990.5 -191.5Q978.0 -179 978.0 -157Q978.0 -131 996.5 -117.5Q1015.0 -104 1041.0 -104Z", // a,
  "M1390.0 0V-287V-528H1530.0V-318H1538.0Q1544.0 -402 1561.5 -450.5Q1579.0 -499 1605.5 -519.5Q1632.0 -540 1665.0 -540Q1683.0 -540 1702.5 -535.0Q1722.0 -530 1741.0 -519L1733.0 -339Q1711.0 -352 1690.0 -358.5Q1669.0 -365 1650.0 -365Q1618.0 -365 1596.0 -347.0Q1574.0 -329 1562.5 -294.0Q1551.0 -259 1551.0 -209V0Z", // r,
  "M1802.0 0V-528H1964.0V0ZM1882.0 -566Q1836.0 -566 1811.5 -585.5Q1787.0 -605 1787.0 -642Q1787.0 -680 1811.5 -699.5Q1836.0 -719 1882.0 -719Q1929.0 -719 1953.5 -699.0Q1978.0 -679 1978.0 -642Q1978.0 -606 1953.5 -586.0Q1929.0 -566 1882.0 -566Z", // i
];
const O_LEFT = 'M2295.0 -500 A250 250 0 0 0 2295.0 0 Z';
const O_RIGHT = 'M2340.0 -500 A250 250 0 0 1 2340.0 0 Z';

const CSS = `
.klr-root{display:inline-flex;line-height:0}
.klr-stem{animation:klr-stem 450ms cubic-bezier(.34,1.56,.64,1) both}
.klr-leg{stroke-dasharray:76;stroke-dashoffset:76;animation:klr-leg 320ms cubic-bezier(.33,1,.68,1) 260ms forwards}
.klr-cl{animation:klr-cl-in 460ms cubic-bezier(.34,1.56,.64,1) 480ms both,klr-cl-loop 1100ms linear 940ms infinite}
.klr-cr{animation:klr-cr-in 460ms cubic-bezier(.34,1.56,.64,1) 480ms both,klr-cr-loop 1100ms linear 940ms infinite}
.klr-letter{transform-box:fill-box;transform-origin:50% 100%;animation:klr-press 380ms cubic-bezier(.34,1.56,.64,1) both}
.klr-ol{animation:klr-ol-in 460ms cubic-bezier(.34,1.56,.64,1) 595ms both,klr-ol-loop 1100ms linear 1055ms infinite}
.klr-or{animation:klr-or-in 460ms cubic-bezier(.34,1.56,.64,1) 595ms both,klr-or-loop 1100ms linear 1055ms infinite}
.klr-screen{position:fixed;inset:0;display:grid;place-items:center;z-index:50}
@keyframes klr-stem{from{transform:translateY(-90px)}to{transform:translateY(0)}}
@keyframes klr-leg{to{stroke-dashoffset:0}}
@keyframes klr-cl-in{from{transform:translateX(-28px);opacity:0}40%{opacity:1}to{transform:translateX(0);opacity:1}}
@keyframes klr-cr-in{from{transform:translateX(28px);opacity:0}40%{opacity:1}to{transform:translateX(0);opacity:1}}
@keyframes klr-cl-loop{0%,23.6%{transform:translateX(0);animation-timing-function:cubic-bezier(.65,0,.35,1)}58.2%{transform:translateX(-14px);animation-timing-function:cubic-bezier(.33,1,.68,1)}85.5%{transform:translateX(1.5px);animation-timing-function:ease-out}100%{transform:translateX(0)}}
@keyframes klr-cr-loop{0%,23.6%{transform:translateX(0);animation-timing-function:cubic-bezier(.65,0,.35,1)}58.2%{transform:translateX(14px);animation-timing-function:cubic-bezier(.33,1,.68,1)}85.5%{transform:translateX(-1.5px);animation-timing-function:ease-out}100%{transform:translateX(0)}}
@keyframes klr-press{from{transform:translateY(-60px) scale(1.12);opacity:0}35%{opacity:1}to{transform:translateY(0) scale(1);opacity:1}}
@keyframes klr-ol-in{from{transform:translateX(-80px);opacity:0}40%{opacity:1}to{transform:translateX(0);opacity:1}}
@keyframes klr-or-in{from{transform:translateX(80px);opacity:0}40%{opacity:1}to{transform:translateX(0);opacity:1}}
@keyframes klr-ol-loop{0%,23.6%{transform:translateX(0);animation-timing-function:cubic-bezier(.65,0,.35,1)}58.2%{transform:translateX(-40px);animation-timing-function:cubic-bezier(.33,1,.68,1)}85.5%{transform:translateX(4px);animation-timing-function:ease-out}100%{transform:translateX(0)}}
@keyframes klr-or-loop{0%,23.6%{transform:translateX(0);animation-timing-function:cubic-bezier(.65,0,.35,1)}58.2%{transform:translateX(40px);animation-timing-function:cubic-bezier(.33,1,.68,1)}85.5%{transform:translateX(-4px);animation-timing-function:ease-out}100%{transform:translateX(0)}}
@media (prefers-reduced-motion:reduce){
  .klr-stem,.klr-leg,.klr-cl,.klr-cr,.klr-letter,.klr-ol,.klr-or{animation:none;stroke-dashoffset:0;transform:none;opacity:1}
  .klr-root{animation:klr-breathe 1.8s ease-in-out infinite}
}
@keyframes klr-breathe{0%,100%{opacity:1}50%{opacity:.55}}
`;

function Styles() {
  return <style>{CSS}</style>;
}

export type KlarioLoaderProps = {
  size?: number;
  variant?: Variant;
  /** Read out by screen readers. */
  label?: string;
  className?: string;
};

/** Small mark loader: k + split coin. */
export function KlarioLoader({ size = 64, variant = 'dark', label = 'Loading', className }: KlarioLoaderProps) {
  const { ink, coin } = PALETTES[variant];
  return (
    <span role="status" aria-label={label} className={['klr-root', className].filter(Boolean).join(' ')}>
      <Styles />
      <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <rect className="klr-stem" x="36" y="18" width="42" height="164" rx="21" fill={ink} />
        <path className="klr-leg" d="M90 122 L150 168" stroke={ink} strokeWidth="42" strokeLinecap="round" fill="none" />
        <path className="klr-cl" d="M133,30 A34,34 0 0,0 133,98 Z" fill={coin} />
        <path className="klr-cr" d="M139,30 A34,34 0 0,1 139,98 Z" fill={coin} />
      </svg>
    </span>
  );
}

/** The "klario" wordmark loader on its own: letters press in, then the split O keeps opening and closing. */
export function KlarioWordmarkLoader({
  width = 220,
  variant = 'dark',
  label = 'Loading',
}: { width?: number; variant?: Variant; label?: string }) {
  const { ink, coin } = PALETTES[variant];
  return (
    <span role="status" aria-label={label} className="klr-root">
      <Styles />
      <svg width={width} viewBox={WORDMARK_VIEWBOX} aria-hidden="true" focusable="false" style={{ overflow: 'visible' }}>
        {LETTERS.map((d, i) => (
          <path key={i} className="klr-letter" d={d} fill={ink} style={{ animationDelay: `${i * 95}ms` }} />
        ))}
        <path className="klr-ol" d={O_LEFT} fill={coin} />
        <path className="klr-or" d={O_RIGHT} fill={coin} />
      </svg>
    </span>
  );
}

/** Full-screen loader (wordmark only, no k mark). Use in app/loading.tsx or for blocking loads. */
export function KlarioLoaderScreen({ variant = 'dark', width = 220 }: { variant?: Variant; width?: number }) {
  return (
    <div className="klr-screen" style={{ background: PALETTES[variant].bg }}>
      <KlarioWordmarkLoader width={width} variant={variant} />
    </div>
  );
}

export default KlarioLoaderScreen;

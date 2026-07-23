// Engraved marks for the Anchor Club: the split-circle sub-mark and the
// engine-turned guilloché rosette (the same clean rosette as
// public/klario-rosette.svg — 80 rotated ellipses, not a noisy hypotrochoid).
// All math is deterministic (no Math.random / Date) so it renders identically
// on the server and client. The member card is built as a self-contained SVG
// string so the same markup can be rasterised to PNG.

const f2 = (n: number) => n.toFixed(2);

// ── The split-circle sub-mark: concentric rings gapped by a vertical channel ──
const SUBMARK_C = 100;
const SUBMARK_CHANNEL = 7.6;
const SUBMARK_RINGS = [69, 50, 33];

function submarkArcs(): string[] {
  const ds: string[] = [];
  for (const r of SUBMARK_RINGS) {
    const phi = Math.asin(Math.min(1, SUBMARK_CHANNEL / r));
    const dx = r * Math.cos(phi);
    const dy = r * Math.sin(phi);
    ds.push(
      `M ${f2(SUBMARK_C + dx)} ${f2(SUBMARK_C - dy)} A ${r} ${r} 0 0 1 ${f2(SUBMARK_C + dx)} ${f2(SUBMARK_C + dy)}`
    );
    ds.push(
      `M ${f2(SUBMARK_C - dx)} ${f2(SUBMARK_C + dy)} A ${r} ${r} 0 0 1 ${f2(SUBMARK_C - dx)} ${f2(SUBMARK_C - dy)}`
    );
  }
  return ds;
}

export function SubMark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {submarkArcs().map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ── The engine-turned rosette: 80 ellipses rotated in 4.5° steps around the
// centre of a 0..500 box. Matches public/klario-rosette.svg. ──
export const ROSETTE_BOX = 500;

export function rosetteEllipses(stroke: string, strokeWidth: number): string {
  let e = "";
  for (let a = 0; a < 360; a += 4.5) {
    e += `<ellipse cx="250" cy="140" rx="158" ry="64" transform="rotate(${a.toFixed(2)} 250 250)"/>`;
  }
  return `<g fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="0.75" stroke-linecap="round">${e}</g>`;
}

// Background texture: a single rosette bleeding off the top-right corner.
export function PageTexture() {
  return (
    <div id="anchor-texture" aria-hidden="true">
      <svg
        className="anchor-rosette"
        viewBox="0 0 500 500"
        fill="none"
        dangerouslySetInnerHTML={{
          __html: rosetteEllipses("currentColor", 0.4),
        }}
      />
    </div>
  );
}

const escapeXml = (s: string) =>
  (s || "").replace(/[&<>"]/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : "&quot;"
  );

// Right-aligned card values shouldn't run into their label; cap length.
const cap = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;

// ── The member card, as a self-contained SVG string. `forExport` strips the
// animation classes and the specular sweep so it rasterises to a clean PNG. ──
export function cardSVGMarkup({
  name,
  area,
  institution,
  level,
  cardNo,
  markHref,
  forExport = false,
}: {
  name: string;
  area: string;
  institution: string;
  level: string;
  cardNo: string;
  /** The Klario sub-logo as a data URI, embedded so it survives PNG export. */
  markHref?: string;
  forExport?: boolean;
}): string {
  const W = 1040;
  const H = 640;
  const displayName = cap((name || "").trim() || "Anchor Member", 20);
  const displayArea = (area || "").trim() || "Anchor";

  // Corner sub-mark: the real Klario sub-logo if we have it as a data URI,
  // otherwise the vector split-circle as a fallback.
  let mark = "";
  if (markHref) {
    mark = `<image href="${markHref}" x="0" y="0" width="200" height="200" preserveAspectRatio="xMidYMid meet"/>`;
  } else {
    for (const r of SUBMARK_RINGS) {
      const phi = Math.asin(SUBMARK_CHANNEL / r);
      const dx = r * Math.cos(phi);
      const dy = r * Math.sin(phi);
      mark +=
        `<path d="M ${f2(SUBMARK_C + dx)} ${f2(SUBMARK_C - dy)} A ${r} ${r} 0 0 1 ${f2(SUBMARK_C + dx)} ${f2(SUBMARK_C + dy)}" fill="none" stroke="#ECE6D8" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M ${f2(SUBMARK_C - dx)} ${f2(SUBMARK_C + dy)} A ${r} ${r} 0 0 1 ${f2(SUBMARK_C - dx)} ${f2(SUBMARK_C - dy)}" fill="none" stroke="#ECE6D8" stroke-width="7" stroke-linecap="round"/>`;
    }
  }
  const cls = (c: string) => (forExport ? "" : `class="${c}"`);

  // A data row: hairline divider, mono label left, mono value right.
  const row = (y: number, label: string, value: string, delay: string) => `
      <line ${cls(`anchor-asm ${delay}`)} x1="56" y1="${y}" x2="${W - 56}" y2="${y}" stroke="#C19A6B" stroke-opacity="0.22" stroke-width="1"/>
      <text ${cls(`anchor-asm ${delay}`)} x="56" y="${y + 38}" fill="#ECE6D8" opacity="0.5" font-family="'JetBrains Mono', monospace" font-size="15" letter-spacing="2">${escapeXml(label)}</text>
      <text ${cls(`anchor-asm ${delay}`)} x="${W - 56}" y="${y + 38}" text-anchor="end" fill="#ECE6D8" opacity="0.82" font-family="'JetBrains Mono', monospace" font-size="17" letter-spacing="1">${escapeXml(value)}</text>`;

  // Rosette bleeding off the right edge, behind the text. Uses a nested <svg>
  // so it sits in its own 0..500 coordinate space.
  const rosetteSize = 660;
  const rosetteX = W - 470;
  const rosetteY = (H - rosetteSize) / 2;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope, sans-serif">
    <defs>
      <clipPath id="anchorCardClip"><rect x="0" y="0" width="${W}" height="${H}" rx="24"/></clipPath>
      <linearGradient id="anchorSpecGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="0.14"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#anchorCardClip)">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#0B0B0E"/>
      <rect x="0" y="0" width="${W}" height="${H}" fill="#131019" opacity="0.55"/>
      <g ${cls("anchor-asm anchor-d2")} opacity="0.55">
        <svg x="${rosetteX}" y="${rosetteY}" width="${rosetteSize}" height="${rosetteSize}" viewBox="0 0 500 500" overflow="visible">${rosetteEllipses("#C19A6B", 0.5)}</svg>
      </g>
      <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="19" fill="none" stroke="#C19A6B" stroke-opacity="0.4" stroke-width="1.4"/>
      <g transform="translate(52, 56) scale(0.26)"><g ${cls("anchor-asm anchor-d1")}>${mark}</g></g>
      <text ${cls("anchor-asm anchor-d1")} x="122" y="90" fill="#C19A6B" font-family="'JetBrains Mono', monospace" font-size="15" letter-spacing="4">ANCHOR CLUB · FOUNDING COHORT</text>
      <text ${cls("anchor-asm anchor-d2")} x="56" y="272" fill="#ECE6D8" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="66" letter-spacing="-2">${escapeXml(displayName)}</text>
      <text ${cls("anchor-asm anchor-d3")} x="58" y="322" fill="#E6C989" font-family="Manrope, sans-serif" font-weight="600" font-size="24">${escapeXml(displayArea)}</text>
      ${row(400, "INSTITUTION", cap((institution || "").trim() || "—", 26), "anchor-d3")}
      ${row(480, "LEVEL", cap((level || "").trim() || "—", 26), "anchor-d4")}
      ${row(560, "REFERENCE", cardNo, "anchor-d5")}
      ${forExport ? "" : `<rect id="anchorSpec" x="-${W}" y="0" width="${W}" height="${H}" fill="url(#anchorSpecGrad)"/>`}
    </g>
  </svg>`;
}

// A stable founding-cohort card number derived from the reference code, so the
// same applicant always sees the same number (no Math.random at render).
export function memberNumberFromRef(ref: string | null): string {
  const seed = ref || "KAC";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const n = 1 + (h % 240);
  return "No. " + String(n).padStart(4, "0");
}

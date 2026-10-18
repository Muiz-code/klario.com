// Generates public/hero/illustration.svg: the engraved scene on the landing
// bento's product tile. Banknote intaglio style in the brand palette, with
// one motif per pillar: budget (ledger), business (shopfront), debt (a card
// cut in two, stamped PAID) and savings (piggy bank, coins).
//
// The tile is a wedge whose top-left corner is cut away and whose
// bottom-right carries text, so the motifs keep to the top band and the
// lower-left. Run: node scripts/hero-illustration.mjs

import { writeFileSync } from "node:fs";

const W = 800;
const H = 380;
const INK = "#4e2c20";
const PAPER = "#f4e4c5";
const PAPER_HI = "#fbf1dc";
const PAPER_LO = "#ead6b0";
const GOLD = "#c19a6b";
const GOLD_HI = "#e8d5ad";
const BLUE = "#7f9bb0";
const SERIF = "Georgia, 'Times New Roman', serif";

const f = (n) => +n.toFixed(1);

// Faint blue underprint: stacked sine waves, as on a note's background.
function underprint() {
  let out = "";
  for (let j = 0; j < 15; j++) {
    const y0 = 14 + j * 26;
    let d = "";
    for (let x = -10; x <= W + 10; x += 4) {
      const y = y0 + 4.5 * Math.sin((x + j * 9) / 9.5);
      d += `${d ? "L" : "M"}${f(x)} ${f(y)}`;
    }
    out += `<path d="${d}"/>`;
  }
  return `<g fill="none" stroke="${BLUE}" stroke-width="0.6" opacity="0.32">${out}</g>`;
}

// Guilloche rosette: overlapping phase-shifted lobed circles.
function rosette(cx, cy, R, amp, lobes, count, opacity) {
  let out = "";
  for (let k = 0; k < count; k++) {
    const phase = (k / count) * ((2 * Math.PI) / lobes);
    let d = "";
    for (let i = 0; i <= 360; i++) {
      const t = (i / 360) * 2 * Math.PI;
      const r = R + amp * Math.sin(lobes * t + phase * lobes);
      d += `${i ? "L" : "M"}${f(cx + r * Math.cos(t))} ${f(cy + r * Math.sin(t))}`;
    }
    out += `<path d="${d}Z"/>`;
  }
  return `<g fill="none" stroke="${GOLD}" stroke-width="0.55" opacity="${opacity}">${out}</g>`;
}

const defs = `
<defs>
  <pattern id="h45" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width="1"/>
  </pattern>
  <pattern id="h45d" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="3" stroke="${INK}" stroke-width="0.9"/>
  </pattern>
  <pattern id="h-35" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
    <line x1="0" y1="0" x2="0" y2="4" stroke="${INK}" stroke-width="0.7"/>
  </pattern>
  <pattern id="hz" width="8" height="3.4" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0.5" x2="8" y2="0.5" stroke="${INK}" stroke-width="0.6"/>
  </pattern>
  <pattern id="vz" width="3" height="8" patternUnits="userSpaceOnUse">
    <line x1="0.5" y1="0" x2="0.5" y2="8" stroke="${INK}" stroke-width="0.7"/>
  </pattern>
  <mask id="pigShade">
    <ellipse cx="210" cy="285" rx="105" ry="70" fill="#fff"/>
    <ellipse cx="192" cy="266" rx="100" ry="62" fill="#000"/>
  </mask>
</defs>`;

// ── Budget: a ruled ledger sheet with a rising bar chart ──────────────────
function ledger() {
  const bars = [24, 40, 32, 56, 74];
  const base = 158;
  let barsSvg = "";
  const tops = [];
  bars.forEach((h, i) => {
    const x = 192 + i * 24;
    barsSvg += `<rect x="${x}" y="${base - h}" width="14" height="${h}" fill="url(#h45d)" stroke="${INK}" stroke-width="1.2"/>`;
    tops.push([x + 7, base - h - 9]);
  });
  let rules = "";
  for (let y = 70; y <= 158; y += 12) {
    rules += `<line x1="186" y1="${y}" x2="314" y2="${y}"/>`;
  }
  const trend = tops.map(([x, y]) => `${x},${y}`).join(" ");
  const [ex, ey] = tops[tops.length - 1];
  return `
  <g transform="rotate(-4 250 100)">
    <rect x="178" y="32" width="150" height="140" fill="#000" opacity="0.12" transform="translate(5 5)"/>
    <rect x="175" y="28" width="150" height="140" fill="${PAPER_HI}" stroke="${INK}" stroke-width="2"/>
    <rect x="175" y="28" width="150" height="16" fill="url(#h45)" stroke="${INK}" stroke-width="2"/>
    <text x="186" y="60" font-family="${SERIF}" font-size="11" font-weight="700" letter-spacing="2.5" fill="${INK}">BUDGET</text>
    <g stroke="${INK}" stroke-width="0.5" opacity="0.45">${rules}</g>
    ${barsSvg}
    <polyline points="${trend}" fill="none" stroke="${INK}" stroke-width="1.6"/>
    ${tops.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${PAPER_HI}" stroke="${INK}" stroke-width="1.3"/>`).join("")}
    <path d="M${ex - 8} ${ey - 3} L${ex + 4} ${ey - 9} L${ex - 1} ${ey + 4}" fill="none" stroke="${INK}" stroke-width="1.6"/>
  </g>`;
}

// ── Business: a small shopfront with a striped, scalloped awning ─────────
function shop() {
  const x0 = 352;
  const w = 166 / 6;
  let awning = "";
  for (let i = 0; i < 6; i++) {
    const x = x0 + i * w;
    awning += `<path d="M${f(x)} 86 H${f(x + w)} V106 A${f(w / 2)} 7 0 0 1 ${f(x)} 106 Z" fill="${i % 2 ? PAPER_HI : GOLD}" stroke="${INK}" stroke-width="1.4"/>`;
    if (i % 2 === 0) {
      awning += `<path d="M${f(x)} 86 H${f(x + w)} V106 A${f(w / 2)} 7 0 0 1 ${f(x)} 106 Z" fill="url(#vz)" opacity="0.5"/>`;
    }
  }
  return `
  <g>
    <rect x="360" y="98" width="150" height="104" fill="${PAPER_LO}" stroke="${INK}" stroke-width="2"/>
    <rect x="360" y="98" width="150" height="104" fill="url(#hz)" opacity="0.35"/>
    <rect x="352" y="58" width="166" height="28" fill="${PAPER_HI}" stroke="${INK}" stroke-width="2"/>
    <text x="435" y="77" text-anchor="middle" font-family="${SERIF}" font-size="13" font-weight="700" letter-spacing="2" fill="${INK}">TRADERS &amp; CO.</text>
    ${awning}
    <rect x="378" y="126" width="54" height="44" fill="${PAPER_HI}" stroke="${INK}" stroke-width="1.8"/>
    <path d="M378 126 L432 126 L432 140 L392 170 L378 170 Z" fill="url(#h-35)" opacity="0.45"/>
    <line x1="405" y1="126" x2="405" y2="170" stroke="${INK}" stroke-width="1.4"/>
    <line x1="378" y1="148" x2="432" y2="148" stroke="${INK}" stroke-width="1.4"/>
    <rect x="448" y="128" width="40" height="74" fill="url(#h45d)" stroke="${INK}" stroke-width="1.8"/>
    <rect x="454" y="136" width="28" height="22" fill="${PAPER_HI}" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="481" cy="170" r="2.6" fill="${GOLD_HI}" stroke="${INK}" stroke-width="1.1"/>
    <line x1="340" y1="202" x2="530" y2="202" stroke="${INK}" stroke-width="2"/>
    <line x1="350" y1="207" x2="520" y2="207" stroke="${INK}" stroke-width="0.8" opacity="0.6"/>
  </g>`;
}

// ── Debt: a card cut in two along a zigzag, stamped PAID ─────────────────
function card() {
  const cut = "L88 20 L100 38 L86 58 L98 78 L84 98 L92 115";
  const cutRev = "L84 98 L98 78 L86 58 L100 38 L88 20";
  const left = `M12 0 H95 ${cut} H12 Q0 115 0 103 V12 Q0 0 12 0 Z`;
  const right = `M95 0 H178 Q190 0 190 12 V103 Q190 115 178 115 H92 ${cutRev} Z`;
  const face = (d) => `
      <path d="${d}" fill="${PAPER_LO}" stroke="${INK}" stroke-width="2"/>
      <path d="${d}" fill="url(#h-35)" opacity="0.18"/>`;
  return `
  <g transform="translate(560 48) rotate(-9)">
    ${face(left)}
    <rect x="18" y="38" width="28" height="21" rx="3" fill="${GOLD_HI}" stroke="${INK}" stroke-width="1.3"/>
    <path d="M18 48 H46 M27 38 V59 M37 38 V59" stroke="${INK}" stroke-width="0.8"/>
    <text x="18" y="88" font-family="${SERIF}" font-size="12" letter-spacing="2" fill="${INK}">•••• ••</text>
  </g>
  <g transform="translate(582 58) rotate(7)">
    ${face(right)}
    <text x="112" y="88" font-family="${SERIF}" font-size="12" letter-spacing="2" fill="${INK}">•• 4021</text>
    <g transform="rotate(-14 150 42)">
      <circle cx="150" cy="42" r="25" fill="none" stroke="${INK}" stroke-width="2"/>
      <circle cx="150" cy="42" r="20" fill="none" stroke="${INK}" stroke-width="0.8" stroke-dasharray="2 2"/>
      <text x="150" y="47" text-anchor="middle" font-family="${SERIF}" font-size="14" font-weight="700" letter-spacing="1.5" fill="${INK}">PAID</text>
    </g>
  </g>
  <path d="M676 34 l6 -10 M688 40 l10 -6 M684 28 l2 -12" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`;
}

// ── Savings: piggy bank, a ₦ coin dropping in, and coin stacks ───────────
function pig() {
  const leg = (x, back) =>
    `<rect x="${x}" y="330" width="26" height="40" rx="6" fill="${back ? "url(#h45d)" : PAPER_LO}" stroke="${INK}" stroke-width="2"/>`;
  return `
  <ellipse cx="215" cy="372" rx="112" ry="8" fill="url(#h45d)" opacity="0.55"/>
  ${leg(150, true)}${leg(250, true)}
  <path d="M108 276 c-20 -4 -28 -24 -14 -31 c13 -6 18 11 6 14" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
  <ellipse cx="210" cy="285" rx="105" ry="70" fill="${PAPER_LO}" stroke="${INK}" stroke-width="2.4"/>
  <rect x="100" y="210" width="220" height="150" fill="url(#h45)" mask="url(#pigShade)"/>
  <path d="M150 238 q20 -16 46 -18 M142 252 q14 -12 30 -16" fill="none" stroke="${INK}" stroke-width="0.9" opacity="0.5"/>
  <path d="M266 232 L284 194 L302 240 Z" fill="${PAPER_LO}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M274 230 L284 208 L294 234 Z" fill="url(#h45d)"/>
  <ellipse cx="312" cy="290" rx="17" ry="24" fill="${PAPER_HI}" stroke="${INK}" stroke-width="2.2"/>
  <ellipse cx="315" cy="282" rx="3" ry="4.5" fill="${INK}"/>
  <ellipse cx="315" cy="298" rx="3" ry="4.5" fill="${INK}"/>
  <circle cx="286" cy="262" r="4.5" fill="${INK}"/>
  <circle cx="287.5" cy="260.5" r="1.3" fill="${PAPER_HI}"/>
  ${leg(176, false)}${leg(268, false)}
  <rect x="186" y="216" width="48" height="7" rx="3.5" fill="${INK}" transform="rotate(-3 210 219)"/>
  <circle cx="211" cy="176" r="23" fill="${GOLD_HI}" stroke="${INK}" stroke-width="2.2"/>
  <circle cx="211" cy="176" r="17" fill="none" stroke="${INK}" stroke-width="0.9"/>
  <text x="211" y="183" text-anchor="middle" font-family="${SERIF}" font-size="20" font-weight="700" fill="${INK}">₦</text>`;
}

function coinStack(cx, base, n) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const y = base - i * 9;
    out += `<path d="M${cx - 26} ${y - 9} V${y} A26 7 0 0 0 ${cx + 26} ${y} V${y - 9}" fill="${GOLD}" stroke="${INK}" stroke-width="1.3"/>`;
    out += `<path d="M${cx - 26} ${y - 9} V${y} A26 7 0 0 0 ${cx + 26} ${y} V${y - 9}" fill="url(#vz)" opacity="0.55"/>`;
    out += `<ellipse cx="${cx}" cy="${y - 9}" rx="26" ry="7" fill="${GOLD_HI}" stroke="${INK}" stroke-width="1.3"/>`;
  }
  const top = base - (n - 1) * 9 - 9;
  out += `<text x="${cx}" y="${top + 4}" text-anchor="middle" font-family="${SERIF}" font-size="10" font-weight="700" fill="${INK}" transform="scale(1 0.6)" transform-origin="${cx} ${top}">₦</text>`;
  return out;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">
${defs}
<rect width="${W}" height="${H}" fill="${PAPER}"/>
${underprint()}
${rosette(600, 300, 150, 16, 12, 22, 0.42)}
${rosette(600, 300, 96, 10, 9, 16, 0.32)}
${ledger()}
${shop()}
${card()}
${pig()}
<ellipse cx="380" cy="356" rx="70" ry="7" fill="url(#h45d)" opacity="0.5"/>
${coinStack(352, 352, 6)}
${coinStack(406, 356, 4)}
</svg>
`;

writeFileSync(new URL("../public/hero/illustration.svg", import.meta.url), svg);
console.log("wrote public/hero/illustration.svg", svg.length, "bytes");

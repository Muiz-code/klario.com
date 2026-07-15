import { INVESTORS } from "@/lib/investors";

// Branded PowerPoint export of the investor brief. Runs entirely in the
// browser (pptxgenjs is loaded on demand) and is driven by the SAME INVESTORS
// data the /investors page renders, so the deck never drifts from the page.

// Brand palette (hex without leading #, as pptxgenjs expects).
const NOIR = "0B0B0E";
const PANEL = "17171C";
const PANEL_HL = "241F16"; // gold-tinted panel for the Klario row / highlights
const GOLD = "C19A6B";
const GOLD_HI = "E6C989";
const CREAM = "ECE6D8";
const BODY = "C9C9CF";
const DIM = "8A8A93";
const LINE = "2A2A32";
const FF = "Arial";

const W = 13.333; // LAYOUT_WIDE
const H = 7.5;
const M = 0.6; // side margin

type Tile = { value: string; label: string };
type Card = { kicker?: string; title: string; body: string };

function today() {
  const d = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Evenly spaced column x/width across the usable slide width.
function slots(n: number, gap: number) {
  const w = (W - 2 * M - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: M + i * (w + gap), w }));
}

/**
 * Build and download a branded investor deck (.pptx) from the investor page
 * content. Returns once the browser download has been triggered.
 */
export async function exportInvestorDeck() {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Klario";
  pptx.company = "Raavon Limited";
  pptx.title = "Klario Investor Brief";

  type Slide = ReturnType<typeof pptx.addSlide>;
  const I = INVESTORS;
  const bg = { color: NOIR };

  // --- primitives (default the brand font on every text box) ---
  const txt = (
    s: Slide,
    text: string | { text: string; options?: Record<string, unknown> }[],
    opts: Record<string, unknown>,
  ) => s.addText(text as never, { fontFace: FF, ...opts });

  const panel = (s: Slide, o: Record<string, unknown>) =>
    s.addShape(pptx.ShapeType.roundRect, { rectRadius: 0.08, ...o });

  const newSlide = () => {
    const s = pptx.addSlide();
    s.background = bg;
    return s;
  };

  const header = (s: Slide, eyebrow: string, title: string, emphasis?: string) => {
    txt(s, eyebrow.toUpperCase(), {
      x: M, y: 0.45, w: W - 2 * M, h: 0.3,
      fontSize: 11, color: GOLD, bold: true, charSpacing: 2,
    });
    txt(
      s,
      [
        { text: emphasis ? `${title} ` : title, options: { color: CREAM } },
        ...(emphasis ? [{ text: emphasis, options: { color: GOLD } }] : []),
      ],
      { x: M, y: 0.76, w: W - 2 * M, h: 0.8, fontSize: 26, bold: true },
    );
  };

  const footer = (s: Slide) =>
    txt(s, "Klario · Raavon Limited · klario.finance", {
      x: M, y: H - 0.45, w: W - 2 * M, h: 0.3, fontSize: 9, color: DIM,
    });

  // Row of value/label stat tiles.
  const tiles = (s: Slide, items: readonly Tile[], y: number, h: number, valueSize = 30) => {
    const cols = slots(items.length, 0.3);
    items.forEach((it, i) => {
      const { x, w } = cols[i];
      panel(s, { x, y, w, h, fill: { color: PANEL }, line: { color: LINE, width: 1 } });
      txt(s, it.value, {
        x, y: y + 0.22, w, h: h * 0.48, fontSize: valueSize, color: GOLD, bold: true, align: "center",
      });
      txt(s, it.label, {
        x: x + 0.12, y: y + h * 0.5, w: w - 0.24, h: h * 0.46,
        fontSize: 10.5, color: CREAM, align: "center", valign: "top",
      });
    });
  };

  // Row of title/body cards.
  const cards = (
    s: Slide,
    items: readonly Card[],
    y: number,
    h: number,
    { titleSize = 15, bodySize = 11 } = {},
  ) => {
    const cols = slots(items.length, 0.3);
    items.forEach((it, i) => {
      const { x, w } = cols[i];
      panel(s, { x, y, w, h, fill: { color: PANEL }, line: { color: LINE, width: 1 } });
      let ty = y + 0.28;
      if (it.kicker) {
        txt(s, it.kicker.toUpperCase(), {
          x: x + 0.25, y: ty, w: w - 0.5, h: 0.28, fontSize: 9, color: GOLD, bold: true, charSpacing: 1.5,
        });
        ty += 0.34;
      }
      txt(s, it.title, {
        x: x + 0.25, y: ty, w: w - 0.5, h: 0.5, fontSize: titleSize, color: CREAM, bold: true,
      });
      txt(s, it.body, {
        x: x + 0.25, y: ty + 0.5, w: w - 0.5, h: h - (ty + 0.5 - y) - 0.2,
        fontSize: bodySize, color: BODY, valign: "top", lineSpacingMultiple: 1.05,
      });
    });
  };

  // ---- Slide 1: Title ----
  const s1 = newSlide();
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 3.55, w: 2.4, h: 0.06, fill: { color: GOLD } });
  txt(s1, I.hero.eyebrow.toUpperCase(), {
    x: M, y: 1.55, w: W - 2 * M, h: 0.3, fontSize: 12, color: GOLD, bold: true, charSpacing: 2,
  });
  txt(
    s1,
    [
      { text: `${I.hero.heading} `, options: { color: CREAM } },
      { text: I.hero.emphasis, options: { color: GOLD } },
    ],
    { x: M, y: 1.95, w: W - 2 * M, h: 1.4, fontSize: 40, bold: true },
  );
  txt(s1, I.hero.sub, {
    x: M, y: 3.8, w: 9.8, h: 1.6, fontSize: 14, color: BODY, valign: "top", lineSpacingMultiple: 1.1,
  });
  txt(s1, `Investor brief · ${today()}`, { x: M, y: H - 0.7, w: 6, h: 0.3, fontSize: 11, color: GOLD });
  txt(s1, "Raavon Limited · klario.finance", {
    x: W - M - 4, y: H - 0.7, w: 4, h: 0.3, fontSize: 11, color: DIM, align: "right",
  });

  // ---- Slide 2: Headline metrics ----
  const s2 = newSlide();
  header(s2, "The signal", "Nigerians are financially active,", "but blind.");
  tiles(s2, I.metrics, 2.6, 2.6, 26);
  footer(s2);

  // ---- Slide 3: Beta research signals ----
  const s3 = newSlide();
  header(s3, I.research.label, I.research.heading, I.research.emphasis);
  const sig = I.research.signals;
  tiles(s3, sig.slice(0, 3), 1.8, 2.0);
  tiles(s3, sig.slice(3, 6), 4.0, 2.0);
  txt(s3, I.research.source, { x: M, y: H - 0.5, w: W - 2 * M, h: 0.3, fontSize: 9, color: DIM, italic: true });

  // ---- Slide 4: Opportunity ----
  const s4 = newSlide();
  header(s4, I.opportunity.label, I.opportunity.heading, I.opportunity.emphasis);
  cards(s4, I.opportunity.points.map((p) => ({ title: p.title, body: p.body })), 2.0, 4.4);
  footer(s4);

  // ---- Slide 5: Product ----
  const s5 = newSlide();
  header(s5, I.product.label, I.product.heading, I.product.emphasis);
  cards(
    s5,
    I.product.pillars.map((p) => ({ title: p.title, body: p.body })),
    2.0, 4.4,
    { titleSize: 12, bodySize: 9 },
  );
  footer(s5);

  // ---- Slide 6: Business model ----
  const s6 = newSlide();
  header(s6, I.model.label, I.model.heading, I.model.emphasis);
  cards(s6, I.model.streams.map((st) => ({ title: st.title, body: st.body })), 1.9, 3.6);
  txt(s6, I.model.note, {
    x: M, y: 5.7, w: W - 2 * M, h: 1.1, fontSize: 11, color: BODY, valign: "top", lineSpacingMultiple: 1.05,
  });

  // ---- Slide 7: Capability tiers (table) ----
  const s7 = newSlide();
  header(s7, I.tiers.label, I.tiers.heading, I.tiers.emphasis);
  const tierHead = I.tiers.columns.map((c) => ({
    text: c,
    options: { bold: true, color: NOIR, fill: { color: GOLD }, fontSize: 12 },
  }));
  const tierBody = I.tiers.rows.map((row) =>
    row.map((cell, ci) => ({
      text: String(cell),
      options: { color: ci === 0 ? CREAM : GOLD_HI, bold: ci === 0, fontSize: 12, fill: { color: PANEL } },
    })),
  );
  s7.addTable([tierHead, ...tierBody], {
    x: M, y: 2.1, w: W - 2 * M, colW: [3.7, 2.81, 2.81, 2.81],
    rowH: 0.55, valign: "middle", align: "left", fontFace: FF,
    border: { type: "solid", color: LINE, pt: 1 },
  });
  txt(s7, I.tiers.note, { x: M, y: 6.4, w: W - 2 * M, h: 0.6, fontSize: 10, color: DIM, valign: "top" });

  // ---- Slide 8: Competitive landscape (table) ----
  const s8 = newSlide();
  header(s8, I.competitors.label, I.competitors.heading, I.competitors.emphasis);
  txt(s8, I.competitors.intro, {
    x: M, y: 1.65, w: W - 2 * M, h: 0.7, fontSize: 11, color: BODY, valign: "top", lineSpacingMultiple: 1.03,
  });
  const compHead = I.competitors.columns.map((c) => ({
    text: c || "Product",
    options: { bold: true, color: NOIR, fill: { color: GOLD }, fontSize: 10 },
  }));
  const compBody = I.competitors.rows.map((row) =>
    [row.name, row.cat, ...row.cells].map((cell, ci) => ({
      text: String(cell),
      options: {
        color: row.klario ? GOLD_HI : CREAM,
        bold: ci === 0,
        fontSize: 10,
        fill: { color: row.klario ? PANEL_HL : PANEL },
      },
    })),
  );
  s8.addTable([compHead, ...compBody], {
    x: M, y: 2.55, w: W - 2 * M, colW: [2.2, 2.0, 2.53, 1.8, 1.9, 1.7],
    rowH: 0.5, valign: "middle", align: "left", fontFace: FF,
    border: { type: "solid", color: LINE, pt: 1 },
  });
  footer(s8);

  // ---- Slide 9: How we run (cost structure) ----
  const s9 = newSlide();
  header(s9, I.economics.label, I.economics.heading, I.economics.emphasis);
  txt(s9, I.economics.intro, {
    x: M, y: 1.65, w: W - 2 * M, h: 0.7, fontSize: 11.5, color: BODY, valign: "top", lineSpacingMultiple: 1.03,
  });
  cards(s9, I.economics.drivers.map((d) => ({ title: d.title, body: d.body })), 2.55, 3.6, { titleSize: 13, bodySize: 10 });
  footer(s9);

  // ---- Slide 10: Five-year outlook ----
  const s10 = newSlide();
  header(s10, I.outlook.label, I.outlook.heading, I.outlook.emphasis);
  txt(s10, I.outlook.intro, {
    x: M, y: 1.65, w: W - 2 * M, h: 0.8, fontSize: 11.5, color: BODY, valign: "top", lineSpacingMultiple: 1.03,
  });
  cards(
    s10,
    I.outlook.levers.map((l) => ({ kicker: l.phase, title: l.title, body: l.body })),
    2.6, 3.6,
  );
  footer(s10);

  // ---- Slide 11: Two investor tracks ----
  const s11 = newSlide();
  header(s11, "Two ways to back Klario", "Choose the track that fits", "how you invest.");
  const trackCols = slots(2, 0.4);
  I.tracks.forEach((t, i) => {
    const { x, w } = trackCols[i];
    panel(s11, { x, y: 1.75, w, h: 5.1, fill: { color: PANEL }, line: { color: GOLD, width: 1 } });
    txt(s11, t.kicker.toUpperCase(), {
      x: x + 0.35, y: 2.0, w: w - 0.7, h: 0.3, fontSize: 10, color: GOLD, bold: true, charSpacing: 1.5,
    });
    txt(s11, t.title, { x: x + 0.35, y: 2.34, w: w - 0.7, h: 0.5, fontSize: 20, color: CREAM, bold: true });
    txt(s11, t.body, {
      x: x + 0.35, y: 2.9, w: w - 0.7, h: 1.15, fontSize: 11, color: BODY, valign: "top", lineSpacingMultiple: 1.05,
    });
    txt(
      s11,
      t.points.map((p) => ({ text: p, options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } })),
      { x: x + 0.35, y: 4.15, w: w - 0.7, h: 2.4, fontSize: 11.5, color: CREAM, valign: "top" },
    );
  });

  // ---- Slide 12: The ask ----
  const s12 = newSlide();
  header(s12, I.ask.label, I.ask.heading, I.ask.emphasis);
  txt(s12, I.ask.body, {
    x: M, y: 1.9, w: 10.5, h: 1.6, fontSize: 14, color: BODY, valign: "top", lineSpacingMultiple: 1.1,
  });
  txt(
    s12,
    [
      { text: "Talk to the founders   ", options: { color: GOLD, bold: true } },
      { text: "invest@klario.finance", options: { color: CREAM } },
    ],
    { x: M, y: 3.9, w: W - 2 * M, h: 0.4, fontSize: 15 },
  );
  txt(s12, I.ask.disclaimer, {
    x: M, y: H - 1.15, w: W - 2 * M, h: 0.9, fontSize: 9, color: DIM, italic: true, valign: "top", lineSpacingMultiple: 1.05,
  });

  await pptx.writeFile({
    fileName: `klario-investor-brief-${new Date().toISOString().slice(0, 10)}.pptx`,
  });
}

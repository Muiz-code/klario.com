import type { BetaResponse } from "@/lib/db/betaResponses";

// Brand palette (hex without the leading #, as pptxgenjs expects).
const NOIR = "0B0B0E";
const PANEL = "17171C";
const GOLD = "D4A853";
const CREAM = "ECE6D8";
const DIM = "8A8A93";
const SERIES = ["D4A853", "00B86B", "2B7FD6", "E07A55", "8A7CC0", "C7913F"];

const PROFESSIONS = ["Student", "Business owner", "Employed", "Freelancer"];

// Group alike answers (differing only by case, spacing, or trailing
// punctuation) into one bucket, shown under their most common spelling.
function normKey(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!?]+$/, "").trim();
}

function makeGrouper() {
  const counts = new Map<string, number>();
  const labels = new Map<string, Map<string, number>>();
  return {
    add(raw: string) {
      const label = raw.trim();
      if (!label) return;
      const k = normKey(label);
      counts.set(k, (counts.get(k) ?? 0) + 1);
      const lm = labels.get(k) ?? new Map<string, number>();
      lm.set(label, (lm.get(label) ?? 0) + 1);
      labels.set(k, lm);
    },
    result() {
      const out = new Map<string, number>();
      for (const [k, c] of counts) {
        const lm = labels.get(k)!;
        const best = [...lm.entries()].sort((a, b) => b[1] - a[1])[0][0];
        out.set(best, c);
      }
      return out;
    },
  };
}

function tally(values: (string | null | undefined)[], fallback = "No answer") {
  const g = makeGrouper();
  let empty = 0;
  for (const v of values) {
    const s = (v ?? "").trim();
    if (s) g.add(s);
    else empty++;
  }
  const out = g.result();
  if (empty) out.set(fallback, empty);
  return out;
}

function tallyMulti(lists: string[][]) {
  const g = makeGrouper();
  for (const list of lists) for (const v of list) g.add(v);
  return g.result();
}

function top(map: Map<string, number>, n: number) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function today() {
  const d = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Build and download a branded PowerPoint deck summarising the beta responses.
 * Runs entirely in the browser; pptxgenjs is loaded on demand.
 */
export async function exportBetaDeck(responses: BetaResponse[]) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pptx.author = "Klario";
  pptx.company = "Raavon Limited";
  pptx.title = "Klario Beta Insights";

  // Slide type inferred from the instance (pptxgenjs v4 doesn't export it by name).
  type Slide = ReturnType<typeof pptx.addSlide>;

  const W = 13.333;
  const bg = { color: NOIR };

  // Shared slide header (eyebrow + title).
  const header = (slide: Slide, eyebrow: string, title: string) => {
    slide.background = bg;
    slide.addText(eyebrow.toUpperCase(), {
      x: 0.6, y: 0.45, w: W - 1.2, h: 0.3,
      fontSize: 11, color: GOLD, bold: true, charSpacing: 2, fontFace: "Arial",
    });
    slide.addText(title, {
      x: 0.6, y: 0.72, w: W - 1.2, h: 0.7,
      fontSize: 26, color: CREAM, bold: true, fontFace: "Arial",
    });
  };

  // ---- Aggregations ----
  const total = responses.length;
  const verified = responses.filter((r) => r.verified).length;
  const spreadsheet = responses.filter((r) =>
    (r.method || "").toLowerCase().includes("spreadsheet")
  ).length;
  const trusts = responses
    .map((r) => r.trust)
    .filter((t): t is number => t !== null);
  const avgTrust =
    trusts.length > 0 ? trusts.reduce((a, b) => a + b, 0) / trusts.length : 0;

  const spreadsheetPct = total ? Math.round((spreadsheet / total) * 100) : 0;
  const occ = tally(
    responses.map((r) => r.occupation),
    "Unknown"
  );
  const features = tallyMulti(responses.map((r) => r.features));
  const pains = tallyMulti(responses.map((r) => r.pain));
  const prices = tally(responses.map((r) => r.price));
  const methods = tally(responses.map((r) => r.method));

  // Demand / willingness-to-pay signals.
  const namedPrice = responses.filter((r) => {
    const p = (r.price || "").toLowerCase().trim();
    return !!p && !/free|₦?\s*0(\b|$)/.test(p);
  }).length;
  const wouldPayPct = total ? Math.round((namedPrice / total) * 100) : 0;
  const withPain = responses.filter((r) => r.pain.length > 0).length;
  const painPct = total ? Math.round((withPain / total) * 100) : 0;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const topFeature = top(features, 1)[0];

  // ---- Slide 1: Title ----
  const s1 = pptx.addSlide();
  s1.background = bg;
  s1.addShape(pptx.ShapeType.rect, {
    x: 0, y: 3.05, w: 2.2, h: 0.06, fill: { color: GOLD },
  });
  s1.addText("Klario Beta Insights", {
    x: 0.6, y: 2.2, w: W - 1.2, h: 1,
    fontSize: 44, color: CREAM, bold: true, fontFace: "Arial",
  });
  s1.addText(
    `${total} beta ${total === 1 ? "response" : "responses"}  ·  ${verified} verified  ·  Exported ${today()}`,
    {
      x: 0.6, y: 3.2, w: W - 1.2, h: 0.5,
      fontSize: 16, color: DIM, fontFace: "Arial",
    }
  );
  s1.addText("Raavon Limited · klario.finance", {
    x: 0.6, y: 6.7, w: W - 1.2, h: 0.4,
    fontSize: 12, color: GOLD, fontFace: "Arial",
  });

  // ---- Slide 2: Key metrics ----
  const s2 = pptx.addSlide();
  header(s2, "Overview", "The numbers at a glance");
  const tiles = [
    { value: String(total), label: "Total responses" },
    { value: `${wouldPayPct}%`, label: "Named a price they'd pay" },
    { value: `${spreadsheetPct}%`, label: "Track money in a spreadsheet" },
    { value: `${avgTrust.toFixed(1)}/5`, label: "Avg. bank-link comfort" },
  ];
  const tileW = 2.9;
  const gap = 0.35;
  const startX = (W - (tileW * 4 + gap * 3)) / 2;
  tiles.forEach((t, i) => {
    const x = startX + i * (tileW + gap);
    s2.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.2, w: tileW, h: 2.4,
      fill: { color: PANEL }, line: { color: GOLD, width: 0.75 }, rectRadius: 0.1,
    });
    s2.addText(t.value, {
      x, y: 2.7, w: tileW, h: 1, fontSize: 40, color: GOLD, bold: true, align: "center", fontFace: "Arial",
    });
    s2.addText(t.label, {
      x, y: 3.8, w: tileW, h: 0.6, fontSize: 13, color: CREAM, align: "center", fontFace: "Arial",
    });
  });

  // ---- Chart helper ----
  const barSlide = (
    eyebrow: string,
    title: string,
    entries: [string, number][],
    colorIndex = 0
  ) => {
    const slide = pptx.addSlide();
    header(slide, eyebrow, title);
    if (entries.length === 0) {
      slide.addText("No data yet.", {
        x: 0.6, y: 3.2, w: W - 1.2, h: 0.6, fontSize: 16, color: DIM, fontFace: "Arial",
      });
      return;
    }
    // Values are the share of respondents who chose each answer (multi-select
    // answers can exceed 100% in total). Reverse so the largest sits on top.
    const ordered = [...entries].reverse();
    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: title,
          labels: ordered.map(([label]) => label),
          values: ordered.map(([, v]) => pct(v)),
        },
      ],
      {
        x: 0.6, y: 1.7, w: W - 1.2, h: 5.2,
        barDir: "bar",
        chartColors: [SERIES[colorIndex % SERIES.length]],
        showLegend: false,
        showTitle: false,
        showValue: true,
        dataLabelFormatCode: '0"%"',
        dataLabelColor: CREAM,
        dataLabelFontSize: 11,
        catAxisLabelColor: CREAM,
        catAxisLabelFontSize: 11,
        valAxisHidden: true,
        valGridLine: { style: "none" },
        catGridLine: { style: "none" },
        barGapWidthPct: 40,
      }
    );
  };

  // ---- Slide 3: Occupation (pie) ----
  const s3 = pptx.addSlide();
  header(s3, "Who they are", "Occupation breakdown");
  const occEntries = [
    ...PROFESSIONS.map((p) => [p, occ.get(p) ?? 0] as [string, number]),
    ["Unknown", occ.get("Unknown") ?? 0] as [string, number],
  ].filter(([, v]) => v > 0);
  if (occEntries.length > 0) {
    s3.addChart(
      pptx.ChartType.pie,
      [
        {
          name: "Occupation",
          labels: occEntries.map(([l]) => l),
          values: occEntries.map(([, v]) => v),
        },
      ],
      {
        x: 0.6, y: 1.7, w: W - 1.2, h: 5.1,
        chartColors: SERIES,
        showLegend: true,
        legendPos: "r",
        legendColor: CREAM,
        legendFontSize: 13,
        showPercent: true,
        dataLabelColor: NOIR,
        dataLabelFontSize: 12,
        showTitle: false,
      }
    );
  } else {
    s3.addText("No data yet.", {
      x: 0.6, y: 3.2, w: W - 1.2, h: 0.6, fontSize: 16, color: DIM, fontFace: "Arial",
    });
  }

  // ---- Analysis slides (share of respondents) ----
  barSlide("How they cope today", "How people track money now", top(methods, 6), 4);
  barSlide("Their problems", "Biggest money pains", top(pains, 8), 3);
  barSlide("What they want", "Most-wanted features", top(features, 8), 0);
  barSlide("Willingness to pay", "What feels fair to pay", top(prices, 8), 2);

  // ---- Demand & willingness-to-pay callouts ----
  const sd = pptx.addSlide();
  header(sd, "Demand signal", "How much they want Klario");
  const callouts = [
    { value: `${wouldPayPct}%`, label: "named a price they would pay for Klario" },
    { value: `${painPct}%`, label: "have a clear money pain today" },
    {
      value: topFeature ? `${pct(topFeature[1])}%` : "-",
      label: topFeature
        ? `want "${topFeature[0]}" (the most-requested feature)`
        : "most-requested feature",
    },
  ];
  const cW = 3.9;
  const cGap = 0.4;
  const cStart = (W - (cW * 3 + cGap * 2)) / 2;
  callouts.forEach((c, i) => {
    const x = cStart + i * (cW + cGap);
    sd.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.1, w: cW, h: 3, fill: { color: PANEL }, line: { color: GOLD, width: 0.75 }, rectRadius: 0.1,
    });
    sd.addText(c.value, {
      x, y: 2.5, w: cW, h: 1.2, fontSize: 52, color: GOLD, bold: true, align: "center", fontFace: "Arial",
    });
    sd.addText(c.label, {
      x: x + 0.25, y: 3.8, w: cW - 0.5, h: 1.1, fontSize: 14, color: CREAM, align: "center", fontFace: "Arial",
    });
  });
  sd.addText(
    "Multi-select answers can total more than 100%. Willingness to pay counts respondents who named a non-free price.",
    { x: 0.6, y: 6.7, w: W - 1.2, h: 0.4, fontSize: 10, color: DIM, italic: true, fontFace: "Arial" }
  );

  await pptx.writeFile({
    fileName: `klario-beta-insights-${new Date().toISOString().slice(0, 10)}.pptx`,
  });
}

import fs from "node:fs";
import path from "node:path";
import React from "react";
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { INVESTORS } from "@/lib/investors";

// The investor brief as a real document: laid out for A4 and drawn as text and
// vectors from the same INVESTORS data the /investors page renders, so the two
// never drift. Replaces printing the web page, which produced a screen grab.
// Served by app/Klario-Investor-Brief.pdf/route.ts.

const C = {
  noir: "#141116",
  page: "#FBF8F1",
  ink: "#2B1A12",
  body: "#4A3F38",
  dim: "#8A7F75",
  gold: "#B08A5C",
  goldHi: "#E6C989",
  cream: "#ECE6D8",
  rule: "#E6DED0",
  panel: "#F3EDE1",
  klarioRow: "#EFE3CC",
};

// Space Grotesk, the app's own typeface (SIL Open Font License, fonts/OFL.txt).
// Embedded because the PDF's built-in Helvetica has no naira sign: every ₦
// printed as a broken character.
const FONTS = path.join(process.cwd(), "lib", "investors", "fonts");
Font.register({ family: "Grotesk", src: path.join(FONTS, "SpaceGrotesk_400Regular.ttf") });
Font.register({ family: "Grotesk-Bold", src: path.join(FONTS, "SpaceGrotesk_700Bold.ttf") });
// Words are never split across lines with a hyphen.
Font.registerHyphenationCallback((word) => [word]);

// Read as bytes: given a path, react-pdf treats "C:..." on Windows as a URL
// with a "C:" scheme and silently drops the image, so the logo never showed.
const logo = (file: string) => ({ data: fs.readFileSync(path.join(process.cwd(), "public", "brand", file)), format: "png" as const });
const LOGO_LIGHT = logo("logo-light.png");
const LOGO_DARK = logo("logo-dark.png");
// Width over height, read from the PNG header. An Image given only a height is
// stretched to the full width of its row, which squashed the header logo.
const LOGO_ASPECT = LOGO_LIGHT.data.readUInt32BE(16) / LOGO_LIGHT.data.readUInt32BE(20);
const logoSize = (height: number) => ({ height, width: height * LOGO_ASPECT });

const s = StyleSheet.create({
  page: { backgroundColor: C.page, paddingTop: 64, paddingBottom: 56, paddingHorizontal: 48, fontFamily: "Grotesk", fontSize: 9.5, color: C.body, lineHeight: 1.45 },
  header: { position: "absolute", top: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 0.6, borderBottomColor: C.rule, paddingBottom: 8 },
  headerLogo: logoSize(15),
  headerText: { fontSize: 7.5, color: C.dim, letterSpacing: 0.6 },
  footer: { position: "absolute", bottom: 22, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: C.dim },

  label: { fontSize: 7.5, fontFamily: "Grotesk-Bold", color: C.gold, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 },
  h2: { fontSize: 20, fontFamily: "Grotesk-Bold", color: C.ink, lineHeight: 1.15, marginBottom: 8 },
  em: { color: C.gold },
  intro: { fontSize: 10, color: C.body, marginBottom: 14, maxWidth: 470 },
  section: { marginBottom: 22 },

  row: { flexDirection: "row", gap: 10 },
  card: { flex: 1, backgroundColor: C.panel, borderRadius: 4, padding: 11 },
  cardTitle: { fontSize: 10, fontFamily: "Grotesk-Bold", color: C.ink, marginBottom: 4 },
  cardKicker: { fontSize: 7, fontFamily: "Grotesk-Bold", color: C.gold, letterSpacing: 1, marginBottom: 3 },
  stat: { flex: 1, borderTopWidth: 1.4, borderTopColor: C.gold, paddingTop: 7 },
  // Its own line height: inheriting the body's let the line under it ride up into it.
  statValue: { fontSize: 17, fontFamily: "Grotesk-Bold", color: C.ink, lineHeight: 1.25 },
  statUnit: { fontSize: 7.5, color: C.gold, marginTop: 3, lineHeight: 1.3 },
  statLabel: { fontSize: 8, color: C.body, marginTop: 3 },

  bullet: { flexDirection: "row", marginBottom: 4 },
  dot: { width: 10, color: C.gold, fontFamily: "Grotesk-Bold" },
  bulletText: { flex: 1 },

  table: { borderTopWidth: 0.8, borderTopColor: C.ink },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.rule },
  th: { fontSize: 7.5, fontFamily: "Grotesk-Bold", color: C.ink, paddingVertical: 6, paddingHorizontal: 5 },
  td: { fontSize: 8.5, color: C.body, paddingVertical: 5.5, paddingHorizontal: 5 },
  note: { fontSize: 7.5, color: C.dim, marginTop: 6 },
});

/** A heading with its gold second half, as on the site. */
function Heading({ label, heading, emphasis }: { label: string; heading: string; emphasis: string }) {
  return (
    <View minPresenceAhead={60}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.h2}>
        {heading} <Text style={s.em}>{emphasis}</Text>
      </Text>
    </View>
  );
}

function Stats({ items }: { items: readonly { value: string; label: string; unit?: string }[] }) {
  return (
    <View style={[s.row, { marginBottom: 14 }]}>
      {items.map((m) => (
        <View key={m.label} style={s.stat}>
          <Text style={s.statValue}>{m.value}</Text>
          {m.unit ? <Text style={s.statUnit}>{m.unit}</Text> : null}
          <Text style={s.statLabel}>{m.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <View>
      {items.map((t) => (
        <View key={t} style={s.bullet} wrap={false}>
          <Text style={s.dot}>•</Text>
          <Text style={s.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

/** Cards laid out `per` to a row. */
function Cards({ items, per = 3 }: { items: readonly { title: string; body: string; kicker?: string }[]; per?: number }) {
  const rows: (typeof items[number])[][] = [];
  for (let i = 0; i < items.length; i += per) rows.push(items.slice(i, i + per));
  return (
    <View style={{ gap: 10 }}>
      {rows.map((r, i) => (
        <View key={i} style={s.row} wrap={false}>
          {r.map((c) => (
            <View key={c.title} style={s.card}>
              {c.kicker ? <Text style={s.cardKicker}>{c.kicker}</Text> : null}
              <Text style={s.cardTitle}>{c.title}</Text>
              <Text>{c.body}</Text>
            </View>
          ))}
          {Array.from({ length: per - r.length }).map((_, k) => <View key={`pad${k}`} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

/** A table; `widths` are flex weights, `highlight` marks a row (Klario). */
function Table({ head, rows, widths, highlight }: {
  head: readonly string[];
  rows: readonly (readonly string[])[];
  widths?: number[];
  highlight?: (i: number) => boolean;
}) {
  const w = (i: number) => ({ flex: widths?.[i] ?? 1 });
  return (
    <View style={s.table}>
      <View style={s.tr} wrap={false}>
        {head.map((h, i) => <Text key={i} style={[s.th, w(i)]}>{h}</Text>)}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={[s.tr, highlight?.(ri) ? { backgroundColor: C.klarioRow } : {}]} wrap={false}>
          {r.map((c, i) => (
            <Text key={i} style={[s.td, w(i), i === 0 ? { fontFamily: "Grotesk-Bold", color: C.ink } : {}]}>{c}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Chrome({ date }: { date: string }) {
  return (
    <>
      <View style={s.header} fixed>
        <Image src={LOGO_LIGHT} style={s.headerLogo} />
        <Text style={s.headerText}>INVESTOR BRIEF · {date.toUpperCase()}</Text>
      </View>
      <View style={s.footer} fixed>
        <Text>Confidential. Informational only, not an offer or solicitation. Raavon Limited (RC-9537604).</Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </>
  );
}

export function InvestorBrief() {
  const I = INVESTORS;
  const date = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const m = I.market;

  return (
    <Document title="Klario Investor Brief" author="Raavon Limited" subject="Klario investor brief">
      {/* ── Cover ── */}
      <Page size="A4" style={{ backgroundColor: C.noir, padding: 56, fontFamily: "Grotesk", color: C.cream, justifyContent: "space-between" }}>
        <Image src={LOGO_DARK} style={logoSize(34)} />
        <View>
          <Text style={{ fontSize: 9, fontFamily: "Grotesk-Bold", color: C.goldHi, letterSpacing: 2, marginBottom: 14 }}>INVESTOR BRIEF</Text>
          <Text style={{ fontSize: 34, fontFamily: "Grotesk-Bold", lineHeight: 1.1 }}>
            {I.hero.heading} <Text style={{ color: C.goldHi }}>{I.hero.emphasis}</Text>
          </Text>
          <Text style={{ fontSize: 11.5, color: "#C9C2B4", lineHeight: 1.55, marginTop: 18, maxWidth: 420 }}>{I.hero.sub}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.6, borderTopColor: "#3A332C", paddingTop: 14, fontSize: 8.5, color: "#A79F92" }}>
          <View>
            <Text style={{ color: C.cream, fontFamily: "Grotesk-Bold" }}>Private beta, closed testing</Text>
            <Text>{date}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: C.cream, fontFamily: "Grotesk-Bold" }}>invest@klario.finance</Text>
            <Text>klario.finance · Raavon Limited (RC-9537604)</Text>
          </View>
        </View>
      </Page>

      {/* ── The story, the evidence, the market ── */}
      <Page size="A4" style={s.page}>
        <Chrome date={date} />

        <View style={s.section}>
          <Heading label={I.whatItDoes.label} heading={I.whatItDoes.heading} emphasis={I.whatItDoes.emphasis} />
          <Text style={s.intro}>{I.whatItDoes.intro}</Text>
          <Cards items={I.whatItDoes.steps.map((x) => ({ kicker: x.step, title: x.title, body: x.body }))} />
        </View>

        <View style={s.section}>
          <Heading label={I.research.label} heading={I.research.heading} emphasis={I.research.emphasis} />
          <Text style={s.intro}>{I.research.intro}</Text>
          <Stats items={I.metrics} />
          <Stats items={I.research.signals.slice(0, 3)} />
          <Stats items={I.research.signals.slice(3)} />
          <Bullets items={I.research.takeaways} />
          <Text style={s.note}>Source: {I.research.source}</Text>
        </View>

        <View style={s.section}>
          <Heading label={I.opportunity.label} heading={I.opportunity.heading} emphasis={I.opportunity.emphasis} />
          <Cards items={I.opportunity.points} />
        </View>

        <View style={s.section}>
          <Heading label={m.label} heading={m.heading} emphasis={m.emphasis} />
          <Text style={s.intro}>{m.intro}</Text>
          <Stats items={m.size.map((x) => ({ value: x.value, unit: x.unit, label: `${x.label} [${x.ref}]` }))} />
          <View style={[s.row, { marginBottom: 14 }]} wrap={false}>
            <View style={[s.card, { flex: 1.3 }]}>
              <Text style={s.cardTitle}>{m.reach.heading}</Text>
              <Text>{m.reach.body} [{m.reach.ref}]</Text>
              <View style={[s.row, { marginTop: 8 }]}>
                {m.reach.stats.map((x) => (
                  <View key={x.label} style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Grotesk-Bold", color: C.ink }}>{x.value}</Text>
                    <Text style={{ fontSize: 7.5 }}>{x.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>{m.audience.heading}</Text>
              {m.audience.segments.map((g) => (
                <View key={g.label} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                  <Text style={{ width: 82, fontSize: 8 }}>{g.label}</Text>
                  <View style={{ flex: 1, height: 5, backgroundColor: C.rule }}>
                    <View style={{ width: `${g.pct}%`, height: 5, backgroundColor: "primary" in g && g.primary ? C.gold : C.dim }} />
                  </View>
                  <Text style={{ width: 26, textAlign: "right", fontSize: 8 }}>{g.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={s.intro}>{m.audience.body}</Text>
          <Bullets items={m.audience.reasons} />
        </View>

        <View style={s.section}>
          <Text style={s.cardTitle}>{m.pricing.heading}</Text>
          <Text style={s.intro}>{m.pricing.body}</Text>
          <Table
            head={["Monthly subscription", "Price"]}
            rows={m.pricing.benchmarks.map((b) => [b.name, `${b.price} [${b.ref}]`])}
            widths={[2, 1]}
            highlight={(i) => !!("klario" in m.pricing.benchmarks[i] && m.pricing.benchmarks[i].klario)}
          />
        </View>

        <View style={s.section}>
          <Text style={s.cardTitle}>{m.projection.heading}</Text>
          <Text style={s.intro}>{m.projection.body}</Text>
          <Table head={m.projection.columns} rows={m.projection.rows} />
          <Text style={s.note}>{m.projection.note}</Text>
        </View>

        {/* ── Product, model, landscape, economics ── */}

        <View style={s.section}>
          <Heading label={I.product.label} heading={I.product.heading} emphasis={I.product.emphasis} />
          <Text style={s.intro}>{I.product.intro}</Text>
          <Cards items={I.product.pillars} />
        </View>

        <View style={s.section}>
          <Heading label={I.model.label} heading={I.model.heading} emphasis={I.model.emphasis} />
          <Cards items={I.model.streams} />
          <Text style={s.note}>{I.model.note}</Text>
        </View>

        <View style={s.section}>
          <Heading label={I.tiers.label} heading={I.tiers.heading} emphasis={I.tiers.emphasis} />
          <Text style={s.intro}>{I.tiers.intro}</Text>
          <Table head={I.tiers.columns} rows={I.tiers.rows} widths={[1.6, 1, 1, 1.1]} />
          <Text style={s.note}>{I.tiers.note}</Text>
          <View style={[s.row, { marginTop: 12 }]}>
            {I.tiers.proof.map((p) => (
              <View key={p.label} style={s.stat}>
                <Text style={[s.statValue, { fontSize: 14 }]}>{p.value}</Text>
                <Text style={s.statLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Heading label={I.competitors.label} heading={I.competitors.heading} emphasis={I.competitors.emphasis} />
          <Text style={s.intro}>{I.competitors.intro}</Text>
          <Table
            head={["Product", ...I.competitors.columns.slice(1)]}
            rows={I.competitors.rows.map((r) => [r.name, r.cat, ...r.cells])}
            widths={[1.3, 1.2, 1.2, 0.9, 0.9, 0.9]}
            highlight={(i) => I.competitors.rows[i].klario}
          />
          <Text style={[s.cardTitle, { marginTop: 14 }]}>{I.competitors.diff.heading}</Text>
          <Cards items={I.competitors.diff.points} per={2} />
        </View>

        <View style={s.section}>
          <Heading label={I.economics.label} heading={I.economics.heading} emphasis={I.economics.emphasis} />
          <Text style={s.intro}>{I.economics.intro}</Text>
          <Cards items={I.economics.drivers} per={2} />
          <Text style={s.note}>{I.economics.note}</Text>
        </View>

        <View style={s.section}>
          <Heading label={I.outlook.label} heading={I.outlook.heading} emphasis={I.outlook.emphasis} />
          <Text style={s.intro}>{I.outlook.intro}</Text>
          <Cards items={I.outlook.levers.map((l) => ({ kicker: l.phase.toUpperCase(), title: l.title, body: l.body }))} />
          <Text style={s.note}>{I.outlook.note}</Text>
        </View>

        {/* ── Who it's for, the ask, sources ── */}

        <View style={s.section}>
          <Text style={s.label}>Two ways in</Text>
          <View style={s.row}>
            {I.tracks.map((t) => (
              <View key={t.id} style={s.card}>
                <Text style={s.cardKicker}>{t.kicker.toUpperCase()}</Text>
                <Text style={s.cardTitle}>{t.title}</Text>
                <Text style={{ marginBottom: 6 }}>{t.body}</Text>
                <Bullets items={t.points} />
              </View>
            ))}
          </View>
        </View>

        <View style={[s.section, { backgroundColor: C.noir, borderRadius: 4, padding: 20 }]} wrap={false}>
          <Text style={[s.label, { color: C.goldHi }]}>{I.ask.label}</Text>
          <Text style={[s.h2, { color: C.cream }]}>
            {I.ask.heading} <Text style={{ color: C.goldHi }}>{I.ask.emphasis}</Text>
          </Text>
          <Text style={{ color: "#C9C2B4", fontSize: 10 }}>{I.ask.body}</Text>
          <Text style={{ color: C.cream, fontFamily: "Grotesk-Bold", marginTop: 12 }}>Talk to the founders: invest@klario.finance</Text>
        </View>

        <View style={s.section}>
          <Text style={s.label}>Sources</Text>
          {m.sources.map((src, i) => (
            <Text key={src} style={{ fontSize: 8, marginBottom: 3 }}>[{i + 1}] {src}</Text>
          ))}
        </View>

        <Text style={s.note}>{I.ask.disclaimer}</Text>
      </Page>
    </Document>
  );
}

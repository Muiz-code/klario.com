import type { Metadata } from "next";
import {
  Landmark, Bot, Clock, Sparkles, PiggyBank, Zap, UserRound,
  Building2, TrendingUp, Download, Presentation, ArrowRight, type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/providers/AppShell";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ResearchCharts } from "@/components/investors/ResearchCharts";
import { AudienceMix } from "@/components/investors/AudienceMix";
import { PrintButton } from "@/components/investors/PrintButton";
import { DownloadDeckButton } from "@/components/investors/DownloadDeckButton";
import { GuillocheRosette, CertificateDivider } from "@/components/ui/Engraving";
import { StackedCards } from "@/components/ui/StackedCards";
import { SectionEngrave } from "@/components/ui/SectionEngrave";
import { INVESTORS } from "@/lib/investors";

export const metadata: Metadata = {
  title: "Investors | Klario Finance",
  description:
    "Klario is building the money-clarity layer for everyday Nigeria: every bank account unified, an AI that understands naira, and clarity turned into action. Partnership and investment opportunities.",
  alternates: { canonical: "/investors" },
};

const icons: Record<string, LucideIcon> = {
  Landmark, Bot, Clock, Sparkles, PiggyBank, Zap, UserRound, Building2, TrendingUp,
};

export default function InvestorsPage() {
  const I = INVESTORS;
  return (
    <AppShell>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-ink py-28 text-bg md:py-36">
          <GuillocheRosette className="pointer-events-none absolute right-[-6%] top-[-14%] z-0 h-[85%] w-auto opacity-[0.13]" />
          <Container className="relative z-10">
            <ScrollReveal>
              <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-gold">
                {I.hero.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.02] text-bg sm:text-5xl md:text-6xl lg:text-7xl">
                {I.hero.heading}{" "}
                <span className="text-gold">{I.hero.emphasis}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-bg/70 md:text-lg">
                {I.hero.sub}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <PrintButton size="lg" className="gap-2">
                  <Download size={17} /> {I.hero.primaryCta.label}
                </PrintButton>
                <DownloadDeckButton size="lg" className="gap-2 border-bg/25 text-bg hover:border-bg hover:bg-bg/10">
                  <Presentation size={17} /> PowerPoint (.pptx)
                </DownloadDeckButton>
                <Button href={I.hero.secondaryCta.href} variant="outline" size="lg" className="border-bg/25 text-bg hover:border-bg hover:bg-bg/10">
                  {I.hero.secondaryCta.label}
                </Button>
              </div>
            </ScrollReveal>

            {/* Metrics band */}
            <ScrollReveal>
              <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-bg/10 bg-bg/5 sm:grid-cols-2 lg:grid-cols-5">
                {I.metrics.map((m) => (
                  <div key={m.label} className="group bg-ink px-6 py-7 transition-colors hover:bg-bg/[0.02]">
                    <p className="font-display text-3xl text-gold md:text-4xl">{m.value}</p>
                    <span aria-hidden className="mt-3 block h-px w-8 bg-gold/40 transition-all duration-300 group-hover:w-12" />
                    <p className="mt-3 text-[13px] leading-snug text-bg/60">{m.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── What Klario does (product explainer) ── */}
        <section className="relative overflow-hidden bg-surface py-24 md:py-32">
          <SectionEngrave tone="light" position="bl" size="md" reverse />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.whatItDoes.label}</SectionLabel>
              <h2 className="mt-5 max-w-4xl font-display text-4xl leading-[1.02] text-ink sm:text-5xl md:text-6xl lg:text-7xl">
                {I.whatItDoes.heading}{" "}
                <span className="text-gold">{I.whatItDoes.emphasis}</span>
              </h2>
              <p className="mt-7 max-w-2xl text-[15px] leading-relaxed text-body/75 md:text-lg">
                {I.whatItDoes.intro}
              </p>
            </ScrollReveal>
            {/* Connect → Understand → Act, numbered so the flow reads in order. */}
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {I.whatItDoes.steps.map((s) => {
                const Icon = icons[s.icon];
                return (
                  <ScrollReveal key={s.step}>
                    <article className="glass-card card-edge-engrave relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl p-8">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold-dim text-gold">
                          <Icon size={20} strokeWidth={1.75} />
                        </span>
                        <span className="font-display text-3xl text-gold/25 md:text-4xl">{s.step}</span>
                      </div>
                      <h3 className="font-display text-xl text-ink md:text-2xl">{s.title}</h3>
                      <p className="text-[14.5px] leading-relaxed text-body/75">{s.body}</p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ── Opportunity ── */}
        <section className="relative bg-surface py-24 md:py-32">
          <SectionEngrave tone="light" position="tr" size="lg" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.opportunity.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-ink sm:text-5xl md:text-6xl lg:text-7xl">
                {I.opportunity.heading}{" "}
                <span className="text-gold">{I.opportunity.emphasis}</span>
              </h2>
            </ScrollReveal>
            {/* Scroll-stack: each reason pins and reveals on scroll. */}
            <div className="mt-8">
              <StackedCards heightClass="h-[64vh] md:h-[74vh]">
                {I.opportunity.points.map((p) => {
                  const Icon = icons[p.icon];
                  return (
                    <article
                      key={p.title}
                      className="card-edge-engrave relative flex min-h-[300px] flex-col gap-5 overflow-hidden rounded-2xl bg-[#f6f2ea] p-8 shadow-[0_30px_80px_-32px_rgba(60,40,20,0.5)] md:p-10"
                    >
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold-dim text-gold">
                        <Icon size={22} strokeWidth={1.75} />
                      </span>
                      <h3 className="font-display text-xl text-ink md:text-2xl">{p.title}</h3>
                      <p className="max-w-xl text-[15px] leading-relaxed text-body/75">{p.body}</p>
                    </article>
                  );
                })}
              </StackedCards>
            </div>
          </Container>
        </section>

        {/* ── Beta research validation ── */}
        <section className="relative overflow-hidden bg-ink py-24 text-bg md:py-32">
          <GuillocheRosette className="pointer-events-none absolute bottom-[-20%] left-[-8%] z-0 h-[62%] w-auto opacity-[0.08]" />
          <GuillocheRosette reverse className="pointer-events-none absolute right-[-6%] top-[-16%] z-0 h-[72%] w-auto opacity-[0.09]" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.research.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-bg sm:text-5xl md:text-6xl lg:text-7xl">
                {I.research.heading} <span className="text-gold">{I.research.emphasis}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-bg/65">{I.research.intro}</p>
            </ScrollReveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {I.research.signals.map((s) => (
                <ScrollReveal key={s.label}>
                  <article className="flex h-full flex-col gap-2 rounded-2xl border border-bg/10 bg-bg/[0.03] p-7">
                    <p className="font-display text-4xl text-gold md:text-5xl">{s.value}</p>
                    <p className="text-[14px] leading-relaxed text-bg/65">{s.label}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal>
              <ul className="mt-10 flex flex-col gap-3">
                {I.research.takeaways.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px] text-bg/80">
                    <ArrowRight size={16} className="mt-1 shrink-0 text-gold" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            {/* Charts */}
            <ResearchCharts />

            <ScrollReveal>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-bg/40">{I.research.source}</p>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── Market size, target & willingness to pay ── */}
        <section className="relative overflow-hidden bg-surface py-24 md:py-32">
          <GuillocheRosette className="pointer-events-none absolute right-[-7%] top-[-8%] z-0 h-[64%] w-auto opacity-[0.07]" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.market.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-ink sm:text-5xl md:text-6xl lg:text-7xl">
                {I.market.heading} <span className="text-gold">{I.market.emphasis}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-body/75">{I.market.intro}</p>
              <CertificateDivider className="mt-10 max-w-xl" />
            </ScrollReveal>

            {/* Market-size headline stats */}
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {I.market.size.map((s) => (
                <ScrollReveal key={s.label}>
                  <article className="card-edge-engrave relative flex h-full flex-col gap-1.5 overflow-hidden rounded-2xl border border-ink/10 bg-white/60 p-6">
                    <p className="font-display text-3xl leading-none text-gold md:text-4xl">{s.value}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-body/45">{s.unit}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-body/70">
                      {s.label}
                      <sup className="ml-0.5 align-super font-mono text-[9px] text-gold/60">{s.ref}</sup>
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            {/* The users already exist, at scale */}
            <ScrollReveal>
              <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-ink/10 bg-ink px-7 py-8 text-bg md:flex-row md:items-center md:justify-between md:px-10">
                <div className="max-w-md">
                  <h3 className="font-display text-xl text-bg md:text-2xl">
                    {I.market.reach.heading}
                    <sup className="ml-1 align-super font-mono text-[10px] text-gold/70">{I.market.reach.ref}</sup>
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-bg/65">{I.market.reach.body}</p>
                </div>
                <div className="grid shrink-0 grid-cols-3 gap-6 md:gap-8">
                  {I.market.reach.stats.map((st) => (
                    <div key={st.label} className="text-center md:text-left">
                      <p className="font-display text-2xl text-gold md:text-3xl">{st.value}</p>
                      <p className="mt-1.5 text-[11.5px] leading-snug text-bg/55">{st.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Who we serve & why they'll pay */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <ScrollReveal>
                <article className="glass-card card-edge-engrave flex h-full flex-col gap-4 rounded-2xl p-8">
                  <h3 className="font-display text-xl text-ink md:text-2xl">{I.market.audience.heading}</h3>
                  <p className="text-[14.5px] leading-relaxed text-body/75">{I.market.audience.body}</p>
                  {/* Target-audience mix — students lead; bars fill on scroll */}
                  <AudienceMix segments={I.market.audience.segments} />
                  <ul className="mt-1 flex flex-col gap-3">
                    {I.market.audience.reasons.map((r) => (
                      <li key={r} className="flex items-start gap-3 text-[14px] text-body/80">
                        <ArrowRight size={15} className="mt-1 shrink-0 text-gold" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </ScrollReveal>

              <ScrollReveal>
                <article className="glass-card card-edge-engrave flex h-full flex-col gap-4 rounded-2xl p-8">
                  <h3 className="font-display text-xl text-ink md:text-2xl">
                    {I.market.pricing.heading}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-body/75">{I.market.pricing.body}</p>
                  {/* Mobile: full-width rows (price never wraps); sm+: 3 cards */}
                  <div className="mt-auto flex flex-col gap-2.5 pt-2 sm:grid sm:grid-cols-3 sm:gap-3">
                    {I.market.pricing.benchmarks.map((b) => {
                      const isKlario = "klario" in b && b.klario;
                      return (
                        <div
                          key={b.name}
                          className={
                            "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 sm:flex-col sm:items-center sm:gap-1.5 sm:px-3 sm:py-4 sm:text-center " +
                            (isKlario ? "border-gold/45 bg-gold/[0.07]" : "border-ink/10 bg-white/50")
                          }
                        >
                          <span className={"text-[12.5px] font-medium " + (isKlario ? "text-gold" : "text-ink/80")}>
                            {b.name}
                            <sup className="ml-0.5 align-super font-mono text-[8px] text-body/40">{b.ref}</sup>
                          </span>
                          <span className="whitespace-nowrap font-display text-[14px] text-ink sm:text-[15px]">{b.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </ScrollReveal>
            </div>

            {/* Illustrative revenue model */}
            <ScrollReveal>
              <div className="mt-8">
                <h3 className="font-display text-xl text-ink md:text-2xl">{I.market.projection.heading}</h3>
                <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-body/75">{I.market.projection.body}</p>
                <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 bg-ink/[0.03]">
                        {I.market.projection.columns.map((c, i) => (
                          <th
                            key={c}
                            className={`px-5 py-4 font-mono text-[11px] uppercase tracking-[0.16em] ${
                              i === 1 ? "text-gold" : "text-body/60"
                            }`}
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {I.market.projection.rows.map((row) => (
                        <tr key={row[0]} className="border-b border-ink/[0.06] last:border-b-0">
                          {row.map((cell, i) => (
                            <td
                              key={i}
                              className={`px-5 py-4 ${
                                i === 0
                                  ? "font-medium text-ink"
                                  : i === 1
                                    ? "font-display text-gold"
                                    : "font-mono text-[12px] text-body/55"
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 max-w-3xl text-[12.5px] leading-relaxed text-body/55">{I.market.projection.note}</p>
              </div>
            </ScrollReveal>

            {/* Sources */}
            <ScrollReveal>
              <ol className="mt-10 flex flex-col gap-1.5 border-t border-ink/10 pt-6">
                {I.market.sources.map((src, i) => (
                  <li key={src} className="flex gap-2 font-mono text-[11px] leading-relaxed text-body/45">
                    <span className="shrink-0 text-gold/60">{i + 1}.</span>
                    <span>{src}</span>
                  </li>
                ))}
              </ol>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── Product ── */}
        <section className="relative bg-ink py-24 text-bg md:py-32">
          <SectionEngrave tone="dark" position="bl" size="md" reverse />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.product.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-bg sm:text-5xl md:text-6xl lg:text-7xl">
                {I.product.heading} <span className="text-gold">{I.product.emphasis}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-bg/65">{I.product.intro}</p>
            </ScrollReveal>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {I.product.pillars.map((p) => {
                const Icon = icons[p.icon];
                return (
                  <ScrollReveal key={p.title}>
                    <article className="flex h-full flex-col gap-4 rounded-2xl border border-bg/10 bg-bg/[0.03] p-7 transition-colors hover:border-gold/30">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
                        <Icon size={20} strokeWidth={1.75} />
                      </span>
                      <h3 className="font-display text-lg text-bg md:text-xl">{p.title}</h3>
                      <p className="text-[14px] leading-relaxed text-bg/60">{p.body}</p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ── Business model ── */}
        <section className="relative bg-surface py-24 md:py-32">
          <SectionEngrave tone="light" position="br" size="sm" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.model.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-ink sm:text-5xl md:text-6xl lg:text-7xl">
                {I.model.heading} <span className="text-gold">{I.model.emphasis}</span>
              </h2>
            </ScrollReveal>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {I.model.streams.map((s, i) => (
                <ScrollReveal key={s.title}>
                  <article className="glass-card card-edge-engrave relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-7">
                    <span className="font-mono text-sm text-gold">0{i + 1}</span>
                    <h3 className="font-display text-lg text-ink md:text-xl">{s.title}</h3>
                    <p className="text-[14px] leading-relaxed text-body/75">{s.body}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal>
              <p className="mt-8 max-w-3xl text-[13.5px] leading-relaxed text-body/60">{I.model.note}</p>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── Capability tiers + product proof ── */}
        <section className="relative bg-ink py-24 text-bg md:py-32">
          <SectionEngrave tone="dark" position="tl" size="xl" reverse />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.tiers.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-bg sm:text-5xl md:text-6xl lg:text-7xl">
                {I.tiers.heading} <span className="text-gold">{I.tiers.emphasis}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-bg/65">{I.tiers.intro}</p>
            </ScrollReveal>

            {/* Proof stats */}
            <ScrollReveal>
              <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-bg/10 bg-bg/5 sm:grid-cols-3">
                {I.tiers.proof.map((p) => (
                  <div key={p.label} className="bg-ink px-6 py-7">
                    <p className="font-display text-3xl text-gold md:text-4xl">{p.value}</p>
                    <p className="mt-2 text-[13px] leading-snug text-bg/60">{p.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Tiers table */}
            <ScrollReveal>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-bg/10">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-bg/10 bg-bg/[0.03]">
                      {I.tiers.columns.map((c, i) => (
                        <th
                          key={c}
                          className={`px-5 py-4 font-mono text-[11px] uppercase tracking-[0.16em] ${
                            i === 0 ? "text-bg/70" : "text-gold"
                          }`}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {I.tiers.rows.map((row) => (
                      <tr key={row[0]} className="border-b border-bg/[0.06] last:border-b-0">
                        {row.map((cell, i) => (
                          <td
                            key={i}
                            className={`px-5 py-4 ${i === 0 ? "font-medium text-bg/85" : "font-mono text-bg/70"}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-3xl text-[12.5px] leading-relaxed text-bg/50">{I.tiers.note}</p>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── Competitive landscape ── */}
        <section className="relative bg-surface py-24 md:py-32">
          <SectionEngrave tone="light" position="tr" size="md" reverse />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.competitors.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-ink sm:text-5xl md:text-6xl lg:text-7xl">
                {I.competitors.heading} <span className="text-gold">{I.competitors.emphasis}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-body/75">{I.competitors.intro}</p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="mt-12 overflow-x-auto rounded-2xl border border-ink/10">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink/10 bg-ink/[0.03]">
                      {I.competitors.columns.map((c, i) => (
                        <th key={i} className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-body/60">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {I.competitors.rows.map((row) => (
                      <tr
                        key={row.name}
                        className={
                          "border-b border-ink/[0.06] last:border-b-0 " +
                          (row.klario ? "bg-gold/[0.08]" : "")
                        }
                      >
                        <td className={"px-4 py-4 font-semibold " + (row.klario ? "text-gold" : "text-ink")}>{row.name}</td>
                        <td className="px-4 py-4 text-body/70">{row.cat}</td>
                        {row.cells.map((cell, i) => (
                          <td key={i} className={"px-4 py-4 " + (row.klario ? "font-medium text-ink" : "text-body/60")}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            {/* Differentiation */}
            <ScrollReveal>
              <h3 className="mt-16 font-display text-2xl text-ink md:text-3xl">{I.competitors.diff.heading}</h3>
            </ScrollReveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {I.competitors.diff.points.map((p) => (
                <ScrollReveal key={p.title}>
                  <article className="glass-card-dark flex h-full flex-col gap-3 rounded-2xl p-7">
                    <h4 className="font-display text-lg text-ink">{p.title}</h4>
                    <p className="text-[14px] leading-relaxed text-body/75">{p.body}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ── How we run (cost structure) ── */}
        <section className="relative bg-ink py-24 text-bg md:py-32">
          <SectionEngrave tone="dark" position="bl" size="lg" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.economics.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-bg sm:text-5xl md:text-6xl lg:text-7xl">
                {I.economics.heading} <span className="text-gold">{I.economics.emphasis}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-bg/65">{I.economics.intro}</p>
            </ScrollReveal>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {I.economics.drivers.map((d) => (
                <ScrollReveal key={d.title}>
                  <article className="flex h-full flex-col gap-3 rounded-2xl border border-bg/10 bg-bg/[0.03] p-6">
                    <h3 className="font-display text-[17px] text-bg">{d.title}</h3>
                    <p className="text-[13.5px] leading-relaxed text-bg/60">{d.body}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal>
              <p className="mt-8 max-w-3xl text-[12.5px] leading-relaxed text-bg/50">{I.economics.note}</p>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── Five-year outlook ── */}
        <section className="relative bg-surface py-24 md:py-32">
          <SectionEngrave tone="light" position="br" size="sm" reverse />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>{I.outlook.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-ink sm:text-5xl md:text-6xl lg:text-7xl">
                {I.outlook.heading} <span className="text-gold">{I.outlook.emphasis}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-body/75">{I.outlook.intro}</p>
            </ScrollReveal>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {I.outlook.levers.map((l) => (
                <ScrollReveal key={l.title}>
                  <article className="glass-card-dark flex h-full flex-col gap-3 rounded-2xl p-7">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">{l.phase}</span>
                    <h3 className="font-display text-xl text-ink">{l.title}</h3>
                    <p className="text-[14px] leading-relaxed text-body/75">{l.body}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal>
              <p className="mt-8 max-w-3xl text-[12.5px] leading-relaxed text-body/55">{I.outlook.note}</p>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── Two investor tracks ── */}
        <section className="relative overflow-hidden bg-ink py-24 text-bg md:py-32">
          <GuillocheRosette className="pointer-events-none absolute right-[-6%] bottom-[-18%] z-0 h-[64%] w-auto opacity-[0.09]" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel>Two ways to back Klario</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-4xl text-bg sm:text-5xl md:text-6xl lg:text-7xl">
                Choose the track that fits <span className="text-gold">how you invest.</span>
              </h2>
            </ScrollReveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {I.tracks.map((t) => {
                const Icon = icons[t.icon];
                return (
                  <ScrollReveal key={t.id}>
                    <article className="flex h-full flex-col rounded-3xl border border-gold/25 bg-gold/[0.05] p-8 transition-colors hover:border-gold/45 md:p-10">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-ink">
                        <Icon size={22} strokeWidth={1.9} />
                      </span>
                      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-gold">{t.kicker}</p>
                      <h3 className="mt-2 font-display text-2xl text-bg md:text-3xl">{t.title}</h3>
                      <p className="mt-4 text-[14.5px] leading-relaxed text-bg/70">{t.body}</p>
                      <ul className="mt-6 flex flex-col gap-3">
                        {t.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-3 text-[14px] text-bg/80">
                            <ArrowRight size={15} className="mt-1 shrink-0 text-gold" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                      {/* mt-auto pins the CTA to the bottom edge so both cards align
                          regardless of how many bullets each has. */}
                      <div className="mt-auto border-t border-gold/15 pt-6">
                        <Button href={t.cta.href} size="lg" className="w-full justify-between gap-2">
                          {t.cta.label} <ArrowRight size={16} />
                        </Button>
                      </div>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ── The ask ── */}
        <section className="relative bg-surface py-24 md:py-32">
          <SectionEngrave tone="light" position="tl" size="md" />
          <Container className="relative z-10">
            <ScrollReveal>
              <div className="glass-card card-edge-engrave relative overflow-hidden rounded-3xl p-8 md:p-14">
                <SectionLabel>{I.ask.label}</SectionLabel>
                <h2 className="mt-4 max-w-3xl font-display text-4xl text-ink sm:text-5xl md:text-6xl lg:text-7xl">
                  {I.ask.heading} <span className="text-gold">{I.ask.emphasis}</span>
                </h2>
                <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-body/75">{I.ask.body}</p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <PrintButton size="lg" className="gap-2">
                    <Download size={17} /> {I.ask.primaryCta.label}
                  </PrintButton>
                  <DownloadDeckButton size="lg" className="gap-2">
                    <Presentation size={17} /> PowerPoint (.pptx)
                  </DownloadDeckButton>
                  <Button href={I.ask.secondaryCta.href} variant="outline" size="lg">
                    {I.ask.secondaryCta.label}
                  </Button>
                </div>
                <CertificateDivider className="mt-12" />
                <p className="mt-8 max-w-3xl text-[12px] leading-relaxed text-body/50">{I.ask.disclaimer}</p>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

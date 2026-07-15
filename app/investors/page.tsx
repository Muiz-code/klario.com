import type { Metadata } from "next";
import {
  Landmark, Bot, Clock, Sparkles, PiggyBank, Zap, UserRound,
  Building2, TrendingUp, Download, ArrowRight, type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/providers/AppShell";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ResearchCharts } from "@/components/investors/ResearchCharts";
import { PrintButton } from "@/components/investors/PrintButton";
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
          <Container className="relative">
            <ScrollReveal>
              <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-gold">
                {I.hero.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.05] text-bg md:text-6xl">
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
                <Button href={I.hero.secondaryCta.href} variant="outline" size="lg" className="border-bg/25 text-bg hover:border-bg hover:bg-bg/10">
                  {I.hero.secondaryCta.label}
                </Button>
              </div>
            </ScrollReveal>

            {/* Metrics band */}
            <ScrollReveal>
              <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-bg/10 bg-bg/5 sm:grid-cols-2 lg:grid-cols-5">
                {I.metrics.map((m) => (
                  <div key={m.label} className="bg-ink px-6 py-7">
                    <p className="font-display text-3xl text-gold md:text-4xl">{m.value}</p>
                    <p className="mt-2 text-[13px] leading-snug text-bg/60">{m.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── Beta research validation ── */}
        <section className="border-t border-bg/10 bg-ink py-24 text-bg md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>{I.research.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-bg md:text-5xl">
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

        {/* ── Opportunity ── */}
        <section className="bg-surface py-24 md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>{I.opportunity.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-ink md:text-5xl">
                {I.opportunity.heading}{" "}
                <span className="text-gold">{I.opportunity.emphasis}</span>
              </h2>
            </ScrollReveal>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {I.opportunity.points.map((p) => {
                const Icon = icons[p.icon];
                return (
                  <ScrollReveal key={p.title}>
                    <article className="glass-card flex h-full flex-col gap-4 rounded-2xl p-7">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold-dim text-gold">
                        <Icon size={20} strokeWidth={1.75} />
                      </span>
                      <h3 className="font-display text-lg text-ink md:text-xl">{p.title}</h3>
                      <p className="text-[14px] leading-relaxed text-body/75">{p.body}</p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ── Product ── */}
        <section className="bg-ink py-24 text-bg md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>{I.product.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-bg md:text-5xl">
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
        <section className="bg-surface py-24 md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>{I.model.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-ink md:text-5xl">
                {I.model.heading} <span className="text-gold">{I.model.emphasis}</span>
              </h2>
            </ScrollReveal>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {I.model.streams.map((s, i) => (
                <ScrollReveal key={s.title}>
                  <article className="glass-card flex h-full flex-col gap-3 rounded-2xl p-7">
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
        <section className="bg-ink py-24 text-bg md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>{I.tiers.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-bg md:text-5xl">
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
        <section className="bg-surface py-24 md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>{I.competitors.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-ink md:text-5xl">
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
        <section className="bg-ink py-24 text-bg md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>{I.economics.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-bg md:text-5xl">
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
        <section className="bg-surface py-24 md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>{I.outlook.label}</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-ink md:text-5xl">
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
        <section className="bg-ink py-24 text-bg md:py-32">
          <Container>
            <ScrollReveal>
              <SectionLabel>Two ways to back Klario</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-display text-3xl text-bg md:text-5xl">
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
        <section className="bg-surface py-24 md:py-32">
          <Container>
            <ScrollReveal>
              <div className="glass-card rounded-3xl p-8 md:p-14">
                <SectionLabel>{I.ask.label}</SectionLabel>
                <h2 className="mt-4 max-w-3xl font-display text-3xl text-ink md:text-5xl">
                  {I.ask.heading} <span className="text-gold">{I.ask.emphasis}</span>
                </h2>
                <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-body/75">{I.ask.body}</p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <PrintButton size="lg" className="gap-2">
                    <Download size={17} /> {I.ask.primaryCta.label}
                  </PrintButton>
                  <Button href={I.ask.secondaryCta.href} variant="outline" size="lg">
                    {I.ask.secondaryCta.label}
                  </Button>
                </div>
                <p className="mt-10 max-w-3xl text-[12px] leading-relaxed text-body/50">{I.ask.disclaimer}</p>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

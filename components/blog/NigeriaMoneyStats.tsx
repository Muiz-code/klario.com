import { Container } from "@/components/ui/Container";
import { WageInflationChart } from "@/components/blog/WageInflationChart";

// Indicative figures from the National Bureau of Statistics (NBS), compiled via
// Nairametrics. Labour figures were rebased in 2023, so pre/post are not directly
// comparable. Shown as context, not gospel.
const KPIS = [
  { value: "95.0%", label: "Employment rate", sub: "NBS, 2023 (rebased)" },
  { value: "5.0%", label: "Unemployment rate", sub: "NBS, 2023" },
  { value: "92.6%", label: "Of jobs are informal", sub: "NBS labour data" },
  { value: "₦70k", label: "Monthly minimum wage", sub: "Effective 2024" },
];

export function NigeriaMoneyStats() {
  return (
    <section className="border-y border-border-gold/40 bg-surface py-16 md:py-20">
      <Container>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold/85">
              Nigeria money snapshot
            </span>
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              The numbers behind every naira
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-body/70 md:text-[15px]">
              A quick read on work, pay and prices in Nigeria. It is the backdrop
              to why managing money well matters more than ever.
            </p>
          </div>

          {/* Labour KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {KPIS.map((k) => (
              <div key={k.label} className="glass-card-dark rounded-2xl p-5">
                <p className="font-display text-3xl text-ink md:text-4xl">
                  {k.value}
                </p>
                <p className="mt-2 text-[13px] font-medium text-ink/80">
                  {k.label}
                </p>
                <p className="mt-0.5 text-[11px] text-body/50">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Wage vs inflation vs unemployment over time */}
          <div className="mt-6 glass-card-black rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-lg text-white md:text-xl">
              Wages, inflation &amp; unemployment since 2010
            </h3>
            <p className="mt-1 text-[12px] text-white/55">
              The minimum wage has stepped up three times since 2010, while
              inflation has stayed high, quietly eroding what each naira buys.
              Hover the chart to read any year.
            </p>

            <div className="mt-6">
              <WageInflationChart />
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-body/45">
            Indicative figures from the National Bureau of Statistics (NBS),
            compiled via Nairametrics. The national minimum wage rose from ₦7,500
            (2010) to ₦18,000 (2011), ₦30,000 (2019) and ₦70,000 (2024).
            Unemployment was rebased to a new methodology in 2023, so the values
            before and after are not directly comparable. Inflation is the
            approximate annual average. 2025-2026 are estimates.
          </p>
        </div>
      </Container>
    </section>
  );
}

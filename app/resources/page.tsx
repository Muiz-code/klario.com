import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { GuillocheRosette } from "@/components/ui/Engraving";

/**
 * klario.finance/resources
 *
 * Free materials for anyone running money in Nigeria, with or without a
 * Klario account. The budget templates are the first; the blog is the
 * second. More lands here as it is made.
 */
export const metadata: Metadata = {
  title: "Free resources | Klario",
  description:
    "Free budget templates, guides and reading for Nigerian businesses and households. No sign-in needed.",
  alternates: { canonical: "/resources" },
};

const RESOURCES = [
  {
    title: "Business budget templates",
    kicker: "Excel · free",
    text:
      "A fast one-page budget with pictures for people who find spreadsheets hard, and a full monthly budget with actuals and variance. Eleven business types, from a food vendor to a startup.",
    href: "/templates",
    cta: "Get a template",
  },
  {
    title: "The Klario blog",
    kicker: "Reading",
    text:
      "Practical guides on budgeting, debt, saving and running a small business, written for how money actually moves here.",
    href: "/blog",
    cta: "Read the blog",
  },
] as const;

export default function ResourcesPage() {
  return (
    <>
      <Navbar theme="light" />
      <main className="bg-bg">
        <section className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-3xl"
            style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(212,168,83,0.14), transparent 70%)" }}
          />
          <GuillocheRosette className="pointer-events-none absolute right-[-6%] top-[-6%] z-0 h-[70%] w-auto opacity-[0.09]" />
          <Container className="relative z-10">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
              <SectionLabel>Resources</SectionLabel>
              <h1 className="font-display text-balance text-4xl leading-[1.05] text-ink sm:text-5xl md:text-6xl lg:text-[3.5rem]">
                Free tools for <span className="italic text-gold">your money</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-body/75 md:text-[17px]">
                Templates and guides you can use today, with or without the app. Nothing to sign up for.
              </p>
            </div>
          </Container>
        </section>

        <section className="pb-24 md:pb-32">
          <Container>
            <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
              {RESOURCES.map((r) => (
                <article key={r.href} className="flex flex-col rounded-3xl border border-border-gold bg-surface p-7">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold/80">{r.kicker}</span>
                  <h2 className="mt-3 font-[family-name:var(--font-jakarta)] text-2xl font-semibold tracking-tight text-mahogany">{r.title}</h2>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body">{r.text}</p>
                  <div className="mt-6">
                    <Button href={r.href} size="md">{r.cta}</Button>
                  </div>
                </article>
              ))}
            </div>
            <p className="mx-auto mt-10 max-w-4xl text-sm text-muted">
              More is on the way: cash flow and invoice templates, and short guides for each business type.
            </p>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

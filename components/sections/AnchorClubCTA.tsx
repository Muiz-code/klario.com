import Link from "next/link";
import { ArrowRight, Anchor } from "lucide-react";
import { Section } from "@/components/ui/Section";

/**
 * The old Ambassador program is now the Anchor Club. This section replaces the
 * ambassador form with a short pitch and a button that sends people to the
 * dedicated /anchor-club flow.
 */
export function AnchorClubCTA() {
  return (
    <Section
      id="anchor-club"
      label="Klario Anchor Club"
      heading="Build with us"
      emphasis="· not for us."
      intro="The Anchor Club is a hands-on community for people who want to actually build something. Get real product experience, mentorship, first access to the Klario beta, and merch — alongside a network of students and builders growing together."
      className="bg-surface"
    >
      <div className="glass-card-dark mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-3xl p-10 text-center md:p-14">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-dim text-gold">
          <Anchor size={26} strokeWidth={1.75} />
        </span>
        <h3 className="font-display text-2xl text-ink md:text-3xl">
          Join the founding cohort
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-body/70">
          We select a small group of students and builders to grow together —
          learn practical skills, grow your portfolio, and help shape Klario from
          the inside.
        </p>
        <Link
          href="/anchor-club"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-all hover:scale-[1.01] hover:shadow-[0_12px_40px_-8px_rgba(212,168,83,0.55)]"
        >
          Join the Anchor Club <ArrowRight size={14} />
        </Link>
      </div>
    </Section>
  );
}

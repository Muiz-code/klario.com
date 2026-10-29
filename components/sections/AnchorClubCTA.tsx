import Link from "next/link";
import { ArrowRight, Anchor } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { CoinMark } from "@/components/ui/CoinMark";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/**
 * The old Ambassador program is now the Anchor Club. This section replaces the
 * ambassador form with a short pitch and a button that sends people to the
 * dedicated /anchor-club flow.
 *
 * The pitch and the card sit side by side on large screens (stacked below
 * that), so the card fills the space beside the heading instead of floating
 * on its own row. Section only supplies the background and engraving here;
 * the heading block mirrors Section's bold stacked style.
 */
export function AnchorClubCTA() {
  return (
    <Section bold id="anchor-club" tone="dark">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <ScrollReveal className="flex flex-col gap-5 lg:max-w-2xl">
          <p className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-gold uppercase">
            <CoinMark className="w-4" />
            Klario Anchor Club
          </p>
          <h2 className="font-display text-balance text-[clamp(2.5rem,6vw,6.25rem)] leading-[0.92] font-bold tracking-[-0.045em] text-cream-gold uppercase">
            Build with us <span className="text-gold">· not for us.</span>
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-bg/65 md:text-[17px]">
            The Anchor Club is a hands-on community for people who want to actually build something. Get real product
            experience, mentorship, first access to the Klario beta, and merch — alongside a network of students and
            builders growing together.
          </p>
        </ScrollReveal>

        <div className="glass-card flex w-full shrink-0 flex-col items-center gap-6 rounded-3xl p-10 text-center md:p-14 lg:w-[30rem]">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-dim text-gold">
            <Anchor size={26} strokeWidth={1.75} />
          </span>
          <h3 className="font-display text-2xl text-cream-gold md:text-3xl">
            Join the founding cohort
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-bg/70">
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
      </div>
    </Section>
  );
}

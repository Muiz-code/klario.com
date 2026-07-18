"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { SITE, FOOTER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GuillocheRosette } from "@/components/ui/Engraving";
import emblem from "@/public/klario-sub-logo.png";

const socialIcons: Record<string, React.ReactNode> = {
  Twitter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  ),
  Instagram: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  Linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  ),
};

type FooterLink =
  | { label: string; href: string; action?: undefined }
  | { label: string; action: "beta"; href?: undefined };

type FooterColumnData = {
  title: string;
  links: readonly FooterLink[];
};

function FooterColumn({ col }: { col: FooterColumnData }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col border-b border-bg/10 md:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between gap-4 py-4 text-left md:pointer-events-none md:py-0 md:pb-4"
      >
        <h4 className="text-[13px] font-medium text-bg md:text-[11px] md:uppercase md:tracking-[0.18em] md:text-bg/45">
          {col.title}
        </h4>
        <ChevronDown
          size={18}
          className={cn(
            "text-bg/55 transition-transform md:hidden",
            open && "rotate-180"
          )}
        />
      </button>

      <div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              key="links"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 overflow-hidden pb-5 md:hidden"
            >
              {col.links.map((l) => (
                <li key={l.label}>
                  <FooterLinkItem link={l as FooterLink} />
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <ul className="hidden flex-col gap-2.5 md:flex">
          {col.links.map((l) => (
            <li key={l.label}>
              <FooterLinkItem link={l as FooterLink} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  const cls =
    "text-sm text-bg/70 transition-colors hover:text-gold";
  if (link.action === "beta") {
    return (
      <Link href="/beta" className={cls}>
        {link.label}
      </Link>
    );
  }
  return (
    <Link href={link.href} className={cls}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-ink text-bg">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-[radial-gradient(80%_70%_at_70%_40%,rgba(193,154,107,0.12),transparent_65%),radial-gradient(60%_60%_at_15%_30%,rgba(78,44,32,0.18),transparent_60%)]"
      />
      {/* Engine-turned guilloche rosette bleeding off the top-right corner. */}
      <GuillocheRosette className="pointer-events-none absolute right-[-6%] top-[-20%] z-0 h-[78%] w-auto opacity-[0.13]" />
      {/* Engraved medallion watermark - like the seal on a certificate. */}
      <Image
        src={emblem}
        alt=""
        aria-hidden
        className="emblem-watermark absolute -bottom-28 -right-24 h-auto w-[380px] opacity-[0.055] md:w-[560px]"
      />

      <section className="relative">
        <Container className="flex flex-col items-start gap-8 pt-20 pb-16 md:pt-32 md:pb-28">
          <h2 className="font-display max-w-4xl text-[2.5rem] leading-[1.02] tracking-tight md:text-[3.75rem] lg:text-[4.75rem]">
            <span className="block">{FOOTER.cta.heading}</span>
            <span className="block italic text-gold">{FOOTER.cta.emphasis}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/beta"
              className="inline-flex items-center gap-2 rounded-2xl bg-bg px-6 py-3.5 text-sm font-medium text-ink transition-all hover:scale-[1.02] hover:bg-bg/90 md:rounded-full"
            >
              {FOOTER.cta.primary}
              <ArrowRight size={14} />
            </Link>
            <a
              href={FOOTER.cta.secondaryHref}
              className="inline-flex items-center gap-2 rounded-2xl border border-bg/20 bg-bg/4 px-6 py-3.5 text-sm font-medium text-bg backdrop-blur-sm transition-all hover:border-bg/40 hover:bg-bg/10 md:rounded-full"
            >
              {FOOTER.cta.secondary}
              <ArrowRight size={14} />
            </a>
          </div>
        </Container>
      </section>

      <div className="relative mt-4 overflow-hidden rounded-t-[28px] border-t border-x border-bg/8 bg-[#0b0a0c]/85 backdrop-blur-xl md:mt-8 md:rounded-t-[36px]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(193,154,107,0.08),transparent_55%),radial-gradient(60%_60%_at_80%_20%,rgba(78,44,32,0.16),transparent_60%),radial-gradient(70%_50%_at_10%_70%,rgba(193,154,107,0.06),transparent_60%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-[18%] w-[260px] bg-linear-to-b from-bg/8 via-bg/3 to-transparent blur-3xl"
        />
        <Container className="relative flex flex-col gap-14 pt-10 pb-12">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-bg/10 pb-8 md:flex-row md:items-center md:pb-0 md:border-0">
            <div className="flex items-center gap-3">
              <Logo onDark />
              <span className="text-xs text-bg/45">
                Operated by{" "}
                <a
                  href={SITE.poweredBy.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-bg/65 transition-colors hover:text-gold"
                >
                  {SITE.poweredBy.brand}
                </a>
              </span>
            </div>
            <p className="text-xs text-bg/50">
              © {new Date().getFullYear()} {SITE.legalName}.{" "}
              <span className="font-mono">{SITE.poweredBy.rc}</span>
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_3fr]">
            <div className="flex flex-col gap-8">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-dim text-gold"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4z" />
                </svg>
              </span>
              <p className="max-w-xs text-sm leading-relaxed text-bg/60">
                {SITE.tagline} {SITE.subTagline}
              </p>

              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
                  {FOOTER.getStarted.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {FOOTER.getStarted.links.map((l) => (
                    <li key={l.label}>
                      <FooterLinkItem link={l as FooterLink} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
                  Stay in touch
                </h4>
                <div className="flex gap-2">
                  {FOOTER.social.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-bg/15 text-bg/70 transition-colors hover:border-gold hover:text-gold"
                    >
                      {socialIcons[s.icon]}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:grid md:gap-10 md:grid-cols-2 lg:grid-cols-5">
              {FOOTER.columns.map((col) => (
                <FooterColumn key={col.title} col={col} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-bg/10 pt-8">
            <h5 className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/55">
              {FOOTER.disclaimerLong.title}
            </h5>
            <div className="flex flex-col gap-3 text-[12px] leading-relaxed text-bg/55">
              {FOOTER.disclaimerLong.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-bg/10 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-[11px] text-bg/45">{FOOTER.disclaimer}</p>
            <p className="text-[11px] text-bg/45">
              <a
                href={`mailto:${SITE.poweredBy.email}`}
                className="transition-colors hover:text-gold"
              >
                {SITE.poweredBy.email}
              </a>
              {" · "}
              <a
                href={SITE.poweredBy.url}
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-gold"
              >
                www.raavon.com
              </a>
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

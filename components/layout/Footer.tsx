import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { SITE, FOOTER } from "@/lib/constants";

const socialIcons: Record<string, React.ReactNode> = {
  Twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  ),
  Instagram: (
    <svg
      width="16"
      height="16"
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  ),
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border-gold/60 bg-bg pt-16 pb-10">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />

      <Container className="flex flex-col gap-12">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-body/70">
              {SITE.tagline} {SITE.subTagline}
            </p>
            <p className="text-[11px] text-body/50">
              A {SITE.poweredBy.brand} venture —{" "}
              <a
                href={SITE.poweredBy.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-body/70 transition-colors hover:text-gold"
              >
                www.raavon.com
              </a>
            </p>
            <div className="flex gap-2">
              {FOOTER.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border-gold/60 text-body/70 transition-colors hover:border-gold hover:text-gold"
                >
                  {socialIcons[s.icon]}
                </a>
              ))}
            </div>
          </div>

          {FOOTER.columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-body/70 transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border-gold/40 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-body/65">
            © {new Date().getFullYear()} {SITE.legalName}. Powered by{" "}
            <a
              href={SITE.poweredBy.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-body/85 transition-colors hover:text-gold"
            >
              {SITE.poweredBy.brand}
            </a>
            {" — "}
            <span className="font-mono">{SITE.poweredBy.rc}</span>. All rights
            reserved.
          </p>
          <p className="text-xs text-body/55">{FOOTER.disclaimer}</p>
        </div>
      </Container>
    </footer>
  );
}

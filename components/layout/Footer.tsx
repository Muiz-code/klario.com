import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border-gold/60 bg-bg py-10">
      <Container className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <p className="text-xs tracking-[0.18em] text-body/55 uppercase">
          {SITE.name} is powered by{" "}
          <span className="text-ink/85">{SITE.poweredBy.brand}</span>
          <span className="mx-1.5 text-ink/30">·</span>
          <span className="font-mono text-ink/70">{SITE.poweredBy.rc}</span>
        </p>
        <p className="text-xs text-body/55">
          © {new Date().getFullYear()} {SITE.name} Financial Technology.
        </p>
      </Container>
    </footer>
  );
}

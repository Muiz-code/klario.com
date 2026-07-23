"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { useScrolled } from "@/hooks/useScrolled";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

// Section ids the in-page anchor links point at, for scroll-spy on the home page.
const SPY_IDS = NAV_LINKS.filter((l) => l.href.includes("#")).map(
  (l) => l.href.split("#")[1]
);

export function Navbar({ theme = "auto" }: { theme?: "auto" | "light" }) {
  const pathname = usePathname();
  const scrolled = useScrolled(80);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const isLight = theme === "light" || scrolled;
  const onDark = !isLight && !open;

  // Scroll-spy: on the home page, mark the anchor link whose section is in view.
  // Other pages have no such sections, so this stays inert there.
  useEffect(() => {
    // Home only: other pages have no anchor sections, and isActive() gates hash
    // links on pathname === "/", so a stale activeSection can't highlight there.
    if (pathname !== "/") return;
    const sections = SPY_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.includes("#")) {
      return pathname === "/" && activeSection === href.split("#")[1];
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkClass = (active: boolean) =>
    cn(
      "relative text-sm transition-colors hover:text-gold",
      active
        ? "text-gold after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-gold/70"
        : isLight
          ? "text-ink/70"
          : "text-bg/75"
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isLight ? "bg-bg/95 border-b border-border-gold" : "bg-transparent"
        )}
      >
        <div className="hidden h-16 items-center px-8 md:grid md:grid-cols-[1fr_auto_1fr] lg:px-12">
          <nav className="flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={linkClass(isActive(l.href))}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <Logo onDark={onDark} />

          <div className="flex items-center justify-end gap-3">
            <Button
              href="/anchor-club"
              size="md"
              variant="outline"
              className={cn(
                "hidden lg:inline-flex",
                onDark && "border-bg/25 text-bg hover:border-bg hover:bg-bg/10"
              )}
            >
              Join Anchor Club
            </Button>
            <Button href="/beta" size="md">
              Get Started
            </Button>
          </div>
        </div>

        <div className="flex h-16 items-center justify-between px-6 md:hidden">
          <Logo onDark={onDark} />
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn(
              "relative z-60 transition-colors hover:text-gold",
              isLight || open ? "text-ink/80" : "text-bg/85"
            )}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-bg md:hidden"
          >
            <nav className="flex flex-col items-center gap-2">
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.45, ease }}
                  className={cn(
                    "font-display py-3 text-4xl transition-colors hover:text-gold",
                    isActive(l.href) ? "text-gold" : "text-ink"
                  )}
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + NAV_LINKS.length * 0.07, duration: 0.45, ease }}
              className="mt-6 flex flex-col items-center gap-3"
            >
              <Button href="/beta" size="lg" onClick={() => setOpen(false)}>
                Get Started
              </Button>
              <Button
                href="/anchor-club"
                size="lg"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Join Anchor Club
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

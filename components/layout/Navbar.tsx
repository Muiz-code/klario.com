"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { useScrolled } from "@/hooks/useScrolled";
import { NAV_LINKS } from "@/lib/constants";
import { openBetaModal } from "@/components/ui/BetaModal";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Navbar({ theme = "auto" }: { theme?: "auto" | "light" }) {
  const scrolled = useScrolled(80);
  const [open, setOpen] = useState(false);
  const isLight = theme === "light" || scrolled;
  const onDark = !isLight && !open;

  const linkClass = cn(
    "text-sm transition-colors hover:text-gold",
    isLight ? "text-ink/70" : "text-bg/75"
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
              <a key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </a>
            ))}
          </nav>

          <Logo onDark={onDark} />

          <div className="flex justify-end">
            <Button onClick={openBetaModal} size="md">
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
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.45, ease }}
                  className="font-display py-3 text-4xl text-ink transition-colors hover:text-gold"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + NAV_LINKS.length * 0.07, duration: 0.45, ease }}
              className="mt-6"
            >
              <Button
                size="lg"
                onClick={() => {
                  setOpen(false);
                  openBetaModal();
                }}
              >
                Get Started
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

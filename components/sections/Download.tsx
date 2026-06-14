"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DOWNLOAD } from "@/lib/constants";
import { openBetaModal } from "@/components/ui/BetaModal";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Download() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state === "submitting") return;
    setState("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Subscription failed");
      setState("done");
    } catch {
      setState("idle");
    }
  };

  return (
    <section
      id="download"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" }}
      className="relative isolate overflow-hidden bg-ink py-24 text-bg md:py-32"
    >
      <span
        aria-hidden
        className="font-display pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[28vw] leading-none tracking-tighter text-bg/3 uppercase"
      >
        Klario
      </span>

      <Container className="relative z-10 flex flex-col items-center gap-8 px-4 text-center md:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease }}
          className="font-display text-[1.65rem] leading-[1.1] capitalize sm:text-4xl md:text-5xl lg:text-[4.5rem]"
        >
          <span className="block whitespace-nowrap">{DOWNLOAD.heading}</span>
          <span className="block whitespace-nowrap italic text-gold">
            {DOWNLOAD.emphasis}
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="max-w-[520px] text-base leading-relaxed text-bg/65 md:text-[17px]"
        >
          {DOWNLOAD.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="flex w-full max-w-sm items-center justify-center gap-2 sm:w-auto sm:max-w-none sm:gap-3"
        >
          <button
            type="button"
            onClick={openBetaModal}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-all hover:scale-[1.02] hover:shadow-[0_12px_40px_-8px_rgba(212,168,83,0.55)]"
          >
            <Sparkles size={15} />
            Join the beta
          </button>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
          className="flex w-full max-w-md flex-col items-center gap-2"
        >
          <div className="flex w-full items-center rounded-full border border-bg/15 bg-bg/4 p-1 focus-within:border-gold/60">
            <input
              type="email"
              value={email}
              required
              disabled={state !== "idle"}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={DOWNLOAD.waitlistPlaceholder}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-bg placeholder:text-bg/40 focus:outline-none disabled:opacity-50 sm:px-4"
              aria-label="Email"
            />
            <button
              type="submit"
              disabled={state !== "idle"}
              aria-label={DOWNLOAD.waitlistCta}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-sm font-medium text-ink transition-all sm:px-5",
                "hover:scale-[1.02] disabled:opacity-70"
              )}
            >
              <span className="hidden sm:inline">
                {state === "done" ? "Thanks." : state === "submitting" ? "..." : DOWNLOAD.waitlistCta}
              </span>
              {state === "idle" && <ArrowRight size={14} />}
            </button>
          </div>
          <p className="text-[11px] text-bg/45">
            {state === "done" ? "You're on the list. We'll keep you posted." : DOWNLOAD.waitlistDisclaimer}
          </p>
        </motion.form>
      </Container>
    </section>
  );
}

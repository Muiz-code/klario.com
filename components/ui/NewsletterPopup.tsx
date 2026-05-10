"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { NEWSLETTER } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

type Submit = "idle" | "submitting" | "done";

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<Submit>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(NEWSLETTER.storageKey)) return;

    const t = window.setTimeout(() => setOpen(true), NEWSLETTER.delayMs);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = prev;
      };
    }
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NEWSLETTER.storageKey, String(Date.now()));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state === "submitting") return;
    setState("submitting");
    if (process.env.NODE_ENV !== "production") {
      console.log("[Newsletter subscribe]", email);
    }
    await new Promise((r) => setTimeout(r, 700));
    setState("done");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NEWSLETTER.storageKey, "subscribed");
    }
    window.setTimeout(() => setOpen(false), 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
            className="fixed inset-0 z-90 bg-ink/55"
            aria-hidden
          />

          <motion.div
            key="popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.4, ease }}
            className="fixed left-1/2 top-1/2 z-100 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-bg/15 bg-ink p-7 text-bg shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] md:p-8"
          >
            <span
              aria-hidden
              className="font-display pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[42vw] leading-none tracking-tighter text-bg/4 uppercase md:text-[18rem]"
            >
              Klario
            </span>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-bg/60 transition-colors hover:bg-bg/10 hover:text-bg"
            >
              <X size={16} />
            </button>

            <AnimatePresence mode="wait">
              {state === "done" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease }}
                  className="relative z-10 flex flex-col items-center gap-3 py-4 text-center"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-dim text-gold">
                    <CheckCircle2 size={24} strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display text-xl text-bg">
                    {NEWSLETTER.successTitle}
                  </h3>
                  <p className="text-sm text-bg/65">
                    {NEWSLETTER.successBody}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col gap-5"
                >
                  <span className="inline-flex items-center gap-2 self-start rounded-full bg-gold-dim px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gold">
                    <Sparkles size={11} />
                    {NEWSLETTER.eyebrow}
                  </span>

                  <h3
                    id="newsletter-title"
                    className="font-display text-2xl leading-[1.1] text-bg md:text-3xl"
                  >
                    {NEWSLETTER.heading}
                  </h3>

                  <p className="text-sm leading-relaxed text-bg/70">
                    {NEWSLETTER.body}
                  </p>

                  <form onSubmit={onSubmit} className="flex flex-col gap-2">
                    <div className="flex w-full overflow-hidden rounded-full border border-bg/15 bg-bg/4 p-1 focus-within:border-gold/60">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={NEWSLETTER.placeholder}
                        disabled={state !== "idle"}
                        className="flex-1 bg-transparent px-4 py-2 text-sm text-bg placeholder:text-bg/40 focus:outline-none disabled:opacity-50"
                        aria-label="Email"
                      />
                      <button
                        type="submit"
                        disabled={state !== "idle"}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full bg-gold px-5 text-sm font-medium text-ink transition-all",
                          "hover:scale-[1.02] disabled:opacity-70"
                        )}
                      >
                        {state === "submitting" ? "..." : NEWSLETTER.cta}
                        {state === "idle" && <ArrowRight size={14} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="self-center text-[11px] text-bg/45 hover:text-bg/70"
                    >
                      Maybe later
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

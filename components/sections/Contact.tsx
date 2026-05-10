"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { CONTACT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const inputCls =
  "w-full rounded-xl border border-border-gold/60 bg-bg px-4 py-3 text-sm text-ink placeholder:text-body/40 transition-colors focus:border-gold focus:outline-none";

const labelCls = "text-xs font-medium uppercase tracking-[0.14em] text-body/65";

type Submit = "idle" | "submitting" | "done";
type Topic = (typeof CONTACT.topics)[number];

export function Contact() {
  const [topic, setTopic] = useState<Topic>("General");
  const [state, setState] = useState<Submit>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    if (process.env.NODE_ENV !== "production") {
      console.log("[Contact message]", { topic, ...form });
    }
    await new Promise((r) => setTimeout(r, 700));
    setState("done");
  };

  return (
    <Section
      id="contact"
      label={CONTACT.label}
      heading={CONTACT.heading}
      emphasis={CONTACT.emphasis}
      intro={CONTACT.intro}
    >
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <a
            href={`mailto:${CONTACT.email}`}
            className="group flex items-center gap-4 rounded-2xl border border-border-gold/60 bg-card/50 p-5 transition-colors hover:border-gold"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-dim text-gold">
              <Mail size={18} strokeWidth={1.75} />
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.14em] text-body/55">
                Or email us directly
              </span>
              <span className="font-mono text-sm text-ink transition-colors group-hover:text-gold">
                {CONTACT.email}
              </span>
            </div>
          </a>
          <p className="text-sm leading-relaxed text-body/65">
            For ambassador applications, use the{" "}
            <a href="#ambassadors" className="text-gold hover:underline">
              ambassador form
            </a>
            . For everything else, this is the place.
          </p>
        </div>

        <div className="rounded-3xl border border-border-gold bg-bg p-7 shadow-[0_24px_60px_-30px_rgba(13,13,14,0.18)] md:p-8">
          <AnimatePresence mode="wait">
            {state === "done" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease }}
                className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim text-gold">
                  <CheckCircle2 size={28} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-2xl text-ink">
                  {CONTACT.successTitle}
                </h3>
                <p className="max-w-sm text-sm text-body/70">
                  {CONTACT.successBody}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={onSubmit}
                className="flex flex-col gap-5"
              >
                <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
                  <legend className={cn(labelCls, "float-left mb-0 p-0")}>
                    This is about
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT.topics.map((t) => {
                      const active = topic === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          aria-pressed={active}
                          className={cn(
                            "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                            active
                              ? "border-gold bg-gold-dim text-ink"
                              : "border-border-gold/60 text-body/70 hover:border-gold hover:text-ink"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Name</span>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Daneil Abdulrauf"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Email</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Message</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="What's on your mind?"
                    className={cn(inputCls, "resize-none")}
                  />
                </label>

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-all",
                    "hover:scale-[1.01] hover:shadow-[0_12px_40px_-8px_rgba(212,168,83,0.55)]",
                    "disabled:opacity-70 disabled:hover:scale-100"
                  )}
                >
                  {state === "submitting" ? "Sending..." : "Send message"}
                  {state === "idle" && <ArrowRight size={14} />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

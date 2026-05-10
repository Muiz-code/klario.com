"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Gift,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { AMBASSADORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const perkIcons: Record<string, LucideIcon> = {
  Wallet,
  Gift,
  GraduationCap,
  MessageSquare,
};

type Role = "student" | "staff";
type Submit = "idle" | "submitting" | "done";

const inputCls =
  "w-full rounded-xl border border-border-gold/60 bg-bg px-4 py-3 text-sm text-ink placeholder:text-body/40 transition-colors focus:border-gold focus:outline-none";

const labelCls = "text-xs font-medium uppercase tracking-[0.14em] text-body/65";

export function Ambassadors() {
  const [role, setRole] = useState<Role>("student");
  const [state, setState] = useState<Submit>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    why: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    const payload = { role, ...form };
    if (process.env.NODE_ENV !== "production") {
      console.log("[Ambassadors application]", payload);
    }
    await new Promise((r) => setTimeout(r, 800));
    setState("done");
  };

  return (
    <Section
      id="ambassadors"
      label={AMBASSADORS.label}
      heading={AMBASSADORS.heading}
      emphasis={AMBASSADORS.emphasis}
      intro={AMBASSADORS.intro}
      className="bg-surface"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {AMBASSADORS.perks.map((p) => {
            const Icon = perkIcons[p.icon];
            return (
              <li
                key={p.title}
                className="flex flex-col gap-3 rounded-2xl border border-border-gold/60 bg-bg p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-dim text-gold">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-base text-ink">{p.title}</h3>
                <p className="text-[13px] leading-relaxed text-body/70">{p.body}</p>
              </li>
            );
          })}
        </ul>

        <div className="rounded-3xl border border-border-gold bg-bg p-7 shadow-[0_24px_60px_-30px_rgba(13,13,14,0.18)] md:p-8">
          <AnimatePresence mode="wait">
            {state === "done" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease }}
                className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim text-gold">
                  <CheckCircle2 size={28} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-2xl text-ink">
                  {AMBASSADORS.form.successTitle}
                </h3>
                <p className="max-w-sm text-sm text-body/70">
                  {AMBASSADORS.form.successBody}
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
                <div>
                  <h3 className="font-display text-xl text-ink md:text-2xl">
                    {AMBASSADORS.form.title}
                  </h3>
                  <p className="mt-1 text-sm text-body/65">
                    {AMBASSADORS.form.note}
                  </p>
                </div>

                <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                  <legend className={cn(labelCls, "float-left mb-0 p-0")}>
                    I am a
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(["student", "staff"] as Role[]).map((r) => {
                      const active = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          aria-pressed={active}
                          className={cn(
                            "rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-colors",
                            active
                              ? "border-gold bg-gold-dim text-ink"
                              : "border-border-gold/60 text-body/70 hover:border-gold hover:text-ink"
                          )}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Tomiwa Owolabi"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone (optional)">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="+234 ..."
                      className={inputCls}
                    />
                  </Field>
                  <Field
                    label={role === "student" ? "School" : "Workplace"}
                  >
                    <input
                      required
                      type="text"
                      value={form.institution}
                      onChange={update("institution")}
                      placeholder={
                        role === "student"
                          ? "University of Lagos"
                          : "Company name"
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Why you'd be a great ambassador">
                  <textarea
                    required
                    rows={4}
                    value={form.why}
                    onChange={update("why")}
                    placeholder="Tell us about your community and how you'd help people get clarity on their money."
                    className={cn(inputCls, "resize-none")}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-all",
                    "hover:scale-[1.01] hover:shadow-[0_12px_40px_-8px_rgba(212,168,83,0.55)]",
                    "disabled:opacity-70 disabled:hover:scale-100"
                  )}
                >
                  {state === "submitting" ? "Submitting..." : "Submit application"}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

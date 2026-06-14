"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  CircleCheck,
} from "lucide-react";
import { BETA } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export const BETA_MODAL_EVENT = "klario:open-beta";

export function openBetaModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BETA_MODAL_EVENT));
  }
}

type Submit = "idle" | "submitting" | "done";
type Device = (typeof BETA.devices)[number];

const inputCls =
  "w-full rounded-xl border border-bg/15 bg-bg/4 px-4 py-3 text-sm text-bg placeholder:text-bg/40 transition-colors focus:border-gold/60 focus:outline-none";

const labelCls =
  "text-[11px] font-medium uppercase tracking-[0.16em] text-bg/55";

export function BetaModal() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<Submit>("idle");
  const [device, setDevice] = useState<Device>("iOS");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [banks, setBanks] = useState<string[]>([]);
  const [bankQuery, setBankQuery] = useState("");

  useEffect(() => {
    const handler = () => {
      setState("idle");
      setOpen(true);
    };
    window.addEventListener(BETA_MODAL_EVENT, handler);
    return () => window.removeEventListener(BETA_MODAL_EVENT, handler);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const update = useCallback(
    (k: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((p) => ({ ...p, [k]: e.target.value })),
    []
  );

  const close = () => setOpen(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, device, banks }),
      });
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(error || "Submission failed");
      }
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("idle");
    }
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
            onClick={close}
            className="fixed inset-0 z-90 bg-ink/65 backdrop-blur-sm"
            aria-hidden
          />

          <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto p-4">
            <motion.div
              key="dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="beta-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.4, ease }}
              className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-bg/15 bg-ink text-bg shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)]"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full text-bg/65 transition-colors hover:bg-bg/10 hover:text-bg"
              >
                <X size={16} />
              </button>

              <AnimatePresence mode="wait">
                {state === "done" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, ease }}
                    className="flex flex-col items-center gap-4 p-10 text-center md:p-14"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim text-gold">
                      <CheckCircle2 size={28} strokeWidth={1.75} />
                    </span>
                    <h3 className="font-display text-2xl text-bg md:text-3xl">
                      {BETA.successTitle}
                    </h3>
                    <p className="max-w-md text-sm leading-relaxed text-bg/70">
                      {BETA.successBody}
                    </p>
                    <p className="max-w-md text-xs text-bg/45">
                      {BETA.successHint}
                    </p>
                    <button
                      type="button"
                      onClick={close}
                      className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink transition-all hover:scale-[1.02]"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid gap-0 md:grid-cols-[1fr_1.15fr]"
                  >
                    <aside className="relative hidden flex-col gap-6 border-r border-bg/10 bg-bg/2 p-8 md:flex">
                      <span className="inline-flex items-center gap-2 self-start rounded-full bg-gold-dim px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gold">
                        <Sparkles size={11} />
                        {BETA.eyebrow}
                      </span>
                      <h3
                        id="beta-title"
                        className="font-display text-3xl leading-[1.1] text-bg"
                      >
                        {BETA.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-bg/65">
                        {BETA.intro}
                      </p>
                      <ul className="mt-2 flex flex-col gap-4">
                        {BETA.steps.map((s, i) => (
                          <li key={s.title} className="flex gap-3">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-dim text-[11px] font-medium text-gold">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-[13px] font-medium text-bg">
                                {s.title}
                              </p>
                              <p className="text-[12px] leading-relaxed text-bg/60">
                                {s.body}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </aside>

                    <div className="p-6 md:p-8">
                      <div className="mb-5 flex flex-col gap-2 md:hidden">
                        <span className="inline-flex items-center gap-2 self-start rounded-full bg-gold-dim px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gold">
                          <Sparkles size={11} />
                          {BETA.eyebrow}
                        </span>
                        <h3
                          id="beta-title-mobile"
                          className="font-display text-2xl leading-[1.1] text-bg"
                        >
                          {BETA.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-bg/65">
                          {BETA.intro}
                        </p>
                      </div>

                      <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <Field label={BETA.fields.name.label}>
                          <input
                            required
                            type="text"
                            value={form.name}
                            onChange={update("name")}
                            placeholder={BETA.fields.name.placeholder}
                            className={inputCls}
                          />
                        </Field>
                        <Field label={BETA.fields.email.label}>
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={update("email")}
                            placeholder={BETA.fields.email.placeholder}
                            className={inputCls}
                          />
                        </Field>
                        <Field label={BETA.fields.phone.label}>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={update("phone")}
                            placeholder={BETA.fields.phone.placeholder}
                            className={inputCls}
                          />
                        </Field>

                        <BankPicker
                          selected={banks}
                          onChange={setBanks}
                          query={bankQuery}
                          onQueryChange={setBankQuery}
                        />

                        <div className="flex flex-col gap-2">
                          <span className={labelCls}>
                            {BETA.fields.device.label}
                          </span>
                          <div
                            role="radiogroup"
                            aria-label="Device"
                            className="grid grid-cols-3 gap-2"
                          >
                            {BETA.devices.map((d) => {
                              const active = device === d;
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => setDevice(d)}
                                  aria-pressed={active}
                                  className={cn(
                                    "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors",
                                    active
                                      ? "border-gold bg-gold-dim text-bg"
                                      : "border-bg/15 text-bg/70 hover:border-gold/60 hover:text-bg"
                                  )}
                                >
                                  {active && <CircleCheck size={13} />}
                                  {d}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={state === "submitting"}
                          className={cn(
                            "mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-all",
                            "hover:scale-[1.01] hover:shadow-[0_12px_40px_-8px_rgba(212,168,83,0.55)]",
                            "disabled:opacity-70 disabled:hover:scale-100"
                          )}
                        >
                          {state === "submitting"
                            ? "Submitting..."
                            : BETA.cta}
                          {state === "idle" && <ArrowRight size={14} />}
                        </button>
                        <p className="text-[11px] leading-relaxed text-bg/45">
                          {BETA.note}
                        </p>
                        {errorMsg && (
                          <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[12px] leading-relaxed text-red-200">
                            {errorMsg}
                          </p>
                        )}
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
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

function BankPicker({
  selected,
  onChange,
  query,
  onQueryChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? BETA.banks.filter((b) => b.toLowerCase().includes(needle))
    : BETA.banks;

  const toggle = (bank: string) => {
    if (selected.includes(bank)) {
      onChange(selected.filter((b) => b !== bank));
    } else {
      onChange([...selected, bank]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className={labelCls}>{BETA.fields.bank.label}</span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] uppercase tracking-[0.14em] text-bg/45 hover:text-bg"
          >
            Clear ({selected.length})
          </button>
        )}
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={BETA.fields.bank.placeholder}
        className={inputCls}
        aria-label="Search banks"
      />

      <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-bg/10 bg-bg/2 p-2.5">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-[12px] text-bg/45">
            {BETA.fields.bank.empty}
          </p>
        ) : (
          filtered.map((bank) => {
            const active = selected.includes(bank);
            return (
              <button
                key={bank}
                type="button"
                onClick={() => toggle(bank)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                  active
                    ? "border-gold bg-gold-dim text-bg"
                    : "border-bg/15 text-bg/70 hover:border-gold/60 hover:text-bg"
                )}
              >
                {active && <CircleCheck size={12} />}
                {bank}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

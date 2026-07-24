"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageTexture, cardSVGMarkup } from "./engraving";
import { NIGERIAN_INSTITUTIONS, STUDY_LEVELS } from "./institutions";
import styles from "./anchor.module.css";

const SUB_LOGO = "/klario-submark.png";
// Once someone registers, we keep their card locally so a reload shows it again
// (instead of the empty form) and they can't re-register from this browser.
const STORAGE_KEY = "klario_anchor_registration";

// ── Question data ──
const AREAS = [
  "Artificial Intelligence prompting",
  "UI/UX Design",
  "Software Engineering",
  "Product Management",
  "Digital Marketing",
  "Finance & Investing",
];
const EXCITES = [
  "Learning practical skills",
  "Building my portfolio",
  "Networking with other students",
  "Working on a real startup",
  "Leadership opportunities",
  "Financial education",
  "Career development",
  "Helping shape Klario",
];
const CHALLENGES = [
  "Getting internships",
  "Learning practical skills",
  "Building a portfolio",
  "Networking",
  "Managing my finances",
  "Finding mentors",
  "Staying consistent",
];
const GUIDELINES_URL = "/anchor-club-guidelines";
const OTHER = "__other__";
const TOTAL = 7; // numbered questions; 0 = hero, 8 = card
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type State = {
  area: string | null;
  areaOther: string;
  name: string;
  email: string;
  whatsapp: string;
  institution: string;
  level: string;
  why: string;
  excites: string[];
  challenge: string | null;
  challengeOther: string;
  showUp: boolean;
  guidelines: boolean;
};

const EMPTY: State = {
  area: null,
  areaOther: "",
  name: "",
  email: "",
  whatsapp: "",
  institution: "",
  level: "",
  why: "",
  excites: [],
  challenge: null,
  challengeOther: "",
  showUp: false,
  guidelines: false,
};

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6 9 17l-5-5"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Arrow = () => (
  <svg
    className={styles.arrow}
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// A hand-drawn underline that scales with the word (two slightly-offset marker
// strokes; non-scaling-stroke keeps the line weight even when stretched).
const FreehandUnderline = () => (
  <svg
    className={styles.underline}
    viewBox="0 0 240 16"
    preserveAspectRatio="none"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 10.5 C 46 4.5, 78 12.5, 118 8 C 156 4, 190 12, 236 6.5"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M8 13 C 52 8.5, 86 14.5, 126 10.5 C 162 7, 198 13.5, 232 9.5"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      opacity={0.55}
    />
  </svg>
);

export function AnchorWizard() {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<State>(EMPTY);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [alreadyFilled, setAlreadyFilled] = useState(false);
  const [played, setPlayed] = useState(false);
  const [booted, setBooted] = useState(false);
  const reducedRef = useRef(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // Restore a prior registration (if any) so reloads land on the card, not the
  // form — this is also what stops a second registration from this browser.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.ref) {
          setRef(saved.ref);
          setAlreadyFilled(!!saved.alreadyFilled);
          setS((p) => ({
            ...p,
            name: saved.name || "",
            area: saved.area || "",
            institution: saved.institution || "",
            level: saved.level || "",
            email: saved.email || "",
          }));
          setStep(8);
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setBooted(true);
  }, []);

  const announce = (msg: string) => {
    if (liveRef.current) liveRef.current.textContent = msg;
  };

  const validate = useCallback(
    (n: number): string => {
      switch (n) {
        case 1:
          return s.area === OTHER
            ? s.areaOther.trim()
              ? ""
              : "Type the area you want to grow in."
            : s.area
              ? ""
              : "Pick one to continue.";
        case 2:
          if (s.name.trim().length < 2) return "Please enter your full name.";
          if (!EMAIL_RE.test(s.email.trim()))
            return "That email doesn't look right yet.";
          if (s.whatsapp.replace(/\D/g, "").length < 7)
            return "Add a WhatsApp number we can reach you on.";
          return "";
        case 3:
          if (s.institution.trim().length < 2) return "Where do you study?";
          if (s.level.trim().length < 1) return "Add your level of study.";
          return "";
        case 4:
          return s.why.trim().length < 3 ? "A sentence or two is plenty." : "";
        case 5:
          return s.excites.length ? "" : "Choose at least one.";
        case 6:
          return s.challenge === OTHER
            ? s.challengeOther.trim()
              ? ""
              : "Tell us the challenge."
            : s.challenge
              ? ""
              : "Pick the closest one.";
        case 7:
          return s.showUp && s.guidelines
            ? ""
            : "Tick both to send your application.";
        default:
          return "";
      }
    },
    [s]
  );

  // Move to a step without validating. Used by auto-advance (picking a concrete
  // option is inherently valid) and by validated navigation once checks pass.
  const advanceTo = useCallback((next: number) => {
    setErr("");
    const target = Math.max(0, Math.min(next, 8));
    setStep(target);
    window.scrollTo({
      top: 0,
      behavior: reducedRef.current ? "auto" : "smooth",
    });
    if (target >= 1 && target <= TOTAL) announce(`Step ${target} of ${TOTAL}`);
  }, []);

  const go = useCallback(
    (next: number) => {
      if (next > step && step >= 1 && step <= TOTAL) {
        const e = validate(step);
        if (e) {
          setErr(e);
          announce(e);
          return;
        }
      }
      advanceTo(next);
    },
    [step, validate, advanceTo]
  );

  const submit = useCallback(async () => {
    const e = validate(7);
    if (e) {
      setErr(e);
      announce(e);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setErr("");
    try {
      const res = await fetch("/api/anchor-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name,
          email: s.email,
          phone: s.whatsapp,
          institution: s.institution,
          level: s.level,
          area: s.area === OTHER ? null : s.area,
          why: s.why,
          excites: s.excites,
          challenge: s.challenge === OTHER ? null : s.challenge,
          notes: {
            ...(s.area === OTHER ? { area: s.areaOther } : {}),
            ...(s.challenge === OTHER ? { challenge: s.challengeOther } : {}),
          },
          pledge: s.showUp,
          guidelines: s.guidelines,
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Something went wrong. Please try again.");
        return;
      }
      if (data.alreadyFilled) setAlreadyFilled(true);
      setRef(data.ref as string);
      // Persist so a reload shows the card and blocks a repeat registration.
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ref: data.ref,
            name: s.name,
            area: s.area === OTHER ? s.areaOther : s.area || "",
            institution: s.institution,
            level: s.level,
            email: s.email,
            alreadyFilled: !!data.alreadyFilled,
          })
        );
      } catch {
        /* storage may be unavailable; not fatal */
      }
      setStep(8);
      window.scrollTo({ top: 0, behavior: "auto" });
      announce("Your Anchor Club card is ready.");
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [s, submitting, validate]);

  // Keyboard: Enter to advance, Shift+Enter to go back (textarea keeps newline).
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const target = ev.target as HTMLElement;
      if (target.tagName === "TEXTAREA" && ev.key === "Enter" && !ev.shiftKey)
        return;
      if (ev.key !== "Enter") return;
      if (step === 0) {
        ev.preventDefault();
        go(1);
      } else if (step >= 1 && step <= TOTAL) {
        ev.preventDefault();
        if (ev.shiftKey) go(step - 1);
        else if (step === TOTAL) submit();
        else go(step + 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, go, submit]);

  // Autofocus the first text field on entering a text step.
  useEffect(() => {
    if (step === 2 || step === 3 || step === 4) {
      const t = setTimeout(() => {
        document
          .querySelector<HTMLElement>(`.${styles.step} input, .${styles.step} textarea`)
          ?.focus();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Trigger the card assemble + sweep once, on the next frame after mount.
  useEffect(() => {
    if (step !== 8) {
      setPlayed(false);
      return;
    }
    if (reducedRef.current) {
      setPlayed(true);
      return;
    }
    const r = requestAnimationFrame(() => setPlayed(true));
    return () => cancelAnimationFrame(r);
  }, [step]);

  const progressPct =
    step >= 1 && step <= TOTAL ? (step / TOTAL) * 100 : step > TOTAL ? 100 : 0;

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setS((p) => ({ ...p, [key]: value }));

  const pickSingle = (
    key: "area" | "challenge",
    value: string,
    nextStep: number
  ) => {
    set(key, value);
    setErr("");
    if (value === OTHER) {
      setTimeout(() => {
        document
          .querySelector<HTMLInputElement>(`.${styles.otherwrap} input`)
          ?.focus();
      }, 30);
    } else {
      setTimeout(() => advanceTo(nextStep), 180);
    }
  };

  const toggleExcite = (value: string) => {
    setErr("");
    setS((p) => ({
      ...p,
      excites: p.excites.includes(value)
        ? p.excites.filter((x) => x !== value)
        : [...p.excites, value],
    }));
  };

  // Hold the first paint until we've checked storage, so a returning applicant
  // doesn't flash the empty hero before their card appears.
  if (!booted) return <div className={styles.root} />;

  return (
    <div className={styles.root}>
      <div
        className={styles.progress}
        style={{ width: `${progressPct}%` }}
        role="progressbar"
        aria-label="Application progress"
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={Math.min(step, TOTAL)}
      />
      <PageTexture />
      <div className={styles.wrap}>
        <div aria-live="polite">
          {step === 0 && <Hero onStart={() => go(1)} />}
          {step >= 1 && step <= TOTAL && (
            <StepShell
              step={step}
              err={err}
              submitting={submitting}
              onBack={() => go(step - 1)}
              onNext={() => (step === TOTAL ? submit() : go(step + 1))}
            >
              {renderStep()}
            </StepShell>
          )}
          {step === 8 && (
            <CardScreen
              name={s.name}
              area={s.area === OTHER ? s.areaOther : s.area || ""}
              institution={s.institution}
              level={s.level}
              refCode={ref}
              alreadyFilled={alreadyFilled}
              played={played}
            />
          )}
        </div>
        <p className={styles.visuallyHidden} aria-live="assertive" ref={liveRef} />
      </div>
    </div>
  );

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className={styles.display}>Which area do you want to grow in?</h2>
            <SingleOpts
              list={AREAS}
              selected={s.area}
              onPick={(v) => pickSingle("area", v, 2)}
              name="Area"
            />
            {s.area === OTHER && (
              <div className={styles.otherwrap}>
                <input
                  className={styles.txt}
                  placeholder="Name the area"
                  value={s.areaOther}
                  onChange={(e) => set("areaOther", e.target.value)}
                  aria-label="Other area"
                />
              </div>
            )}
          </>
        );
      case 2:
        return (
          <>
            <h2 className={styles.display}>Your details</h2>
            <div className={styles.qgap}>
              <Field label="Full name">
                <input
                  className={styles.txt}
                  autoComplete="name"
                  placeholder="Ada Okoro"
                  value={s.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </Field>
              <Field label="Email address">
                <input
                  className={styles.txt}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={s.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="WhatsApp number" tight>
                <input
                  className={styles.txt}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+234 ..."
                  value={s.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                />
              </Field>
              <div className={styles.subnote}>
                We use WhatsApp for the cohort group. Nothing else.
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className={styles.display}>Where do you study?</h2>
            <div className={styles.qgap}>
              <Field label="Institution">
                <Combobox
                  value={s.institution}
                  onChange={(v) => set("institution", v)}
                  options={NIGERIAN_INSTITUTIONS}
                  placeholder="Search your school…"
                  ariaLabel="Institution"
                />
              </Field>
              <Field label="Level of study">
                <Dropdown
                  value={s.level}
                  onChange={(v) => set("level", v)}
                  options={STUDY_LEVELS}
                  placeholder="Select your level"
                  ariaLabel="Level of study"
                />
              </Field>
            </div>
          </>
        );
      case 4: {
        const n = s.why.length;
        return (
          <>
            <h2 className={styles.display}>
              Why do you want to join the Anchor Club?
            </h2>
            <div className={styles.hint}>
              Plain and honest beats polished. There&apos;s no wrong answer here.
            </div>
            <div className={styles.qgap}>
              <textarea
                className={styles.txt}
                placeholder="What are you hoping to get out of this?"
                value={s.why}
                onChange={(e) => set("why", e.target.value)}
              />
              <div className={cx(styles.counter, n > 500 && styles.counterOver)}>
                {n} / 500
              </div>
            </div>
          </>
        );
      }
      case 5:
        return (
          <>
            <h2 className={styles.display}>What excites you about joining?</h2>
            <div className={styles.hint}>Choose all that apply — pick as many as you like.</div>
            <div
              className={cx(styles.opts, styles.qgap)}
              role="group"
              aria-label="What excites you"
            >
              {EXCITES.map((o) => {
                const on = s.excites.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    className={cx(styles.opt, on && styles.optOn)}
                    onClick={() => toggleExcite(o)}
                  >
                    <span className={styles.box}>
                      <Check />
                    </span>
                    <span>{o}</span>
                  </button>
                );
              })}
            </div>
          </>
        );
      case 6:
        return (
          <>
            <h2 className={styles.display}>
              What&apos;s the biggest challenge you&apos;re facing right now?
            </h2>
            <SingleOpts
              list={CHALLENGES}
              selected={s.challenge}
              onPick={(v) => pickSingle("challenge", v, 7)}
              name="Challenge"
            />
            {s.challenge === OTHER && (
              <div className={styles.otherwrap}>
                <input
                  className={styles.txt}
                  placeholder="Name the challenge"
                  value={s.challengeOther}
                  onChange={(e) => set("challengeOther", e.target.value)}
                  aria-label="Other challenge"
                />
              </div>
            )}
          </>
        );
      case 7:
        return (
          <>
            <h2 className={styles.display}>Two things to agree to.</h2>
            <div className={styles.qgap}>
              <AgreeRow
                checked={s.showUp}
                onToggle={() => {
                  set("showUp", !s.showUp);
                  setErr("");
                }}
              >
                I&apos;ll show up. Anchors are expected to give a few hours a week
                and take part in their circle.
              </AgreeRow>
              <AgreeRow
                checked={s.guidelines}
                onToggle={() => {
                  set("guidelines", !s.guidelines);
                  setErr("");
                }}
              >
                I&apos;ve read and agree to the{" "}
                <Link href={GUIDELINES_URL} target="_blank" rel="noopener">
                  Community Guidelines
                </Link>
                .
              </AgreeRow>
              <div className={styles.whybtn}>
                {s.showUp && s.guidelines
                  ? "Ready when you are."
                  : "Tick both to enable the button below."}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  }
}

// ── Hero ──
function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className={cx(styles.hero, styles.screen)}>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SUB_LOGO} alt="" className={styles.heroMark} aria-hidden="true" />
        <div className={styles.eyebrow}>KLARIO ANCHOR CLUB</div>
        <h1 className={styles.display}>
          A club for people who want to actually{" "}
          <span className={styles.underlineWord}>
            build
            <FreehandUnderline />{" "}
          </span>
          something.
        </h1>
        <p className={styles.lede}>
          Get real product experience, mentorship, and first access to the Klario
          beta, plus merch and a network of people building alongside you. We
          select a small founding cohort. This is where you tell us who you are.
        </p>
        <button type="button" className={styles.cta} onClick={onStart}>
          Let&apos;s do this <Arrow />
        </button>
        <div className={styles.meta}>7 questions · about 3 minutes</div>
      </div>
      <div className={styles.heroSide} aria-hidden="true" />
    </section>
  );
}

// ── Step shell (number, rule, children, error, nav) ──
function StepShell({
  step,
  err,
  submitting,
  onBack,
  onNext,
  children,
}: {
  step: number;
  err: string;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
  children: React.ReactNode;
}) {
  const last = step === TOTAL;
  return (
    <section className={cx(styles.step, styles.screen)}>
      <div className={cx(styles.stepnum, styles.mono)}>
        {String(step).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
      </div>
      <div className={styles.rule} />
      {children}
      {err && <div className={styles.err}>{err}</div>}
      <div className={styles.nav}>
        {step > 1 ? (
          <button type="button" className={styles.ghost} onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <span className={styles.spacer} />
        <button
          type="button"
          className={styles.cta}
          onClick={onNext}
          disabled={submitting}
        >
          {submitting
            ? "Sending…"
            : last
              ? "Send application"
              : "Next"}{" "}
          <Arrow />
        </button>
      </div>
      <div className={cx(styles.kbd, styles.mono)}>
        Enter to continue · Shift+Enter to go back
      </div>
    </section>
  );
}

function SingleOpts({
  list,
  selected,
  onPick,
  name,
}: {
  list: string[];
  selected: string | null;
  onPick: (v: string) => void;
  name: string;
}) {
  const items = [...list, OTHER];
  return (
    <div
      className={cx(styles.opts, styles.qgap)}
      role="radiogroup"
      aria-label={name}
    >
      {items.map((o) => {
        const on = selected === o;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            className={cx(styles.opt, on && styles.optOn)}
            onClick={() => onPick(o)}
          >
            <span className={cx(styles.box, styles.round)}>
              <Check />
            </span>
            <span>{o === OTHER ? "Other" : o}</span>
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  tight,
  children,
}: {
  label: string;
  tight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field} style={tight ? { marginBottom: 6 } : undefined}>
      <span className={styles.lbl}>{label}</span>
      {children}
    </label>
  );
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className={cx(styles.selectChevron, open && styles.selectChevronOpen)}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Close a popup when clicking/tapping outside its wrapper.
function useOutsideClose<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClose: () => void
) {
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onClose]);
}

// Searchable institution picker. Filters as you type; a typed value that isn't
// in the list is still kept (polytechnics, colleges, etc.).
function Combobox({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClose(wrapRef, () => setOpen(false));

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 8);
  }, [value, options]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={styles.combo}>
      <input
        className={styles.txt}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHi(0);
        }}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
            return;
          }
          if (
            e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "Enter" ||
            e.key === "Escape"
          ) {
            // Keep these keys from reaching the wizard's global Enter/nav handler.
            e.nativeEvent.stopImmediatePropagation();
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi((h) => Math.min(h + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (matches[hi]) choose(matches[hi]);
              else setOpen(false);
            } else {
              setOpen(false);
            }
          }
        }}
      />
      {open && (
        <ul className={styles.comboList} role="listbox" aria-label={ariaLabel}>
          {matches.length === 0 ? (
            <li className={styles.comboEmpty}>
              No match — we&apos;ll use what you typed.
            </li>
          ) : (
            matches.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={i === hi}
                className={cx(styles.comboItem, i === hi && styles.comboItemHi)}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => {
                  e.preventDefault(); // keep focus; select before blur
                  choose(o);
                }}
              >
                {o}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// Plain select dropdown (level of study). Click or keyboard to open; a fixed
// option list, no free text.
function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClose(wrapRef, () => setOpen(false));

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={styles.combo}>
      <button
        type="button"
        className={cx(styles.txt, styles.selectBtn)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (
            e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "Enter" ||
            e.key === " " ||
            e.key === "Escape"
          ) {
            // Never let these reach the wizard's global Enter/nav handler.
            e.nativeEvent.stopImmediatePropagation();
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (!open) {
              if (e.key !== "Enter" && e.key !== " ") return; // arrows just open below
            }
            e.preventDefault();
            if (!open) {
              setOpen(true);
              setHi(Math.max(0, options.indexOf(value)));
            } else if (e.key === "ArrowDown") {
              setHi((h) => Math.min(h + 1, options.length - 1));
            } else if (e.key === "ArrowUp") {
              setHi((h) => Math.max(h - 1, 0));
            } else {
              choose(options[hi]);
            }
          }
        }}
      >
        <span className={value ? undefined : styles.placeholderText}>
          {value || placeholder}
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <ul className={styles.comboList} role="listbox" aria-label={ariaLabel}>
          {options.map((o, i) => (
            <li
              key={o}
              role="option"
              aria-selected={value === o}
              className={cx(
                styles.comboItem,
                (value === o || i === hi) && styles.comboItemHi
              )}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o);
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AgreeRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.agree}>
      <span
        className={cx(styles.box, checked && styles.boxOn)}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <Check />
      </span>
      <span className={styles.agreeText}>{children}</span>
    </label>
  );
}

// ── The card reward screen ──
function CardScreen({
  name,
  area,
  institution,
  level,
  refCode,
  alreadyFilled,
  played,
}: {
  name: string;
  area: string;
  institution: string;
  level: string;
  refCode: string | null;
  alreadyFilled: boolean;
  played: boolean;
}) {
  // Load the sub-logo once as a data URI so the same markup renders on screen
  // and rasterises cleanly to PNG (external hrefs don't load during export).
  const [markHref, setMarkHref] = useState<string | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(SUB_LOGO);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = () => {
          if (alive) setMarkHref(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch {
        /* fall back to the vector mark */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cardData = {
    name,
    area,
    institution,
    level,
    cardNo: refCode || "—",
    markHref,
  };
  const download = async () => {
    try {
      const blob = await cardBlob(cardData);
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "klario-anchor-card.png";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      /* screenshot fallback */
    }
  };
  const share = async () => {
    const text =
      "I just applied to the KLARIO Anchor Club — a builder programme. ";
    try {
      const blob = await cardBlob(cardData);
      if (blob) {
        const file = new File([blob], "klario-anchor-card.png", {
          type: "image/png",
        });
        const nav = navigator as Navigator & {
          canShare?: (d: ShareData) => boolean;
        };
        if (nav.canShare && nav.canShare({ files: [file] })) {
          await navigator.share({
            title: "KLARIO Anchor Club",
            text,
            files: [file],
          });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({
          title: "KLARIO Anchor Club",
          text,
          url: "https://klario.finance",
        });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(text + "https://klario.finance");
    } catch {
      /* ignore */
    }
  };

  return (
    <section className={cx(styles.cardscreen, styles.screen)}>
      <div className={cx(styles.eyebrow, styles.eyebrowCard)}>
        {alreadyFilled ? "ALREADY REGISTERED" : "APPLICATION RECEIVED"}
      </div>
      <div
        className={cx(styles.cardStage, played && styles.play)}
        dangerouslySetInnerHTML={{ __html: cardSVGMarkup(cardData) }}
      />
      <div className={styles.cardActions}>
        <button type="button" className={styles.cta} onClick={download}>
          Download card
        </button>
        <button type="button" className={styles.ghost} onClick={share}>
          Share
        </button>
      </div>
      {refCode && (
        <p className={styles.refLine}>
          Keep your reference: <strong>{refCode}</strong>
        </p>
      )}
      <p className={styles.next}>
        We read every application. If you&apos;re in, you&apos;ll hear from us on
        WhatsApp within two weeks, and we&apos;ll bring you into the cohort group
        from there.
      </p>
      <p className={styles.closer}>Build with us, not for us.</p>
      <Link href="/" className={styles.homeLink}>
        Back to Klario
      </Link>
    </section>
  );
}

// SVG → canvas → PNG. Waits for fonts so the engraved text rasterises correctly.
async function cardBlob({
  name,
  area,
  institution,
  level,
  cardNo,
  markHref,
}: {
  name: string;
  area: string;
  institution: string;
  level: string;
  cardNo: string;
  markHref?: string;
}): Promise<Blob | null> {
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  const svg = cardSVGMarkup({
    name,
    area,
    institution,
    level,
    cardNo,
    markHref,
    forExport: true,
  });
  const url =
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svg)));
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = url;
  });
  const scale = 2;
  const W = 1040;
  const H = 640;
  const cv = document.createElement("canvas");
  cv.width = W * scale;
  cv.height = H * scale;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, W, H);
  return await new Promise<Blob | null>((res) => cv.toBlob(res, "image/png"));
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/Loader";
import {
  ArrowRight,
  X,
  Hand,
  PartyPopper,
  Copy,
  Check,
  Home,
  Trophy,
  ShieldAlert,
  Share2,
} from "lucide-react";
import styles from "./beta.module.css";

const TOTAL = 8; // numbered questions (welcome is step 0)
const ADVANCE_MS = 250;

const METHOD = [
  "A spreadsheet I maintain like a tiny second job",
  "Notes app or actual paper",
  "My bank app(s) and vibes",
  "Another budgeting app",
  "Track? I simply spend and pray",
];
const PAIN = [
  "I genuinely don't know where it goes",
  "Logging everything by hand is soul-draining",
  "Budgets and I have trust issues",
  "My accounts are scattered everywhere",
  "I overspend and only notice at the ATM",
  "Saving? My account is a transit lounge",
];
const SHEETLIFE = [
  "Never dies. I am built different.",
  "A few good months",
  "Two weeks, then radio silence",
  "I never finish setting it up",
  "Spreadsheets and I never met",
];
const FEATURES = [
  "Transactions sorted for me (zero typing)",
  "All my accounts in one calm view",
  "A nudge before I overspend",
  "Plain-English insights, no finance jargon",
  "Savings goals that track themselves",
  "Reminders before bills ambush me",
];
const PRICE = [
  "Free, always, forever, please",
  "₦500 to ₦1,000",
  "₦1,000 to ₦2,500",
  "₦2,500+ if it's that good",
  "I'll pay if it actually saves me money",
];

const EMAIL_RE = /.+@.+\..+/;

// How long the branded loader shows for a referred visitor (ms).
const LOADER_DURATION = 2000;

type Answers = {
  name: string;
  email: string;
  phone: string;
  referral: string;
  method: string | null;
  pain: string[];
  sheetlife: string | null;
  trust: number | null;
  features: string[];
  price: string | null;
  dream: string;
};

const EMPTY: Answers = {
  name: "",
  email: "",
  phone: "",
  referral: "",
  method: null,
  pain: [],
  sheetlife: null,
  trust: null,
  features: [],
  price: null,
  dream: "",
};

function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function BetaWizard() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(EMPTY);
  const [miss, setMiss] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [booting, setBooting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Prefill the referral code from a shared link (?ref=KLR-XXXXX), and show the
  // branded loader briefly for referred visitors arriving from someone's link.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("ref");
    if (!code) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL read
    setA((p) => ({ ...p, referral: code.toUpperCase() }));
    setBooting(true);
    const t = setTimeout(() => setBooting(false), LOADER_DURATION);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (step === 1) {
      const t = setTimeout(() => firstInputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goNext = () => {
    setMiss(false);
    setStep((s) => Math.min(s + 1, TOTAL));
  };
  const goBack = () => {
    setMiss(false);
    setStep((s) => Math.max(s - 1, 0));
  };

  const valid = (s: number): boolean => {
    switch (s) {
      case 1:
        return EMAIL_RE.test(a.email.trim());
      case 2:
        return !!a.method;
      case 3:
        return a.pain.length > 0;
      case 4:
        return !!a.sheetlife;
      case 5:
        return a.trust !== null;
      case 6:
        return a.features.length > 0;
      case 7:
        return !!a.price;
      default:
        return true;
    }
  };

  const advance = () => {
    if (!valid(step)) {
      setMiss(true);
      return;
    }
    if (step < TOTAL) goNext();
  };

  // Single-select / scale: highlight, then auto-advance so the choice registers.
  const pickSingle = (key: "method" | "sheetlife" | "price", value: string) => {
    setA((p) => ({ ...p, [key]: value }));
    setMiss(false);
    const cur = step;
    setTimeout(() => setStep((s) => (s === cur && s < TOTAL ? s + 1 : s)), ADVANCE_MS);
  };
  const pickScale = (value: number) => {
    setA((p) => ({ ...p, trust: value }));
    setMiss(false);
    const cur = step;
    setTimeout(() => setStep((s) => (s === cur && s < TOTAL ? s + 1 : s)), ADVANCE_MS);
  };
  const toggleMulti = (key: "pain" | "features", value: string, max: number) => {
    setMiss(false);
    setA((p) => {
      const arr = p[key];
      if (arr.includes(value)) return { ...p, [key]: arr.filter((x) => x !== value) };
      const next = arr.length >= max ? [...arr.slice(1), value] : [...arr, value];
      return { ...p, [key]: next };
    });
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/beta-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: a.name,
          email: a.email,
          phone: a.phone,
          referral: a.referral,
          method: a.method,
          pain: a.pain,
          sheetlife: a.sheetlife,
          trust: a.trust,
          features: a.features,
          price: a.price,
          dream: a.dream,
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setRef(data.ref as string);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Thank-you ─────────────────────────────────────────────────────────────
  if (ref) {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/beta?ref=${ref}`
        : `/beta?ref=${ref}`;
    const shareText =
      "I just joined the Klario beta, early access to a smarter way to handle money in Nigeria. Join with my link so we both move up the list. The referral contest closes June 30 and the top referrers win cash.";
    const shareFull = `${shareText} ${shareUrl}`;
    const copy = () => {
      navigator.clipboard?.writeText(shareFull).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    };
    const share = async () => {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: "Join me on the Klario beta",
            text: shareText,
            url: shareUrl,
          });
        } catch {
          // Share sheet dismissed or unavailable; nothing to do.
        }
      } else {
        // Desktop / unsupported: fall back to copying the full message.
        copy();
      }
    };
    return (
      <div className={styles.wrap}>
        <div className={styles.thanks}>
          <div className={styles.big}>
            <PartyPopper />
          </div>
          <h2>You&apos;re on the list.</h2>
          <p>
            Thanks for being honest about your money. That&apos;s harder than it
            sounds. The problems you just described are the exact ones we&apos;re
            building Klario to kill. We&apos;ll be in touch when your spot opens.
          </p>
          <div className={styles.ref}>Your beta reference: {ref}</div>
          <div className={styles.shareMsg}>
            {shareText}{" "}
            <span className={styles.shareLinkInline}>{shareUrl}</span>
          </div>
          <div className={styles.shareRow}>
            <button type="button" className={styles.shareBtn} onClick={share}>
              <Share2 size={15} /> Share with friends
            </button>
            <button type="button" className={styles.copyBtn} onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy message"}
            </button>
          </div>
          <p className={styles.shareHint}>
            Tap share to send it straight to WhatsApp or anywhere else. Friends
            who join from your link are counted to you.
          </p>

          <div className={styles.contest}>
            <div className={styles.contestHead}>
              <Trophy size={17} /> Referral contest
            </div>
            <div className={styles.prizes}>
              <div className={styles.prize}>
                <div className={styles.prizeRank}>1st place</div>
                <div className={styles.prizeAmt}>&#8358;30,000</div>
              </div>
              <div className={styles.prize}>
                <div className={styles.prizeRank}>2nd place</div>
                <div className={styles.prizeAmt}>&#8358;15,000</div>
              </div>
            </div>
            <p>
              The two people who refer the most friends win cash. Entries close{" "}
              <span className={styles.deadline}>June 30</span>, so share your
              link and get your friends on the list. Stick around for the
              testing phase too, we&apos;re giving out more rewards to everyone
              who helps us put Klario through its paces.
            </p>
          </div>

          <div className={styles.warn}>
            <ShieldAlert size={18} />
            <div className={styles.warnBody}>
              <strong>We check for fake referrals.</strong>
              An AI system grades every signup and flags throwaway inboxes, fake
              details, self-referrals, and accounts farmed from one device. Only
              verified, real people count toward your total. Anything that looks
              gamed is disqualified.
            </div>
          </div>

          <Link href="/" className={styles.homeBtn}>
            <Home size={16} />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const counter =
    step === 0
      ? ""
      : `${String(step).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`;

  return (
    <div className={styles.wrap}>
      <AnimatePresence>{booting && <Loader key="beta-loader" />}</AnimatePresence>
      <div className={styles.stage}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.dot}>K</div>
            <div className={styles.nm}>Klario</div>
          </div>
          <div className={styles.count} aria-live="polite">
            {counter}
          </div>
        </div>

        <div className={styles.progress}>
          <div
            className={styles.fill}
            style={{ width: `${(step / TOTAL) * 100}%` }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={0}
            aria-valuemax={TOTAL}
          />
        </div>

        <div className={styles.cardzone}>
          {/* key={step} remounts the card so the slide-in animation replays */}
          <div key={step} className={cx(styles.card, styles.cardIn)}>
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <>
            <div className={styles.lead}>
              <Hand size={30} />
            </div>
            <div className={styles.eyebrow}>Private Beta · Nigeria</div>
            <div className={styles.qlabel}>
              Let&apos;s talk about your money. We promise to be nice about it.
            </div>
            <div className={styles.problems}>
              {[
                "Typing every expense into a sheet like it's 2009",
                "Money vanishing with no witnesses",
                "Budgets that ghost you by day ten",
                "Opening five bank apps to feel one emotion",
              ].map((p) => (
                <div className={styles.prob} key={p}>
                  <span className={styles.probX}>
                    <X size={14} />
                  </span>
                  <p>{p}</p>
                </div>
              ))}
            </div>
            <p className={styles.promise}>
              <b>
                Klario connects your accounts, sorts everything itself, and tells
                you what&apos;s really going on.
              </b>{" "}
              No typing, no formulas, no Sunday-night spreadsheet guilt.
            </p>
            <div className={styles.nav}>
              <button type="button" className={cx(styles.btn, styles.grow)} onClick={advance}>
                I&apos;m in, ask away <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.skip}>8 questions · about 2 honest minutes</div>
          </>
        );

      case 1:
        return (
          <>
            <div className={styles.eyebrow}>01 · the important bit</div>
            <div className={styles.qlabel}>
              First, where do we send your beta invite?
            </div>
            <div className={styles.qhint}>
              We&apos;ll only use this to let you in. No spam. We&apos;re not those
              people.
            </div>
            <div className={styles.fields}>
              <input
                ref={firstInputRef}
                type="text"
                aria-label="Your name"
                autoComplete="name"
                placeholder="Your name"
                value={a.name}
                onChange={(e) => setA((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={onEnter}
              />
              <input
                type="email"
                aria-label="Email address"
                autoComplete="email"
                inputMode="email"
                placeholder="Email address"
                value={a.email}
                onChange={(e) => setA((p) => ({ ...p, email: e.target.value }))}
                onKeyDown={onEnter}
              />
              <input
                type="text"
                aria-label="Phone or WhatsApp (optional)"
                autoComplete="tel"
                inputMode="tel"
                placeholder="Phone or WhatsApp (optional)"
                value={a.phone}
                onChange={(e) => setA((p) => ({ ...p, phone: e.target.value }))}
                onKeyDown={onEnter}
              />
              <input
                type="text"
                aria-label="Referral code (optional)"
                placeholder="Referral code (optional)"
                value={a.referral}
                onChange={(e) =>
                  setA((p) => ({ ...p, referral: e.target.value.toUpperCase() }))
                }
                onKeyDown={onEnter}
              />
            </div>
            {miss && (
              <div className={styles.miss}>
                A real email, please. That&apos;s how you get in.
              </div>
            )}
            {navRow()}
          </>
        );

      case 2:
        return single(
          "02 · no judgement",
          "How do you keep track of your money right now?",
          "Pick the one closest to the truth. Even the painful one.",
          "method",
          METHOD,
          a.method
        );

      case 3:
        return multi(
          "03 · where it hurts",
          "What's the most painful part of managing your money?",
          "Choose up to two. We'll pretend we didn't see the third.",
          "pain",
          PAIN,
          a.pain,
          2
        );

      case 4:
        return single(
          "04 · be honest",
          "Your budgeting spreadsheet: how long before it flatlines?",
          null,
          "sheetlife",
          SHEETLIFE,
          a.sheetlife
        );

      case 5:
        return (
          <>
            <div className={styles.eyebrow}>05 · the trust test</div>
            <div className={styles.qlabel}>
              How comfortable are you linking a bank account to an app?
            </div>
            <div className={styles.qhint}>
              Be brutally honest. It tells us how much trust we have to earn.
            </div>
            <div className={styles.scale} role="radiogroup" aria-label="Comfort 1 to 5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={a.trust === n}
                  className={cx(styles.scaleBtn, a.trust === n && styles.sel)}
                  onClick={() => pickScale(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className={styles.scalelbl}>
              <span>Over my dead body</span>
              <span>Take it, it&apos;s fine</span>
            </div>
            {miss && <div className={styles.miss}>Tap a number to continue.</div>}
            {navRow()}
          </>
        );

      case 6:
        return multi(
          "06 · the wishlist",
          "What would actually make you open Klario every day?",
          "Choose up to three. Dream a little.",
          "features",
          FEATURES,
          a.features,
          3
        );

      case 7:
        return single(
          "07 · the money question (ironic, we know)",
          "If Klario did all that, what feels fair per month?",
          null,
          "price",
          PRICE,
          a.price
        );

      case 8:
        return (
          <>
            <div className={styles.eyebrow}>08 · last one, promise</div>
            <div className={styles.qlabel}>
              In one line: what would make money feel less stressful?
            </div>
            <div className={styles.qhint}>
              No wrong answers. This is the part that shapes what we build.
            </div>
            <textarea
              className={styles.textarea}
              rows={3}
              aria-label="What would make money feel less stressful?"
              placeholder="Say anything. We're listening."
              value={a.dream}
              onChange={(e) => setA((p) => ({ ...p, dream: e.target.value }))}
            />
            {error && <div className={styles.miss}>{error}</div>}
            <div className={styles.nav}>
              <button type="button" className={cx(styles.btn, styles.ghost)} onClick={goBack}>
                Back
              </button>
              <button
                type="button"
                className={cx(styles.btn, styles.grow)}
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? (
                  "Sending..."
                ) : (
                  <>
                    Get me into the beta <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  }

  function onEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      advance();
    }
  }

  function navRow() {
    return (
      <div className={styles.nav}>
        <button type="button" className={cx(styles.btn, styles.ghost)} onClick={goBack}>
          Back
        </button>
        <button type="button" className={cx(styles.btn, styles.grow)} onClick={advance}>
          Next <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  function single(
    eyebrow: string,
    qlabel: string,
    qhint: string | null,
    key: "method" | "sheetlife" | "price",
    options: string[],
    selected: string | null
  ) {
    return (
      <>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <div className={styles.qlabel}>{qlabel}</div>
        {qhint && <div className={styles.qhint}>{qhint}</div>}
        <div className={styles.opts} role="radiogroup" aria-label={qlabel}>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={selected === o}
              className={cx(styles.opt, selected === o && styles.sel)}
              onClick={() => pickSingle(key, o)}
            >
              <span className={styles.mark} />
              <span className={styles.txt}>{o}</span>
            </button>
          ))}
        </div>
        {miss && <div className={styles.miss}>Pick one to continue.</div>}
        {navRow()}
      </>
    );
  }

  function multi(
    eyebrow: string,
    qlabel: string,
    qhint: string,
    key: "pain" | "features",
    options: string[],
    selected: string[],
    max: number
  ) {
    return (
      <>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <div className={styles.qlabel}>{qlabel}</div>
        <div className={styles.qhint}>{qhint}</div>
        <div className={styles.opts}>
          {options.map((o) => {
            const on = selected.includes(o);
            return (
              <button
                key={o}
                type="button"
                aria-pressed={on}
                className={cx(styles.opt, styles.multi, on && styles.sel)}
                onClick={() => toggleMulti(key, o, max)}
              >
                <span className={styles.mark} />
                <span className={styles.txt}>{o}</span>
              </button>
            );
          })}
        </div>
        {miss && <div className={styles.miss}>Choose at least one.</div>}
        {navRow()}
      </>
    );
  }
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronRight,
  ArrowUpDown,
  RotateCw,
  AlertTriangle,
  BadgeCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type { BetaResponse } from "@/lib/db/betaResponses";
import { canonicalEmail } from "@/lib/duplicates";
import { InfoModal } from "../_components/Modal";

export type Summary = {
  total: number;
  spreadsheetPct: number;
  avgTrust: number;
  topFeatures: { label: string; count: number }[];
};

type SortKey = "created_at" | "name" | "email" | "trust" | "confirmation_sent" | "ai";

type FilterKey =
  | "all"
  | "flagged"
  | "highrisk"
  | "unverified"
  | "verified"
  | "referred"
  | "student"
  | "business"
  | "employed"
  | "freelancer";

const PROFESSIONS = ["Student", "Business owner", "Employed", "Freelancer"];

// Readable labels for the free-text "other" notes captured per question.
const NOTE_LABELS: Record<string, string> = {
  method: "How they track money",
  pain: "Biggest pains",
  sheetlife: "Spreadsheet lifespan",
  trust: "Bank-link comfort",
  features: "Wishlist",
  occupation: "Occupation",
};

// Profession filter keys → the occupation value they match.
const OCCUPATION_FILTER: Partial<Record<FilterKey, string>> = {
  student: "Student",
  business: "Business owner",
  employed: "Employed",
  freelancer: "Freelancer",
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "flagged", label: "Flagged" },
  { key: "highrisk", label: "High AI risk" },
  { key: "unverified", label: "Unverified" },
  { key: "verified", label: "Verified" },
  { key: "referred", label: "Referred" },
  { key: "student", label: "Student" },
  { key: "business", label: "Business owner" },
  { key: "employed", label: "Employed" },
  { key: "freelancer", label: "Freelancer" },
];
// Referral reward: ₦500 airtime per 10 referrals (students only), pro-rated.
const REFERRAL_GOAL = 10;
const REFERRAL_REWARD = 500;
const PER_REFERRAL = REFERRAL_REWARD / REFERRAL_GOAL; // ₦50 per referral
const naira = (n: number) => `₦${n.toLocaleString()}`;

type FlagKind = "ip" | "device" | "alias" | "mutual";
type DetailedFlag = {
  kind: FlagKind;
  label: string;
  /** Other responses that share this signal with the flagged row. */
  related: BetaResponse[];
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BetaResponsesView({
  responses,
  summary,
}: {
  responses: BetaResponse[];
  summary: Summary;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "created_at",
    dir: "desc",
  });
  const [open, setOpen] = useState<BetaResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [info, setInfo] = useState<{ title: string; message: string; ok?: boolean } | null>(null);
  const [cluster, setCluster] = useState<{ title: string; rows: BetaResponse[] } | null>(null);
  const [referrer, setReferrer] = useState<BetaResponse | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pending, startTransition] = useTransition();

  // Keep the data live: refresh when the tab regains focus and every 15s while
  // visible, so verified-referral counts update without a manual reload.
  useEffect(() => {
    const refresh = () => startTransition(() => router.refresh());
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 15000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byId = useMemo(
    () => new Map(responses.map((r) => [r.id, r])),
    [responses]
  );
  // Referral counts - every resolved referral counts (no email confirmation needed).
  const referralCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of responses) {
      if (r.referred_by_id) {
        m.set(r.referred_by_id, (m.get(r.referred_by_id) ?? 0) + 1);
      }
    }
    return m;
  }, [responses]);
  // Occupation breakdown for the professions card.
  const professionCounts = useMemo(() => {
    const list = PROFESSIONS.map((label) => ({ label, count: 0 }));
    let other = 0;
    for (const r of responses) {
      const o = (r.occupation || "").trim();
      if (!o) continue;
      const hit = list.find((p) => p.label === o);
      if (hit) hit.count++;
      else other++;
    }
    return other ? [...list, { label: "Other", count: other }] : list;
  }, [responses]);
  // Referral leaderboard: top referrers by referral count + reward earned.
  const leaderboard = useMemo(() => {
    const arr: { r: BetaResponse; count: number }[] = [];
    for (const [id, count] of referralCounts) {
      const r = byId.get(id);
      if (r && count > 0) arr.push({ r, count });
    }
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 5);
  }, [referralCounts, byId]);
  // Fraud flags for a row, each carrying the other rows that share the signal so
  // the admin can click through to see exactly who clusters together.
  const detailedFlagsFor = (r: BetaResponse): DetailedFlag[] => {
    const out: DetailedFlag[] = [];
    if (r.ip) {
      const related = responses.filter((x) => x.id !== r.id && x.ip === r.ip);
      if (related.length >= 1)
        out.push({
          kind: "ip",
          label: `Shared IP (${related.length + 1} sign-ups)`,
          related,
        });
    }
    if (r.fingerprint) {
      const related = responses.filter(
        (x) => x.id !== r.id && x.fingerprint === r.fingerprint
      );
      if (related.length >= 1)
        out.push({
          kind: "device",
          label: `Same device (${related.length + 1} sign-ups)`,
          related,
        });
    }
    const canon = canonicalEmail(r.email);
    const aliasRelated = responses.filter(
      (x) => x.id !== r.id && canonicalEmail(x.email) === canon
    );
    if (aliasRelated.length >= 1)
      out.push({
        kind: "alias",
        label: `Email alias reuse (${aliasRelated.length + 1})`,
        related: aliasRelated,
      });
    if (r.referred_by_id) {
      const ref = byId.get(r.referred_by_id);
      if (ref && ref.referred_by_id === r.id)
        out.push({ kind: "mutual", label: "Mutual referral", related: [ref] });
    }
    return out;
  };
  const flagsFor = (r: BetaResponse): string[] =>
    detailedFlagsFor(r).map((f) => f.label);
  // Precompute which rows are flagged once, so filtering/counting is cheap.
  const flaggedSet = useMemo(() => {
    const s = new Set<string>();
    for (const r of responses) if (detailedFlagsFor(r).length > 0) s.add(r.id);
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses]);
  const flaggedCount = flaggedSet.size;
  const highRiskCount = responses.filter((r) => r.ai_level === "high").length;

  const matchesFilter = (r: BetaResponse): boolean => {
    const occ = OCCUPATION_FILTER[filter];
    if (occ) return (r.occupation || "") === occ;
    switch (filter) {
      case "flagged":
        return flaggedSet.has(r.id);
      case "highrisk":
        return r.ai_level === "high";
      case "unverified":
        return !r.verified;
      case "verified":
        return r.verified;
      case "referred":
        return !!r.referred_by_id;
      default:
        return true;
    }
  };
  const countOcc = (label: string) =>
    responses.filter((r) => r.occupation === label).length;
  const tabCounts: Record<FilterKey, number> = {
    all: responses.length,
    flagged: flaggedCount,
    highrisk: highRiskCount,
    unverified: responses.filter((r) => !r.verified).length,
    verified: responses.filter((r) => r.verified).length,
    referred: responses.filter((r) => !!r.referred_by_id).length,
    student: countOcc("Student"),
    business: countOcc("Business owner"),
    employed: countOcc("Employed"),
    freelancer: countOcc("Freelancer"),
  };

  // Detail for the clicked referrer: who they invited, each one's fraud flags,
  // and whether the referrer looks valid (low share of flagged/high-risk invitees).
  // Declared after detailedFlagsFor so it isn't referenced before initialization.
  const referrerData = useMemo(() => {
    if (!referrer) return null;
    const invitees = responses.filter((x) => x.referred_by_id === referrer.id);
    const enriched = invitees.map((row) => ({ row, flags: detailedFlagsFor(row) }));
    const flaggedN = enriched.filter((e) => e.flags.length > 0).length;
    const highRiskN = invitees.filter((x) => x.ai_level === "high").length;
    const count = invitees.length;
    const badShare = count > 0 ? (flaggedN + highRiskN) / count : 0;
    const valid = count > 0 && badShare < 0.4;
    const amount = count * PER_REFERRAL;
    return { enriched, count, flaggedN, highRiskN, valid, amount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referrer, responses]);

  const getVal = (r: BetaResponse, key: SortKey): string | number => {
    switch (key) {
      case "created_at":
        return Date.parse(r.created_at);
      case "trust":
        return r.trust ?? -1;
      case "confirmation_sent":
        return r.confirmation_sent ? 1 : 0;
      case "name":
        return (r.name || "").toLowerCase();
      case "email":
        return r.email.toLowerCase();
      case "ai":
        return r.ai_risk ?? -1;
    }
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = responses.filter((r) => {
      if (!matchesFilter(r)) return false;
      if (!needle) return true;
      return (
        r.email.toLowerCase().includes(needle) ||
        (r.name || "").toLowerCase().includes(needle) ||
        (r.ref || "").toLowerCase().includes(needle)
      );
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      const av = getVal(a, sort.key);
      const bv = getVal(b, sort.key);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses, q, sort, filter, flaggedSet]);

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );

  const resend = async (r: BetaResponse) => {
    setBusy(r.id);
    try {
      const res = await fetch(`/api/admin/beta/${r.id}/resend`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setInfo({ title: "Sent", message: `Confirmation re-sent to ${r.email}.`, ok: true });
        startTransition(() => router.refresh());
      } else {
        setInfo({ title: "Failed", message: data.error || "Could not resend.", ok: false });
      }
    } finally {
      setBusy(null);
    }
  };

  // AI fraud scan (admin-triggered Claude classifier).
  const [scanning, setScanning] = useState<Set<string>>(new Set());
  const [scanAll, setScanAll] = useState(false);
  const uncheckedCount = responses.filter((r) => !r.ai_checked_at).length;
  const [syncing, setSyncing] = useState(false);

  const syncAudience = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/beta/sync-audience", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setInfo({
          title: "Audience synced",
          message: data.added
            ? `Added ${data.added} missing email${data.added === 1 ? "" : "s"} to the audience.`
            : "Everyone is already on the audience list.",
          ok: true,
        });
      } else {
        setInfo({
          title: "Sync failed",
          message: data.error || "Could not sync the audience.",
          ok: false,
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  const scanOne = async (id: string) => {
    setScanning((s) => new Set(s).add(id));
    try {
      const res = await fetch("/api/admin/beta/ai-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && !data.failed) {
        startTransition(() => router.refresh());
      } else {
        setInfo({
          title: "Analysis failed",
          message: data.results?.[0]?.error || data.error || "Could not analyze.",
          ok: false,
        });
      }
    } finally {
      setScanning((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  const scanAllUnchecked = async () => {
    setScanAll(true);
    try {
      const res = await fetch("/api/admin/beta/ai-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setInfo({
          title: "AI scan complete",
          message: `Analyzed ${data.scanned} response${
            data.scanned === 1 ? "" : "s"
          }.${data.failed ? ` ${data.failed} failed.` : ""}`,
          ok: true,
        });
        startTransition(() => router.refresh());
      } else {
        setInfo({
          title: "Scan failed",
          message: data.error || "Could not run the scan.",
          ok: false,
        });
      }
    } finally {
      setScanAll(false);
    }
  };

  const exportCsv = () => {
    const cols = [
      "ref", "created_at", "name", "email", "phone", "occupation", "method", "pain",
      "sheetlife", "trust", "features", "notes", "price", "dream", "confirmation_sent",
      "verified", "verified_at", "ip", "fingerprint", "referred_by_ref",
      "ai_risk", "ai_level", "ai_reasons", "user_agent", "referrer",
    ];
    const esc = (v: unknown) => {
      const s =
        v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = responses.map((r) =>
      [
        r.ref, r.created_at, r.name, r.email, r.phone, r.occupation, r.method, r.pain,
        r.sheetlife, r.trust, r.features,
        Object.entries(r.notes || {})
          .filter(([, v]) => v)
          .map(([k, v]) => `${NOTE_LABELS[k] ?? k}: ${v}`)
          .join(" | "),
        r.price, r.dream, r.confirmation_sent,
        r.verified, r.verified_at, r.ip, r.fingerprint, r.referred_by_ref,
        r.ai_risk, r.ai_level, r.ai_reasons, r.user_agent, r.referrer,
      ]
        .map(esc)
        .join(",")
    );
    const blob = new Blob([cols.join(",") + "\n" + lines.join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klario-beta-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total responses" value={summary.total.toLocaleString()} />
        <Stat label="Spreadsheet users" value={`${summary.spreadsheetPct}%`} />
        <Stat
          label="Avg. trust score"
          value={summary.total ? `${summary.avgTrust.toFixed(1)} / 5` : "-"}
        />
        <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
            Top requested
          </p>
          {summary.topFeatures.length === 0 ? (
            <p className="font-display mt-2 text-lg text-bg/40">-</p>
          ) : (
            <ol className="mt-2 flex flex-col gap-1 text-[12px] text-bg/75">
              {summary.topFeatures.map((f, i) => (
                <li key={f.label} className="flex items-start gap-1.5">
                  <span className="text-gold">{i + 1}.</span>
                  <span className="line-clamp-1">{f.label}</span>
                  <span className="ml-auto shrink-0 text-bg/45">{f.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Professions + referral leaderboard, side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-bg/10 bg-bg/4 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
            Professions
          </p>
          <ol className="mt-3 flex flex-col gap-2 text-[13px] text-bg/75">
            {professionCounts.map((p) => (
              <li key={p.label} className="flex items-center gap-1.5">
                <span className="line-clamp-1">{p.label}</span>
                <span className="ml-auto shrink-0 text-bg/45">{p.count}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-bg/10 bg-bg/4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
              Referral leaderboard
            </p>
            <p className="text-[11px] text-bg/40">
              {naira(REFERRAL_REWARD)} airtime / {REFERRAL_GOAL} referrals
            </p>
          </div>
          {leaderboard.length === 0 ? (
            <p className="mt-3 text-[13px] text-bg/45">No referrals yet.</p>
          ) : (
          <ol className="mt-3 flex flex-col gap-1">
            {leaderboard.map((e, i) => {
              const amount = e.count * PER_REFERRAL;
              const isStudent =
                (e.r.occupation || "").toLowerCase() === "student";
              return (
                <li key={e.r.id}>
                  <button
                    type="button"
                    onClick={() => setReferrer(e.r)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-bg/5"
                  >
                    <span className="w-5 shrink-0 text-center font-display text-sm text-gold">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-bg/90">
                        {e.r.name || e.r.email}
                      </div>
                      <div className="truncate text-[12px] text-bg/50">
                        {e.r.email}
                        {!isStudent && " · not a student"}
                      </div>
                    </div>
                    <div className="shrink-0 whitespace-nowrap text-right">
                      <div className="text-[13px] text-bg/90 sm:text-sm">
                        {e.count} ref{e.count === 1 ? "" : "s"}
                      </div>
                      <div className="text-[11px] text-gold sm:text-[12px]">
                        {isStudent
                          ? naira(amount)
                          : `${naira(amount)} · n/a`}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((t) => {
          const active = filter === t.key;
          const danger = t.key === "highrisk";
          const warn = t.key === "flagged";
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition " +
                (active
                  ? danger
                    ? "bg-red-400/20 text-red-200 ring-1 ring-red-400/40 font-medium"
                    : warn
                    ? "bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/40 font-medium"
                    : "bg-gold text-ink font-medium"
                  : "border border-bg/15 text-bg/65 hover:border-bg/30 hover:text-bg")
              }
            >
              {warn && <AlertTriangle size={12} />}
              {danger && <Sparkles size={12} />}
              {t.label}
              <span
                className={
                  "rounded-full px-1.5 text-[11px] " +
                  (active ? "bg-ink/15" : "bg-bg/10")
                }
              >
                {tabCounts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex w-full items-center gap-2 rounded-xl border border-bg/15 bg-bg/4 px-3 py-2 text-sm sm:w-auto">
          <Search size={14} className="text-bg/45" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email, name, or ref"
            className="w-full min-w-0 bg-transparent text-bg placeholder:text-bg/40 focus:outline-none sm:w-72"
          />
        </label>
        <button
          type="button"
          onClick={scanAllUnchecked}
          disabled={scanAll || uncheckedCount === 0}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-[12px] text-gold hover:bg-gold/15 disabled:opacity-40"
        >
          {scanAll ? (
            <RotateCw size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          {scanAll
            ? "Scanning…"
            : uncheckedCount > 0
            ? `Scan ${uncheckedCount} with AI`
            : "All analyzed"}
        </button>
        <button
          type="button"
          onClick={syncAudience}
          disabled={syncing || !responses.length}
          className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:border-bg/30 hover:text-bg disabled:opacity-40"
        >
          {syncing ? (
            <RotateCw size={12} className="animate-spin" />
          ) : (
            <UserPlus size={12} />
          )}
          {syncing ? "Syncing…" : "Sync to audience"}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!responses.length}
          className="rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:border-bg/30 hover:text-bg disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-bg/10">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="border-b border-bg/10 bg-bg/4 text-left text-[11px] uppercase tracking-[0.14em] text-bg/45">
            <tr>
              <SortTh label="Date" k="created_at" sort={sort} onSort={toggleSort} />
              <SortTh label="Name" k="name" sort={sort} onSort={toggleSort} />
              <SortTh label="Email" k="email" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Occupation</th>
              <th className="px-4 py-3 font-medium">Referred by</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Pain</th>
              <SortTh label="Trust" k="trust" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Ref</th>
              <SortTh label="Sent" k="confirmation_sent" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Verified</th>
              <SortTh label="AI risk" k="ai" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-10 text-center text-bg/45">
                  {responses.length === 0
                    ? "No responses yet."
                    : "No responses match this filter."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setOpen(r)}
                  className="cursor-pointer border-b border-bg/8 last:border-0 hover:bg-bg/3"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-bg/55">
                    {fmtDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-bg/80">{r.name || "-"}</td>
                  <td className="px-4 py-3 text-bg/85">{r.email}</td>
                  <td className="px-4 py-3 text-bg/60">{r.phone || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-bg/70">
                    {r.occupation || "-"}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-[12px] text-bg/60">
                    {(() => {
                      const by = r.referred_by_id
                        ? byId.get(r.referred_by_id)
                        : null;
                      return by
                        ? by.name || by.email
                        : r.referred_by_ref || "-";
                    })()}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-[12px] text-bg/60">
                    {r.method || "-"}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-[12px] text-bg/60">
                    {r.pain.join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-bg/75">{r.trust ?? "-"}</td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-[12px] text-bg/60">
                    {r.price || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-gold">
                    {r.ref || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {r.confirmation_sent ? (
                      <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] text-emerald-200">
                        Sent
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] text-amber-200">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {r.verified ? (
                        <BadgeCheck size={16} className="text-emerald-300" />
                      ) : (
                        <span className="text-[12px] text-bg/40">No</span>
                      )}
                      {flagsFor(r).length > 0 && (
                        <AlertTriangle
                          size={15}
                          className="text-amber-300"
                          aria-label={flagsFor(r).join(", ")}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.ai_checked_at ? (
                      <RiskBadge level={r.ai_level} risk={r.ai_risk} />
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          scanOne(r.id);
                        }}
                        disabled={scanning.has(r.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 text-[11px] text-gold hover:bg-gold/10 disabled:opacity-50"
                      >
                        {scanning.has(r.id) ? (
                          <RotateCw size={11} className="animate-spin" />
                        ) : (
                          <Sparkles size={11} />
                        )}
                        {scanning.has(r.id) ? "Analyzing…" : "Analyze"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={14} className="ml-auto text-bg/45" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Drawer
          r={open}
          referrer={open.referred_by_id ? byId.get(open.referred_by_id) ?? null : null}
          referralCount={referralCounts.get(open.id) ?? 0}
          flags={detailedFlagsFor(open)}
          onClose={() => setOpen(null)}
          onResend={() => resend(open)}
          resending={busy === open.id || pending}
          onAnalyze={() => scanOne(open.id)}
          analyzing={scanning.has(open.id)}
          onShowCluster={(f) => setCluster({ title: f.label, rows: f.related })}
        />
      )}
      {cluster && (
        <ClusterModal
          title={cluster.title}
          rows={cluster.rows}
          onClose={() => setCluster(null)}
          onOpenRow={(row) => {
            setCluster(null);
            setOpen(row);
          }}
        />
      )}
      {referrer && referrerData && (
        <ReferrerModal
          referrer={referrer}
          data={referrerData}
          onClose={() => setReferrer(null)}
          onOpenRow={(row) => {
            setReferrer(null);
            setOpen(row);
          }}
          onViewProfile={() => {
            const r = referrer;
            setReferrer(null);
            setOpen(r);
          }}
        />
      )}
      <InfoModal state={info} onClose={() => setInfo(null)} />
    </div>
  );
}

const RISK_STYLES: Record<string, string> = {
  low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  high: "border-red-400/30 bg-red-400/10 text-red-200",
};

function RiskBadge({
  level,
  risk,
}: {
  level: "low" | "medium" | "high" | null;
  risk: number | null;
}) {
  if (!level) return <span className="text-[12px] text-bg/40">-</span>;
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize " +
        (RISK_STYLES[level] ?? "border-bg/20 text-bg/60")
      }
    >
      {level}
      {risk != null ? ` · ${risk}` : ""}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
        {label}
      </p>
      <p className="font-display mt-2 text-3xl text-bg">{value}</p>
    </div>
  );
}

function SortTh({
  label,
  k,
  sort,
  onSort,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (k: SortKey) => void;
}) {
  const active = sort.key === k;
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(k)}
        className={
          "inline-flex items-center gap-1 " +
          (active ? "text-bg" : "hover:text-bg/70")
        }
      >
        {label}
        <ArrowUpDown size={11} className={active ? "text-gold" : "opacity-40"} />
      </button>
    </th>
  );
}

function Drawer({
  r,
  referrer,
  referralCount,
  flags,
  onClose,
  onResend,
  resending,
  onAnalyze,
  analyzing,
  onShowCluster,
}: {
  r: BetaResponse;
  referrer: BetaResponse | null;
  referralCount: number;
  flags: DetailedFlag[];
  onClose: () => void;
  onResend: () => void;
  resending: boolean;
  onAnalyze: () => void;
  analyzing: boolean;
  onShowCluster: (f: DetailedFlag) => void;
}) {
  const referredBy = r.referred_by_ref
    ? `${r.referred_by_ref}${referrer ? ` (${referrer.email})` : " (not found)"}`
    : "-";

  const rows: [string, React.ReactNode][] = [
    ["Reference", <span key="ref" className="font-mono text-gold">{r.ref}</span>],
    ["Submitted", new Date(r.created_at).toLocaleString()],
    [
      "Email verified",
      r.verified ? (
        <span key="v" className="text-emerald-300">
          Yes{r.verified_at ? ` · ${new Date(r.verified_at).toLocaleString()}` : ""}
        </span>
      ) : (
        <span key="v" className="text-amber-300">Not yet</span>
      ),
    ],
    [
      "Fraud flags",
      flags.length ? (
        <div key="f" className="flex flex-wrap gap-1.5">
          {flags.map((f) => (
            <button
              key={f.kind}
              type="button"
              onClick={() => f.related.length > 0 && onShowCluster(f)}
              disabled={f.related.length === 0}
              className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[12px] text-amber-200 enabled:hover:bg-amber-400/20 enabled:cursor-pointer"
            >
              {f.label}
              {f.related.length > 0 && <ChevronRight size={12} />}
            </button>
          ))}
        </div>
      ) : (
        <span key="f" className="text-emerald-300">None</span>
      ),
    ],
    [
      "AI fraud risk",
      r.ai_checked_at ? (
        <RiskBadge key="ai" level={r.ai_level} risk={r.ai_risk} />
      ) : (
        <span key="ai" className="text-bg/45">Not analyzed yet</span>
      ),
    ],
    ...(r.ai_checked_at
      ? ([
          [
            "AI reasons",
            r.ai_reasons.length ? (
              <ul key="air" className="ml-4 list-disc space-y-0.5">
                {r.ai_reasons.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              "-"
            ),
          ],
          ["AI checked", new Date(r.ai_checked_at).toLocaleString()],
        ] as [string, React.ReactNode][])
      : []),
    ["IP address", r.ip || "-"],
    ["Device fingerprint", r.fingerprint || "-"],
    ["Name", r.name || "-"],
    ["Email", r.email],
    ["Phone", r.phone || "-"],
    ["Occupation", r.occupation || "-"],
    ["Referred by", referredBy],
    ["Referrals", referralCount],
    ["How they track money", r.method || "-"],
    ["Biggest pains", r.pain.length ? r.pain.join(", ") : "-"],
    ["Spreadsheet lifespan", r.sheetlife || "-"],
    ["Bank-link comfort (1 to 5)", r.trust ?? "-"],
    ["Wanted features", r.features.length ? r.features.join(", ") : "-"],
    [
      "Other thoughts (typed)",
      (() => {
        const entries = Object.entries(r.notes || {}).filter(([, v]) => v);
        if (entries.length === 0) return "-";
        return (
          <ul key="notes" className="ml-4 list-disc space-y-1">
            {entries.map(([k, v]) => (
              <li key={k}>
                <span className="text-bg/45">{NOTE_LABELS[k] ?? k}:</span> {v}
              </li>
            ))}
          </ul>
        );
      })(),
    ],
    ["Fair price / month", r.price || "-"],
    ["What would make money less stressful", r.dream || "-"],
    ["Came from (web referrer)", r.referrer || "-"],
    ["User agent", r.user_agent || "-"],
  ];

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-ink/65 backdrop-blur-sm" aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#0d0e12] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-bg/10 px-6 py-5">
          <div className="min-w-0">
            <h2 className="font-display truncate text-xl text-bg">
              {r.name || r.email}
            </h2>
            <p className="mt-1 truncate text-[12px] text-bg/55">
              {r.name ? `${r.email} · ` : ""}
              {r.confirmation_sent ? "Confirmation sent" : "Confirmation pending"}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-bg/55 hover:text-bg">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="flex flex-col gap-4">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
                  {k}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap wrap-break-word text-sm text-bg/85">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-bg/10 px-6 py-4">
          <a href={`mailto:${r.email}`} className="text-[12px] text-bg/70 hover:text-bg">
            Reply by email
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={analyzing}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 px-3.5 py-1.5 text-[12px] font-medium text-gold hover:bg-gold/10 disabled:opacity-50"
            >
              {analyzing ? (
                <RotateCw size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              {analyzing
                ? "Analyzing…"
                : r.ai_checked_at
                ? "Re-run AI"
                : "Analyze with AI"}
            </button>
            {!r.confirmation_sent && (
              <button
                type="button"
                onClick={onResend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[12px] font-medium text-ink disabled:opacity-50"
              >
                <RotateCw size={12} className={resending ? "animate-spin" : ""} />
                {resending ? "Sending…" : "Resend"}
              </button>
            )}
          </div>
        </footer>
      </aside>
    </>
  );
}

function ClusterModal({
  title,
  rows,
  onClose,
  onOpenRow,
}: {
  title: string;
  rows: BetaResponse[];
  onClose: () => void;
  onOpenRow: (row: BetaResponse) => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm"
        aria-hidden
      />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl"
        >
          <header className="flex items-center justify-between gap-3 border-b border-bg/10 px-5 py-4">
            <div className="min-w-0">
              <h3 className="font-display truncate text-lg text-bg">{title}</h3>
              <p className="mt-0.5 text-[12px] text-bg/55">
                {rows.length} sign-up{rows.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-bg/55 hover:text-bg"
            >
              <X size={18} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-2">
            {rows.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-bg/45">
                Nothing to show.
              </p>
            ) : (
              rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => onOpenRow(row)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-bg/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-bg/90">{row.email}</div>
                    <div className="mt-0.5 truncate text-[12px] text-bg/50">
                      {row.name || "No name"} · {fmtDate(row.created_at)}
                    </div>
                  </div>
                  {row.verified ? (
                    <BadgeCheck size={15} className="shrink-0 text-emerald-300" />
                  ) : (
                    <span className="shrink-0 text-[11px] text-bg/40">Unverified</span>
                  )}
                  <ChevronRight size={14} className="shrink-0 text-bg/40" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ReferrerModal({
  referrer,
  data,
  onClose,
  onOpenRow,
  onViewProfile,
}: {
  referrer: BetaResponse;
  data: {
    enriched: { row: BetaResponse; flags: DetailedFlag[] }[];
    count: number;
    flaggedN: number;
    highRiskN: number;
    valid: boolean;
    amount: number;
  };
  onClose: () => void;
  onOpenRow: (row: BetaResponse) => void;
  onViewProfile: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm"
        aria-hidden
      />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Referrer detail"
          className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl"
        >
          <header className="border-b border-bg/10 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display truncate text-lg text-bg">
                  {referrer.name || referrer.email}
                </h3>
                <p className="mt-0.5 truncate text-[12px] text-bg/50">
                  {referrer.email}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 text-bg/55 hover:text-bg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] " +
                  (data.valid
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-red-400/30 bg-red-400/10 text-red-200")
                }
              >
                {data.valid ? (
                  <BadgeCheck size={13} />
                ) : (
                  <AlertTriangle size={13} />
                )}
                {data.valid ? "Looks valid" : "Suspicious referrals"}
              </span>
              <span className="rounded-full bg-bg/10 px-2.5 py-1 text-[12px] text-bg/70">
                {data.count} invited
              </span>
              {data.flaggedN > 0 && (
                <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[12px] text-amber-200">
                  {data.flaggedN} flagged
                </span>
              )}
              <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[12px] text-gold">
                {naira(data.amount)} earned
              </span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-2">
            {data.enriched.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-bg/45">
                No invitees yet.
              </p>
            ) : (
              data.enriched.map(({ row, flags }) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => onOpenRow(row)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-bg/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-bg/90">{row.email}</div>
                    <div className="mt-0.5 truncate text-[12px] text-bg/50">
                      {row.name || "No name"} · {fmtDate(row.created_at)}
                    </div>
                  </div>
                  {row.ai_checked_at && (
                    <RiskBadge level={row.ai_level} risk={row.ai_risk} />
                  )}
                  {flags.length > 0 && (
                    <span
                      className="inline-flex items-center gap-0.5 text-[12px] text-amber-300"
                      title={flags.map((f) => f.label).join(", ")}
                    >
                      <AlertTriangle size={13} /> {flags.length}
                    </span>
                  )}
                  {row.verified && (
                    <BadgeCheck size={15} className="shrink-0 text-emerald-300" />
                  )}
                  <ChevronRight size={14} className="shrink-0 text-bg/40" />
                </button>
              ))
            )}
          </div>
          <footer className="border-t border-bg/10 px-5 py-3">
            <button
              type="button"
              onClick={onViewProfile}
              className="text-[12px] text-bg/70 hover:text-bg"
            >
              Open full profile
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}

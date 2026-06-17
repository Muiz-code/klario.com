"use client";

import { useMemo, useState, useTransition } from "react";
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
} from "lucide-react";
import type { BetaResponse } from "@/lib/db/betaResponses";
import { InfoModal } from "../_components/Modal";

export type Summary = {
  total: number;
  spreadsheetPct: number;
  avgTrust: number;
  topFeatures: { label: string; count: number }[];
};

type SortKey = "created_at" | "name" | "email" | "trust" | "confirmation_sent";

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
  const [pending, startTransition] = useTransition();

  const byId = useMemo(
    () => new Map(responses.map((r) => [r.id, r])),
    [responses]
  );
  // Referral counts — verified only (unverified referrals don't count).
  const referralCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of responses) {
      if (r.referred_by_id && r.verified) {
        m.set(r.referred_by_id, (m.get(r.referred_by_id) ?? 0) + 1);
      }
    }
    return m;
  }, [responses]);
  // How many responses share each IP (clustering signal).
  const ipCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of responses) if (r.ip) m.set(r.ip, (m.get(r.ip) ?? 0) + 1);
    return m;
  }, [responses]);

  const flagsFor = (r: BetaResponse): string[] => {
    const f: string[] = [];
    const ipN = r.ip ? ipCounts.get(r.ip) ?? 0 : 0;
    if (ipN > 2) f.push(`Shared IP (${ipN} sign-ups)`);
    if (r.referred_by_id) {
      const ref = byId.get(r.referred_by_id);
      if (ref && ref.referred_by_id === r.id) f.push("Mutual referral");
    }
    return f;
  };
  const flaggedCount = responses.filter((r) => flagsFor(r).length > 0).length;

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
    }
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = responses.filter((r) => {
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
  }, [responses, q, sort]);

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
  const highRiskCount = responses.filter((r) => r.ai_level === "high").length;

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
      "ref", "created_at", "name", "email", "phone", "method", "pain",
      "sheetlife", "trust", "features", "price", "dream", "confirmation_sent",
      "verified", "verified_at", "ip", "referred_by_ref", "ai_risk", "ai_level",
      "ai_reasons", "user_agent", "referrer",
    ];
    const esc = (v: unknown) => {
      const s =
        v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = responses.map((r) =>
      [
        r.ref, r.created_at, r.name, r.email, r.phone, r.method, r.pain,
        r.sheetlife, r.trust, r.features, r.price, r.dream, r.confirmation_sent,
        r.verified, r.verified_at, r.ip, r.referred_by_ref, r.ai_risk, r.ai_level,
        r.ai_reasons, r.user_agent, r.referrer,
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 rounded-xl border border-bg/15 bg-bg/4 px-3 py-2 text-sm">
          <Search size={14} className="text-bg/45" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email, name, or ref"
            className="w-full min-w-0 bg-transparent text-bg placeholder:text-bg/40 focus:outline-none sm:w-72"
          />
        </label>
        {flaggedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[12px] text-amber-200">
            <AlertTriangle size={13} /> {flaggedCount} flagged
          </span>
        )}
        {highRiskCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-[12px] text-red-200">
            <Sparkles size={13} /> {highRiskCount} high AI risk
          </span>
        )}
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
          onClick={exportCsv}
          disabled={!responses.length}
          className="rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:border-bg/30 hover:text-bg disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-bg/10">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b border-bg/10 bg-bg/4 text-left text-[11px] uppercase tracking-[0.14em] text-bg/45">
            <tr>
              <SortTh label="Date" k="created_at" sort={sort} onSort={toggleSort} />
              <SortTh label="Name" k="name" sort={sort} onSort={toggleSort} />
              <SortTh label="Email" k="email" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Pain</th>
              <SortTh label="Trust" k="trust" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Ref</th>
              <SortTh label="Sent" k="confirmation_sent" sort={sort} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium">AI risk</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-10 text-center text-bg/45">
                  No responses yet.
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
          flags={flagsFor(open)}
          onClose={() => setOpen(null)}
          onResend={() => resend(open)}
          resending={busy === open.id || pending}
          onAnalyze={() => scanOne(open.id)}
          analyzing={scanning.has(open.id)}
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
}: {
  r: BetaResponse;
  referrer: BetaResponse | null;
  referralCount: number;
  flags: string[];
  onClose: () => void;
  onResend: () => void;
  resending: boolean;
  onAnalyze: () => void;
  analyzing: boolean;
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
        <span key="f" className="text-amber-300">{flags.join(" · ")}</span>
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
    ["Name", r.name || "-"],
    ["Email", r.email],
    ["Phone", r.phone || "-"],
    ["Referred by", referredBy],
    ["Verified referrals", referralCount],
    ["How they track money", r.method || "-"],
    ["Biggest pains", r.pain.length ? r.pain.join(", ") : "-"],
    ["Spreadsheet lifespan", r.sheetlife || "-"],
    ["Bank-link comfort (1 to 5)", r.trust ?? "-"],
    ["Wanted features", r.features.length ? r.features.join(", ") : "-"],
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
            <h2 className="font-display truncate text-xl text-bg">{r.email}</h2>
            <p className="mt-1 text-[12px] text-bg/55">
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
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-bg/85">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-bg/10 px-6 py-4">
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

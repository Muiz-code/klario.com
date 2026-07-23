"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Search,
  Download,
  ChevronDown,
  Smartphone,
  Trophy,
  Activity,
  TrendingUp,
  Sparkles,
  Mail,
} from "lucide-react";
import type { AnchorResponse } from "@/lib/db/anchorClub";
import type {
  AppProfile,
  ActivityCounts,
  DeletedAccount,
} from "@/lib/db/appProfiles";
import { SendEmailPanel } from "./SendEmailPanel";

export type AnchorSummary = {
  total: number;
  topAreas: { label: string; count: number }[];
  topChallenge: string;
  institutions: number;
  /** How many applicants have a matching app account (by email). */
  onApp: number;
  /** Whether the app DB is wired up at all (env configured). */
  appLinked: boolean;
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

// snake_case / lower values from the app DB -> "Title Case" for display.
function titleCase(v: string | null | undefined): string {
  if (!v) return "—";
  return v.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// The app's plan values map to user-facing tier names (matches the mobile app:
// free = Free, premium = Money Manager, pro = Financial Executive).
function planLabel(plan: string | null | undefined): string {
  switch (plan) {
    case "premium":
      return "Money Manager";
    case "pro":
      return "Financial Executive";
    case "free":
      return "Free";
    default:
      return plan ? titleCase(plan) : "—";
  }
}

function verifyLabel(kyc: string | null | undefined): string {
  switch (kyc) {
    case "verified":
      return "Verified";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return "Not verified";
  }
}

// ── Activity ("tasks done") helpers ──
function activityTotal(a?: ActivityCounts): number {
  if (!a) return 0;
  return (
    a.savingsGoals + a.debts + a.billsPaid + a.linkedBanks + a.transactions + a.scheduledTransfers
  );
}
function featuresUsed(a?: ActivityCounts): number {
  if (!a) return 0;
  return [a.savingsGoals, a.debts, a.billsPaid, a.linkedBanks, a.transactions, a.scheduledTransfers].filter(
    (n) => n > 0
  ).length;
}
// Composite engagement: financial health + activity + breadth + consistency.
function engagement(app: AppProfile, a?: ActivityCounts): number {
  return (
    (app.kairo_score ?? 0) +
    app.activeDays +
    (app.streak ?? 0) * 2 +
    activityTotal(a) +
    featuresUsed(a) * 3
  );
}

function csvCell(v: string): string {
  const s = (v ?? "").replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

type Tab = "registrations" | "leaderboard";

export function AnchorResponsesView({
  responses,
  summary,
  appProfiles,
  appActivity,
  appDeleted,
}: {
  responses: AnchorResponse[];
  summary: AnchorSummary;
  appProfiles: Record<string, AppProfile>;
  appActivity: Record<string, ActivityCounts>;
  appDeleted: Record<string, DeletedAccount>;
}) {
  const [tab, setTab] = useState<Tab>("registrations");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [composerOpen, setComposerOpen] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return responses;
    return responses.filter((r) => {
      const app = appProfiles[r.id];
      return [
        r.name,
        r.email,
        r.phone,
        r.institution,
        r.level,
        r.area,
        r.challenge,
        r.why,
        r.ref, // KAC-XXXX-XXXX
        app?.klario_id, // KLR-XXXX-XXXX
      ]
        .map((v) => (v ?? "").toLowerCase())
        .some((v) => v.includes(needle));
    });
  }, [responses, q, appProfiles]);

  // Leaderboard: on-app anchors ranked by composite engagement, plus the three
  // dimension leaders (most active / growing financially / using the app right).
  const board = useMemo(() => {
    const entries = responses
      .map((r) => {
        const app = appProfiles[r.id];
        if (!app) return null;
        const activity = appActivity[r.id];
        return {
          id: r.id,
          name: r.name || r.email.split("@")[0],
          klario_id: app.klario_id,
          score: app.kairo_score ?? 0,
          streak: app.streak ?? 0,
          activeDays: app.activeDays,
          tasks: activityTotal(activity),
          features: featuresUsed(activity),
          plan: planLabel(app.plan),
          engagement: engagement(app, activity),
        };
      })
      .filter(Boolean) as {
      id: string;
      name: string;
      klario_id: string | null;
      score: number;
      streak: number;
      activeDays: number;
      tasks: number;
      features: number;
      plan: string;
      engagement: number;
    }[];

    const ranked = [...entries].sort((a, b) => b.engagement - a.engagement);
    const topBy = <K extends keyof (typeof entries)[number]>(k: K) =>
      entries.length
        ? [...entries].sort((a, b) => (b[k] as number) - (a[k] as number))[0]
        : null;

    return {
      ranked,
      mostActive: topBy("activeDays"),
      growing: topBy("score"),
      usingRight: topBy("features"),
    };
  }, [responses, appProfiles, appActivity]);

  const toggleSel = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allVisibleSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });
  const recipients = responses
    .filter((r) => selected.has(r.id))
    .map((r) => ({
      id: r.id,
      name: r.name || r.email.split("@")[0],
      email: r.email,
      ref: r.ref || "",
    }));

  const exportCsv = () => {
    const head = [
      "Date", "Ref", "Name", "Email", "Phone", "Institution", "Level",
      "Area", "Challenge", "Excites", "Why", "Pledged", "Guidelines",
      "Klario ID", "Kairo score", "Streak", "Active days", "Tasks done",
      "Features used", "Plan", "Verification",
    ];
    const lines = responses.map((r) => {
      const app = appProfiles[r.id];
      const act = appActivity[r.id];
      return [
        fmtDate(r.created_at),
        r.ref ?? "",
        r.name ?? "",
        r.email,
        r.phone ?? "",
        r.institution ?? "",
        r.level || r.notes?.level || "",
        r.area || r.notes?.area || "",
        r.challenge || r.notes?.challenge || "",
        r.excites.join("; "),
        r.why ?? "",
        r.pledge ? "yes" : "no",
        r.guidelines ? "yes" : "no",
        app?.klario_id ?? "",
        app?.kairo_score != null ? String(app.kairo_score) : "",
        app?.streak != null ? String(app.streak) : "",
        app ? String(app.activeDays) : "",
        app ? String(activityTotal(act)) : "",
        app ? `${featuresUsed(act)}/6` : "",
        app ? planLabel(app.plan) : "",
        app ? verifyLabel(app.kyc_status) : "",
      ]
        .map(csvCell)
        .join(",");
    });
    const blob = new Blob([[head.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anchor-club-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tile = "rounded-xl border border-bg/10 bg-bg/[0.03] px-5 py-4";
  const tabBtn = (t: Tab) =>
    `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
      tab === t ? "bg-gold/12 text-gold" : "text-bg/55 hover:text-bg"
    }`;

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-bg/10 bg-bg/[0.02] p-1 self-start">
        <button type="button" className={tabBtn("registrations")} onClick={() => setTab("registrations")}>
          Registrations
        </button>
        <button type="button" className={tabBtn("leaderboard")} onClick={() => setTab("leaderboard")}>
          <span className="inline-flex items-center gap-1.5">
            <Trophy size={14} /> Leaderboard
          </span>
        </button>
      </div>

      {tab === "leaderboard" ? (
        <Leaderboard board={board} appLinked={summary.appLinked} onApp={summary.onApp} />
      ) : (
        <>
          {/* Summary */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className={tile}>
              <p className="font-display text-3xl text-gold">{summary.total}</p>
              <p className="mt-1 text-[13px] text-bg/55">Total registrations</p>
            </div>
            {summary.appLinked ? (
              <div className={tile}>
                <p className="font-display text-3xl text-gold">{summary.onApp}</p>
                <p className="mt-1 text-[13px] text-bg/55">On the app (by email)</p>
              </div>
            ) : (
              <div className={tile}>
                <p className="font-display text-3xl text-gold">{summary.institutions}</p>
                <p className="mt-1 text-[13px] text-bg/55">Distinct institutions</p>
              </div>
            )}
            <div className={tile}>
              <p className="truncate font-display text-lg text-bg" title={summary.topAreas[0]?.label}>
                {summary.topAreas[0]?.label ?? "—"}
              </p>
              <p className="mt-1 text-[13px] text-bg/55">Top area of interest</p>
            </div>
            <div className={tile}>
              <p className="truncate font-display text-lg text-bg" title={summary.topChallenge}>
                {summary.topChallenge}
              </p>
              <p className="mt-1 text-[13px] text-bg/55">Biggest challenge</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bg/40" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, ref, Klario ID..."
                className="w-full rounded-lg border border-bg/15 bg-bg/[0.03] py-2 pl-9 pr-3 text-sm text-bg placeholder:text-bg/40 focus:border-gold/50 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={exportCsv}
              disabled={responses.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-bg/15 px-3.5 py-2 text-sm text-bg/80 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-40"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>

          {/* Selection toolbar */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gold/25 bg-gold/[0.06] px-4 py-2.5 text-sm">
              <span className="text-gold">
                {selected.size} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="text-[13px] text-bg/60 hover:text-bg"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-[13px] font-semibold text-ink transition-transform hover:scale-[1.01]"
                >
                  <Mail size={14} /> Email selected
                </button>
              </div>
            </div>
          )}

          {sendResult && (
            <div className="flex items-center justify-between rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-[13px] text-emerald-200">
              <span>{sendResult}</span>
              <button
                type="button"
                onClick={() => setSendResult(null)}
                className="text-emerald-200/70 hover:text-emerald-100"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Table */}
          {rows.length === 0 ? (
            <div className="rounded-xl border border-bg/10 bg-bg/[0.02] p-8 text-center text-sm text-bg/50">
              {responses.length === 0 ? "No registrations yet." : "No matches."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-bg/10">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-bg/10 bg-bg/[0.03] text-[11px] uppercase tracking-[0.12em] text-bg/50">
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        checked={allVisibleSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 accent-gold"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Institution</th>
                    <th className="px-4 py-3 font-medium">Area</th>
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Klario ID</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const expanded = open === r.id;
                    const app = appProfiles[r.id];
                    const act = appActivity[r.id];
                    const del = appDeleted[r.id];
                    return (
                      <Fragment key={r.id}>
                        <tr
                          onClick={() => setOpen(expanded ? null : r.id)}
                          className="cursor-pointer border-b border-bg/[0.06] last:border-b-0 hover:bg-bg/[0.02]"
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              aria-label={`Select ${r.name || r.email}`}
                              checked={selected.has(r.id)}
                              onChange={() => toggleSel(r.id)}
                              className="h-4 w-4 accent-gold"
                            />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-bg/55">{fmtDate(r.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-bg">{r.name || "—"}</div>
                            <div className="text-[12px] text-bg/45">{r.email}</div>
                          </td>
                          <td className="px-4 py-3 text-bg/70">{r.institution || "—"}</td>
                          <td className="px-4 py-3 text-bg/70">{r.area || r.notes?.area || "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-bg/70">
                            {r.ref || "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {app?.klario_id ? (
                              <span className="inline-flex flex-col">
                                <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-gold">
                                  <Smartphone size={12} /> {app.klario_id}
                                </span>
                                {del && (
                                  <span className="mt-0.5 text-[11px] text-amber-300/80">
                                    Rejoined · deleted before
                                  </span>
                                )}
                              </span>
                            ) : del ? (
                              <span className="text-[12px] text-amber-300/90">
                                Deleted account
                                {del.deletion_count > 1 ? ` ×${del.deletion_count}` : ""}
                              </span>
                            ) : summary.appLinked ? (
                              <span className="text-[12px] text-bg/35">Not on app</span>
                            ) : (
                              <span className="text-[12px] text-bg/30">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-bg/40">
                            <ChevronDown
                              size={16}
                              className={"inline transition-transform " + (expanded ? "rotate-180" : "")}
                            />
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-b border-bg/[0.06] bg-bg/[0.02]">
                            <td colSpan={8} className="px-4 py-5">
                              <div className="grid gap-5 md:grid-cols-2">
                                <Detail label="Phone (WhatsApp)" value={r.phone || "—"} />
                                <Detail label="Level" value={r.level || r.notes?.level || "—"} />
                                <Detail label="Anchor reference" value={r.ref || "—"} mono />
                                <Detail
                                  label="Challenge"
                                  value={r.challenge || r.notes?.challenge || "—"}
                                />
                                <Detail label="Why they want to join" value={r.why || "—"} full />
                                <div className="md:col-span-2">
                                  <p className="text-[11px] uppercase tracking-[0.12em] text-bg/40">
                                    What excites them
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {r.excites.length ? (
                                      r.excites.map((e) => (
                                        <span
                                          key={e}
                                          className="rounded-full border border-gold/25 bg-gold/[0.07] px-2.5 py-1 text-[12px] text-gold"
                                        >
                                          {e}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[13px] text-bg/50">—</span>
                                    )}
                                  </div>
                                </div>
                                <Detail
                                  label="Commitment"
                                  value={`Pledged: ${r.pledge ? "yes" : "no"} · Guidelines: ${r.guidelines ? "yes" : "no"}`}
                                />

                                {/* App performance (joined by email) */}
                                <div className="md:col-span-2">
                                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
                                    <Smartphone size={12} /> App performance
                                  </p>
                                  {app ? (
                                    <div className="grid gap-4 rounded-lg border border-gold/15 bg-gold/[0.04] p-4 sm:grid-cols-2 lg:grid-cols-3">
                                      <Mini label="Klario ID" value={app.klario_id || "—"} mono />
                                      <Mini
                                        label="Kairo score"
                                        value={app.kairo_score != null ? `${app.kairo_score} / 100` : "—"}
                                      />
                                      <Mini
                                        label="Streak"
                                        value={
                                          app.streak != null
                                            ? `${app.streak} day${app.streak === 1 ? "" : "s"}`
                                            : "—"
                                        }
                                      />
                                      <Mini label="Plan" value={planLabel(app.plan)} />
                                      <Mini label="Spending type" value={titleCase(app.personality)} />
                                      <Mini label="Verification" value={verifyLabel(app.kyc_status)} />
                                      <Mini label="Account type" value={titleCase(app.account_type)} />
                                      <Mini label="Active days" value={String(app.activeDays)} />
                                      <Mini
                                        label="On app since"
                                        value={app.created_at ? fmtDate(app.created_at) : "—"}
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-[13px] text-bg/50">
                                      {summary.appLinked
                                        ? "No app account found for this email yet."
                                        : "App link not configured (set APP_SUPABASE_URL / APP_SUPABASE_SERVICE_ROLE_KEY)."}
                                    </p>
                                  )}
                                </div>

                                {/* Tasks done in the app */}
                                {app && (
                                  <div className="md:col-span-2">
                                    <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
                                      <Activity size={12} /> Tasks done in the app
                                    </p>
                                    <div className="grid gap-4 rounded-lg border border-bg/10 bg-bg/[0.03] p-4 sm:grid-cols-3 lg:grid-cols-6">
                                      <Mini label="Savings goals" value={String(act?.savingsGoals ?? 0)} />
                                      <Mini label="Debts tracked" value={String(act?.debts ?? 0)} />
                                      <Mini label="Bills paid" value={String(act?.billsPaid ?? 0)} />
                                      <Mini label="Banks linked" value={String(act?.linkedBanks ?? 0)} />
                                      <Mini label="Transactions" value={String(act?.transactions ?? 0)} />
                                      <Mini label="Scheduled" value={String(act?.scheduledTransfers ?? 0)} />
                                    </div>
                                  </div>
                                )}

                                {/* Account deletion tombstone */}
                                {del && (
                                  <div className="md:col-span-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] p-4">
                                    <p className="text-[11px] uppercase tracking-[0.12em] text-amber-300/80">
                                      Account deletion
                                    </p>
                                    <p className="mt-1.5 text-[13px] leading-relaxed text-bg/80">
                                      Deleted their Klario app account
                                      {del.deletion_count > 1 ? ` ${del.deletion_count} times` : ""}
                                      {del.last_deleted_at ? `, last on ${fmtDate(del.last_deleted_at)}` : ""}.{" "}
                                      {app
                                        ? "They've since signed up again — the account above is a fresh start."
                                        : "No active app account right now."}
                                      {del.klario_id ? ` Prior Klario ID: ${del.klario_id}.` : ""}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {composerOpen && (
        <SendEmailPanel
          recipients={recipients}
          onClose={() => setComposerOpen(false)}
          onSent={(sent, failed) => {
            setComposerOpen(false);
            setSelected(new Set());
            setSendResult(
              `Sent to ${sent}${failed ? ` · ${failed} failed` : ""}.`
            );
          }}
        />
      )}
    </div>
  );
}

// ── Leaderboard tab ──
type BoardEntry = {
  id: string;
  name: string;
  klario_id: string | null;
  score: number;
  streak: number;
  activeDays: number;
  tasks: number;
  features: number;
  plan: string;
  engagement: number;
};

function Leaderboard({
  board,
  appLinked,
  onApp,
}: {
  board: {
    ranked: BoardEntry[];
    mostActive: BoardEntry | null;
    growing: BoardEntry | null;
    usingRight: BoardEntry | null;
  };
  appLinked: boolean;
  onApp: number;
}) {
  if (!appLinked) {
    return (
      <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-6 text-sm text-amber-200/90">
        Connect the app database (APP_SUPABASE_URL / APP_SUPABASE_SERVICE_ROLE_KEY) to
        rank anchors by their app usage.
      </div>
    );
  }
  if (board.ranked.length === 0) {
    return (
      <div className="rounded-xl border border-bg/10 bg-bg/[0.02] p-8 text-center text-sm text-bg/50">
        No anchors are on the app yet, so there&apos;s nothing to rank.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] text-bg/55">
        Ranking the {onApp} anchor{onApp === 1 ? "" : "s"} who use the app, by a blend of
        financial health, activity, feature breadth and consistency.
      </p>

      {/* Dimension leaders */}
      <div className="grid gap-3 sm:grid-cols-3">
        <LeaderCard
          icon={<Activity size={15} />}
          title="Most active"
          entry={board.mostActive}
          metric={(e) => `${e.activeDays} active days`}
        />
        <LeaderCard
          icon={<TrendingUp size={15} />}
          title="Growing financially"
          entry={board.growing}
          metric={(e) => `${e.score} / 100 Kairo score`}
        />
        <LeaderCard
          icon={<Sparkles size={15} />}
          title="Using the app right"
          entry={board.usingRight}
          metric={(e) => `${e.features}/6 features used`}
        />
      </div>

      {/* Full ranking */}
      <div className="overflow-x-auto rounded-xl border border-bg/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-bg/10 bg-bg/[0.03] text-[11px] uppercase tracking-[0.12em] text-bg/50">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Streak</th>
              <th className="px-4 py-3 font-medium">Active days</th>
              <th className="px-4 py-3 font-medium">Tasks</th>
              <th className="px-4 py-3 font-medium">Features</th>
              <th className="px-4 py-3 font-medium">Plan</th>
            </tr>
          </thead>
          <tbody>
            {board.ranked.map((e, i) => (
              <tr key={e.id} className="border-b border-bg/[0.06] last:border-b-0">
                <td className="px-4 py-3">
                  <span
                    className={
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold " +
                      (i < 3 ? "bg-gold/15 text-gold" : "text-bg/50")
                    }
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-bg">{e.name}</div>
                  {e.klario_id && (
                    <div className="font-mono text-[11px] text-bg/45">{e.klario_id}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-bg/80">{e.score}</td>
                <td className="px-4 py-3 text-bg/70">{e.streak}</td>
                <td className="px-4 py-3 text-bg/70">{e.activeDays}</td>
                <td className="px-4 py-3 text-bg/70">{e.tasks}</td>
                <td className="px-4 py-3 text-bg/70">{e.features}/6</td>
                <td className="px-4 py-3 text-bg/70">{e.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaderCard({
  icon,
  title,
  entry,
  metric,
}: {
  icon: React.ReactNode;
  title: string;
  entry: BoardEntry | null;
  metric: (e: BoardEntry) => string;
}) {
  return (
    <div className="rounded-xl border border-gold/15 bg-gold/[0.04] px-5 py-4">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
        {icon} {title}
      </p>
      {entry ? (
        <>
          <p className="mt-2 truncate font-display text-lg text-bg" title={entry.name}>
            {entry.name}
          </p>
          <p className="text-[12px] text-bg/55">{metric(entry)}</p>
        </>
      ) : (
        <p className="mt-2 text-[13px] text-bg/45">—</p>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  full,
  mono,
}: {
  label: string;
  value: string;
  full?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : undefined}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-bg/40">{label}</p>
      <p className={"mt-1.5 text-[13.5px] leading-relaxed text-bg/80" + (mono ? " font-mono" : "")}>
        {value}
      </p>
    </div>
  );
}

function Mini({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-bg/40">{label}</p>
      <p className={"mt-1 text-[13px] text-bg/85" + (mono ? " font-mono text-gold" : "")}>{value}</p>
    </div>
  );
}

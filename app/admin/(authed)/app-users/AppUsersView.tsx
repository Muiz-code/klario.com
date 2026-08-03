"use client";

import { useMemo, useState } from "react";
import { Search, Download, ChevronRight, Smartphone } from "lucide-react";
import type { AppUserRow, ContactSource } from "@/lib/db/appUsers";
import { CONTACT_SOURCES } from "@/lib/db/appUsers";
import { presenceOf } from "@/lib/db/appFinance";
import {
  ACCOUNT_TYPES,
  PresencePill,
  accountTypeLabel,
  planLabel,
  verifyLabel,
} from "../_components/AppUserPanels";
import { AppUserModal } from "./AppUserModal";

type OnApp = "all" | "yes" | "no";
type Activity = "all" | "today" | "week" | "month" | "dormant" | "never";

/** Presence from the profile alone — the list doesn't load the finance module. */
function presenceFromDay(lastActiveDay: string | null) {
  return presenceOf({ lastActiveDay, lastSeenAt: null });
}

/** How many days since they last opened the app; Infinity when never. */
function daysSince(lastActiveDay: string | null): number {
  if (!lastActiveDay) return Infinity;
  const ms = Date.now() - Date.parse(`${lastActiveDay}T00:00:00Z`);
  return Math.floor(ms / 86_400_000);
}

function csvCell(v: string): string {
  const s = (v ?? "").replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

export function AppUsersView({
  rows,
  onApp,
  appLinked,
}: {
  rows: AppUserRow[];
  onApp: number;
  appLinked: boolean;
}) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<ContactSource | "all">("all");
  const [onAppFilter, setOnAppFilter] = useState<OnApp>("all");
  const [activity, setActivity] = useState<Activity>("all");
  const [plan, setPlan] = useState("all");
  const [acctType, setAcctType] = useState("all");
  const [open, setOpen] = useState<AppUserRow | null>(null);

  const plans = useMemo(
    () => [...new Set(rows.map((r) => r.app?.plan).filter(Boolean))].sort() as string[],
    [rows]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (source !== "all" && !r.sources.includes(source)) return false;
      if (onAppFilter === "yes" && !r.app) return false;
      if (onAppFilter === "no" && r.app) return false;
      if (plan !== "all" && r.app?.plan !== plan) return false;
      if (acctType !== "all") {
        // "unset" catches app users who never picked a type in onboarding.
        const t = r.app?.account_type ?? null;
        if (acctType === "unset" ? !!t : t !== acctType) return false;
        if (!r.app) return false;
      }

      if (activity !== "all") {
        const d = daysSince(r.app?.lastActiveDay ?? null);
        if (activity === "never" && d !== Infinity) return false;
        if (activity === "today" && d !== 0) return false;
        if (activity === "week" && !(d <= 7)) return false;
        if (activity === "month" && !(d <= 30)) return false;
        if (activity === "dormant" && !(d > 30)) return false;
      }

      if (!needle) return true;
      return [r.email, r.name, r.app?.klario_id]
        .map((v) => (v ?? "").toLowerCase())
        .some((v) => v.includes(needle));
    });
  }, [rows, q, source, onAppFilter, activity, plan, acctType]);

  const exportCsv = () => {
    const head = [
      "Email", "Name", "Sources", "First seen", "Audience status", "Klario ID",
      "Kairo score", "Streak", "Active days", "Last active", "Plan", "Verification",
      "Account type",
    ];
    const lines = filtered.map((r) =>
      [
        r.email,
        r.name ?? "",
        r.sources.join("; "),
        r.firstSeen ? new Date(r.firstSeen).toISOString().slice(0, 10) : "",
        r.status ?? "",
        r.app?.klario_id ?? "",
        r.app?.kairo_score != null ? String(r.app.kairo_score) : "",
        r.app?.streak != null ? String(r.app.streak) : "",
        r.app ? String(r.app.activeDays) : "",
        r.app?.lastActiveDay ?? "",
        r.app ? planLabel(r.app.plan) : "",
        r.app ? verifyLabel(r.app.kyc_status) : "",
        r.app ? accountTypeLabel(r.app.account_type) : "",
      ]
        .map(csvCell)
        .join(",")
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `app-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const select =
    "rounded-lg border border-bg/15 bg-bg/[0.03] px-2.5 py-2 text-[13px] text-bg/80 scheme-dark focus:border-gold/50 focus:outline-none";
  // The native dropdown popup is drawn by the OS on a white background, so the
  // options need their own dark background or they're unreadable.
  const opt = "bg-[#16181d] text-bg";
  const tile = "rounded-xl border border-bg/10 bg-bg/[0.03] px-5 py-4";

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={tile}>
          <p className="font-display text-3xl text-bg">{rows.length.toLocaleString()}</p>
          <p className="mt-1 text-[13px] text-bg/55">Contacts across all sources</p>
        </div>
        <div className={tile}>
          <p className="font-display text-3xl text-gold">{onApp.toLocaleString()}</p>
          <p className="mt-1 text-[13px] text-bg/55">
            On the app{rows.length > 0 && ` · ${Math.round((onApp / rows.length) * 100)}%`}
          </p>
        </div>
        <div className={tile}>
          <p className="font-display text-3xl text-bg">
            {rows.filter((r) => daysSince(r.app?.lastActiveDay ?? null) <= 7).length}
          </p>
          <p className="mt-1 text-[13px] text-bg/55">Active in the last 7 days</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bg/40" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email, name or Klario ID…"
            className="w-full rounded-lg border border-bg/15 bg-bg/[0.03] py-2 pl-9 pr-3 text-sm text-bg placeholder:text-bg/40 focus:border-gold/50 focus:outline-none"
          />
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as ContactSource | "all")}
          className={select}
        >
          <option value="all" className={opt}>All sources</option>
          {CONTACT_SOURCES.map((s) => (
            <option key={s.key} value={s.key} className={opt}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={onAppFilter}
          onChange={(e) => setOnAppFilter(e.target.value as OnApp)}
          className={select}
        >
          <option value="all" className={opt}>On app: any</option>
          <option value="yes" className={opt}>On the app</option>
          <option value="no" className={opt}>Not on the app</option>
        </select>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value as Activity)}
          className={select}
        >
          <option value="all" className={opt}>Any activity</option>
          <option value="today" className={opt}>Active today</option>
          <option value="week" className={opt}>Last 7 days</option>
          <option value="month" className={opt}>Last 30 days</option>
          <option value="dormant" className={opt}>Dormant (30+ days)</option>
          <option value="never" className={opt}>Never opened</option>
        </select>
        <select
          value={acctType}
          onChange={(e) => setAcctType(e.target.value)}
          className={select}
        >
          <option value="all" className={opt}>Any account type</option>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.key} value={t.key} className={opt}>
              {t.label}
            </option>
          ))}
          <option value="unset" className={opt}>Not set</option>
        </select>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={select}>
          <option value="all" className={opt}>Any plan</option>
          {plans.map((p) => (
            <option key={p} value={p} className={opt}>
              {planLabel(p)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-bg/15 px-3.5 py-2 text-sm text-bg/80 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-40"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      <p className="text-[12px] text-bg/40">
        {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} contacts
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-bg/10 bg-bg/[0.02] p-8 text-center text-sm text-bg/50">
          {rows.length === 0 ? "No contacts yet." : "No matches."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-bg/10">
          <table className="w-full min-w-[1060px] text-left text-sm">
            <thead>
              <tr className="border-b border-bg/10 bg-bg/[0.03] text-[11px] uppercase tracking-[0.12em] text-bg/50">
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Klario ID</th>
                <th className="px-4 py-3 font-medium">Account type</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Streak</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((r) => (
                <tr
                  key={r.email}
                  onClick={() => setOpen(r)}
                  className="cursor-pointer border-b border-bg/[0.06] last:border-b-0 hover:bg-bg/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-bg">{r.name || "—"}</div>
                    <div className="text-[12px] text-bg/45">{r.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.sources.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-bg/12 px-2 py-0.5 text-[11px] text-bg/55"
                        >
                          {CONTACT_SOURCES.find((c) => c.key === s)?.label ?? s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {r.app?.klario_id ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-gold">
                        <Smartphone size={12} /> {r.app.klario_id}
                      </span>
                    ) : r.deleted ? (
                      <span className="text-[12px] text-amber-300/90">Deleted account</span>
                    ) : appLinked ? (
                      <span className="text-[12px] text-bg/30">Not on app</span>
                    ) : (
                      <span className="text-[12px] text-bg/25">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {r.app ? (
                      <span
                        className={
                          "rounded-full border px-2 py-0.5 text-[11px] " +
                          (r.app.account_type === "sme"
                            ? "border-blue-400/30 bg-blue-400/10 text-blue-200"
                            : r.app.account_type === "solo_founder"
                              ? "border-gold/30 bg-gold/[0.08] text-gold"
                              : r.app.account_type === "personal"
                                ? "border-bg/15 bg-bg/[0.03] text-bg/65"
                                : "border-bg/10 text-bg/30")
                        }
                      >
                        {accountTypeLabel(r.app.account_type)}
                      </span>
                    ) : (
                      <span className="text-[12px] text-bg/25">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-bg/70">{r.app?.kairo_score ?? "—"}</td>
                  <td className="px-4 py-3 text-bg/70">{r.app?.streak ?? "—"}</td>
                  <td className="px-4 py-3 text-bg/70">
                    {r.app ? planLabel(r.app.plan) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {r.app ? (
                      <PresencePill presence={presenceFromDay(r.app.lastActiveDay)} />
                    ) : (
                      <span className="text-[12px] text-bg/25">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-bg/40">
                    <ChevronRight size={16} className="inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 500 && (
            <p className="border-t border-bg/10 px-4 py-2.5 text-[12px] text-bg/40">
              Showing the first 500 — narrow the filters to see the rest. Export CSV
              includes all {filtered.length.toLocaleString()}.
            </p>
          )}
        </div>
      )}

      {open && <AppUserModal row={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

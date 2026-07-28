"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Loader2, Download, Search, AlertTriangle, CalendarDays } from "lucide-react";

type Recipient = {
  email: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  campaigns: string[];
  lastAt: string;
};
type Report = {
  recipients: Recipient[];
  totalSends: number;
  uniqueRecipients: number;
  duplicated: number;
  days: number;
  approximate: boolean;
  asOf: string;
  error?: string;
};

type SortKey = "sent" | "opened" | "delivered" | "clicked";

export function RecipientsPanel({ focusSubject }: { focusSubject?: string | null }) {
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(15);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activeQs, setActiveQs] = useState("days=15");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("sent");

  // Arriving from an Activity row: pre-filter to that campaign's subject.
  useEffect(() => {
    if (focusSubject) setQ(focusSubject);
  }, [focusSubject]);

  const fetchReport = async (qs: string, force = false) => {
    setActiveQs(qs);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/resend-recipients?${qs}${force ? "&force=1" : ""}`,
        { cache: "no-store" }
      );
      const j = (await res.json()) as Report;
      if (res.ok) setData(j);
    } catch {
      /* keep last */
    } finally {
      setLoading(false);
    }
  };

  const pickPreset = (d: number) => {
    setDays(d);
    setFrom("");
    setTo("");
    fetchReport(`days=${d}`);
  };
  const applyRange = () => {
    if (from && to) fetchReport(`from=${from}&to=${to}`);
  };
  const isCustom = activeQs.startsWith("from=");

  useEffect(() => {
    fetchReport("days=15");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? data.recipients.filter(
          (r) =>
            r.email.includes(needle) ||
            r.campaigns.some((c) => c.toLowerCase().includes(needle))
        )
      : data.recipients;
    return [...filtered].sort((a, b) => b[sort] - a[sort]);
  }, [data, q, sort]);

  const exportCsv = () => {
    if (!data) return;
    const head = "email,times_sent,delivered,opened,clicked,bounced,campaigns,last_sent\n";
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = data.recipients
      .map((r) =>
        [r.email, r.sent, r.delivered, r.opened, r.clicked, r.bounced, r.campaigns.join(" | "), r.lastAt]
          .map(esc)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([head + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isCustom
      ? `recipients-${from}_to_${to}.csv`
      : `recipients-${days === 0 ? "today" : days + "d"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bg/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or campaign…"
            className="w-full rounded-xl border border-bg/12 bg-bg/4 py-2 pl-9 pr-3 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
          />
        </div>
        <select
          value={isCustom ? "custom" : days}
          onChange={(e) => pickPreset(Number(e.target.value))}
          className="rounded-xl border border-bg/12 bg-bg/4 px-3 py-2 text-sm text-bg scheme-dark focus:border-gold/50 focus:outline-none"
        >
          {isCustom && (
            <option value="custom" className="bg-[#16181d]">
              Custom range
            </option>
          )}
          {[0, 7, 15, 30, 60].map((d) => (
            <option key={d} value={d} className="bg-[#16181d]">
              {d === 0 ? "Today" : `Last ${d} days`}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => fetchReport(activeQs, true)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-bg/15 px-3 py-2 text-sm text-bg/80 hover:border-gold/40 hover:text-bg disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!data?.recipients.length}
          className="inline-flex items-center gap-2 rounded-xl border border-bg/15 px-3 py-2 text-sm text-bg/80 hover:border-gold/40 hover:text-bg disabled:opacity-50"
        >
          <Download size={14} /> Export
        </button>
      </div>

      {/* Custom calendar range */}
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-bg/55">
        <CalendarDays size={14} className="text-bg/40" />
        <span>Custom range</span>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-bg/12 bg-bg/4 px-2.5 py-1.5 text-[13px] text-bg scheme-dark focus:border-gold/50 focus:outline-none"
        />
        <span className="text-bg/35">→</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-bg/12 bg-bg/4 px-2.5 py-1.5 text-[13px] text-bg scheme-dark focus:border-gold/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={applyRange}
          disabled={!from || !to || loading}
          className="rounded-lg bg-gold px-3 py-1.5 text-[12px] font-medium text-ink transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
        >
          Apply
        </button>
      </div>

      {/* Summary */}
      {data && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-bg/60">
          <span>
            <span className="font-semibold text-bg">{data.uniqueRecipients.toLocaleString()}</span> recipients
          </span>
          <span>
            <span className="font-semibold text-bg">{data.totalSends.toLocaleString()}</span> total sends
          </span>
          <span className={data.duplicated ? "text-amber-300" : ""}>
            <span className="font-semibold">{data.duplicated.toLocaleString()}</span> got duplicates
          </span>
          <span className="text-bg/40">
            live from Resend{data.approximate ? " (capped)" : ""} · {new Date(data.asOf).toLocaleTimeString()}
          </span>
          {data.error && (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <AlertTriangle size={12} /> {data.error}
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-bg/10">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="border-b border-bg/10 bg-bg/4 text-[11px] uppercase tracking-[0.1em] text-bg/45">
            <tr>
              <th className="px-4 py-2.5 font-medium">Recipient</th>
              {(["sent", "delivered", "opened", "clicked"] as SortKey[]).map((k) => (
                <th key={k} className="px-3 py-2.5 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => setSort(k)}
                    className={"hover:text-bg " + (sort === k ? "text-gold" : "")}
                  >
                    {k}
                  </button>
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium">Campaigns</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-bg/45">
                  <Loader2 size={16} className="mx-auto animate-spin" /> Reading from Resend…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-bg/45">
                  No recipients in this window.
                </td>
              </tr>
            ) : (
              rows.slice(0, 500).map((r) => (
                <tr
                  key={r.email}
                  className={
                    "border-b border-bg/6 last:border-0 " +
                    (r.sent > 1 ? "bg-amber-400/[0.04]" : "")
                  }
                >
                  <td className="px-4 py-2.5 text-bg/85">{r.email}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={r.sent > 1 ? "font-semibold text-amber-300" : "text-bg/80"}>
                      {r.sent}
                    </span>
                    {r.sent > 1 && <span className="ml-1 text-[10px] text-amber-400/70">×dup</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right text-emerald-400/80">{r.delivered}</td>
                  <td className="px-3 py-2.5 text-right text-bg/70">{r.opened}</td>
                  <td className="px-3 py-2.5 text-right text-bg/70">{r.clicked}</td>
                  <td className="max-w-[280px] truncate px-4 py-2.5 text-[12px] text-bg/45" title={r.campaigns.join(" · ")}>
                    {r.campaigns.join(" · ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {rows.length > 500 && (
        <p className="text-center text-[12px] text-bg/40">
          Showing first 500 of {rows.length.toLocaleString()}. Use search or Export for the full list.
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Loader2, Download, Search, AlertTriangle, CalendarDays } from "lucide-react";

type MailRow = { id: string; to: string; subject: string; status: string; at: string };
type Report = {
  emails: MailRow[];
  total: number;
  capped: boolean;
  approximate: boolean;
  asOf: string;
  error?: string;
};

const STATUS_STYLE: Record<string, string> = {
  delivered: "bg-emerald-400/15 text-emerald-300",
  opened: "bg-sky-400/15 text-sky-300",
  clicked: "bg-violet-400/15 text-violet-300",
  sent: "bg-bg/10 text-bg/65",
  queued: "bg-bg/10 text-bg/55",
  scheduled: "bg-bg/10 text-bg/55",
  bounced: "bg-red-400/15 text-red-300",
  failed: "bg-red-400/15 text-red-300",
  complained: "bg-amber-400/15 text-amber-300",
  suppressed: "bg-amber-400/15 text-amber-300",
  delivery_delayed: "bg-amber-400/15 text-amber-300",
};

function when(iso: string): string {
  try {
    return new Date(iso.replace(" ", "T")).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AllMailPanel() {
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(15);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activeQs, setActiveQs] = useState("days=15");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const fetchReport = async (qs: string, force = false) => {
    setActiveQs(qs);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/resend-emails?${qs}${force ? "&force=1" : ""}`, {
        cache: "no-store",
      });
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

  const statuses = useMemo(() => {
    const set = new Set<string>();
    for (const e of data?.emails ?? []) set.add(e.status);
    return [...set].sort();
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    return data.emails.filter(
      (e) =>
        (status === "all" || e.status === status) &&
        (!needle ||
          e.to.toLowerCase().includes(needle) ||
          e.subject.toLowerCase().includes(needle))
    );
  }, [data, q, status]);

  const exportCsv = () => {
    if (!data) return;
    const head = "to,subject,status,sent_at\n";
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rows.map((r) => [r.to, r.subject, r.status, r.at].map(esc).join(",")).join("\n");
    const blob = new Blob([head + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-mail-${isCustom ? `${from}_to_${to}` : days === 0 ? "today" : days + "d"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bg/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipient or subject…"
            className="w-full rounded-xl border border-bg/12 bg-bg/4 py-2 pl-9 pr-3 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-bg/12 bg-bg/4 px-3 py-2 text-sm text-bg scheme-dark focus:border-gold/50 focus:outline-none"
        >
          <option value="all" className="bg-[#16181d]">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s} className="bg-[#16181d]">
              {s}
            </option>
          ))}
        </select>
        <select
          value={isCustom ? "custom" : days}
          onChange={(e) => pickPreset(Number(e.target.value))}
          className="rounded-xl border border-bg/12 bg-bg/4 px-3 py-2 text-sm text-bg scheme-dark focus:border-gold/50 focus:outline-none"
        >
          {isCustom && <option value="custom" className="bg-[#16181d]">Custom range</option>}
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
          disabled={!rows.length}
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
            <span className="font-semibold text-bg">{rows.length.toLocaleString()}</span> shown
          </span>
          <span>
            <span className="font-semibold text-bg">{data.total.toLocaleString()}</span> total in range
          </span>
          <span className="text-bg/40">
            live from Resend{data.capped ? " · newest 3,000" : ""} · {new Date(data.asOf).toLocaleTimeString()}
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
          <thead className="border-b border-bg/10 bg-bg/4 text-[11px] uppercase tracking-widest text-bg/45">
            <tr>
              <th className="px-4 py-2.5 font-medium">Recipient</th>
              <th className="px-3 py-2.5 font-medium">Subject</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 text-right font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-bg/45">
                  <Loader2 size={16} className="mx-auto animate-spin" /> Reading from Resend…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-bg/45">
                  No mail in this window.
                </td>
              </tr>
            ) : (
              rows.slice(0, 1000).map((r) => (
                <tr key={r.id} className="border-b border-bg/6 last:border-0">
                  <td className="px-4 py-2 text-bg/85">{r.to}</td>
                  <td className="max-w-[320px] truncate px-3 py-2 text-bg/70" title={r.subject}>
                    {r.subject || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[11px] capitalize " +
                        (STATUS_STYLE[r.status] ?? "bg-bg/10 text-bg/65")
                      }
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td suppressHydrationWarning className="px-4 py-2 text-right text-[11px] text-bg/40">
                    {when(r.at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {rows.length > 1000 && (
        <p className="text-center text-[12px] text-bg/40">
          Showing first 1,000 of {rows.length.toLocaleString()}. Narrow with search or Export.
        </p>
      )}
    </div>
  );
}

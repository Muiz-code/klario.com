"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  Upload,
  Send,
  Copy,
  ScanSearch,
  Pencil,
  AlertTriangle,
  Check,
  X,
  Merge,
} from "lucide-react";
import type { Signup } from "@/lib/db/signups";
import type { DuplicateReport } from "@/lib/db/duplicates";
import { normalizeEmail } from "@/lib/duplicates";
import { ConfirmModal, type ConfirmState } from "../_components/Modal";

// Display status reflects whether we've actually mailed someone, not just the
// stored status field: "Mailed" = at least one email sent; "Pending" = none.
type DisplayStatus = "pending" | "mailed" | "active" | "unsubscribed";

const STATUS_LABEL: Record<DisplayStatus, string> = {
  pending: "Unmailed",
  mailed: "Mailed",
  active: "Active",
  unsubscribed: "Unsubscribed",
};

const STATUS_FILTERS: { id: "all" | DisplayStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Unmailed" },
  { id: "mailed", label: "Mailed" },
  { id: "active", label: "Active" },
  { id: "unsubscribed", label: "Unsubscribed" },
];

type DupRecord = {
  type: "subscriber" | "submission";
  id: string;
  email: string;
  title: string;
  detail: string;
  date: string;
};

type ResolveState = {
  email: string;
  records: DupRecord[];
  keep: string;
  loading: boolean;
  busy: boolean;
};

const STATUS_STYLE: Record<DisplayStatus, string> = {
  pending: "bg-amber-400/15 text-amber-200",
  mailed: "bg-blue-400/15 text-blue-200",
  active: "bg-emerald-400/15 text-emerald-200",
  unsubscribed: "bg-red-400/15 text-red-200",
};

export function SubscribersTable({
  signups,
  crossListEmails = [],
  mailedEmails = [],
  failedEmails = [],
  bouncedEmails = [],
}: {
  signups: Signup[];
  crossListEmails?: string[];
  mailedEmails?: string[];
  failedEmails?: string[];
  bouncedEmails?: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | DisplayStatus>("all");
  const [dupOnly, setDupOnly] = useState(false);
  const [failedOnly, setFailedOnly] = useState(false);
  const [bouncedOnly, setBouncedOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [dupDetail, setDupDetail] = useState<
    { label: string; emails: string[] }[] | null
  >(null);
  const [report, setReport] = useState<DuplicateReport | null>(null);
  const [scanning, setScanning] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [resolve, setResolve] = useState<ResolveState | null>(null);

  // Subscribers whose email also shows up in the public submissions log.
  const crossSet = useMemo(
    () => new Set(crossListEmails.map(normalizeEmail)),
    [crossListEmails]
  );
  const isDuplicate = (s: Signup) => crossSet.has(normalizeEmail(s.email));

  // Subscribers whose mail didn't make it: failed = never left; bounced =
  // rejected by the recipient's server. Neither was later delivered.
  const failedSet = useMemo(
    () => new Set(failedEmails.map(normalizeEmail)),
    [failedEmails]
  );
  const bouncedSet = useMemo(
    () => new Set(bouncedEmails.map(normalizeEmail)),
    [bouncedEmails]
  );
  const isFailed = (s: Signup) => failedSet.has(normalizeEmail(s.email));
  const isBounced = (s: Signup) => bouncedSet.has(normalizeEmail(s.email));

  // Count the subscribers actually in the list (some failed/bounced addresses
  // may no longer be subscribers), so the chip matches the rows shown.
  const failedCount = useMemo(
    () => signups.filter((s) => failedSet.has(normalizeEmail(s.email))).length,
    [signups, failedSet]
  );
  const bouncedCount = useMemo(
    () => signups.filter((s) => bouncedSet.has(normalizeEmail(s.email))).length,
    [signups, bouncedSet]
  );

  // Everyone we've actually mailed (any non-failed send).
  const mailedSet = useMemo(
    () => new Set(mailedEmails.map(normalizeEmail)),
    [mailedEmails]
  );
  const displayStatus = useCallback(
    (s: Signup): DisplayStatus => {
      if (s.status === "unsubscribed") return "unsubscribed";
      if (s.status === "active") return "active";
      return mailedSet.has(normalizeEmail(s.email)) ? "mailed" : "pending";
    },
    [mailedSet]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return signups
      .filter((s) => (status === "all" ? true : displayStatus(s) === status))
      .filter((s) => (dupOnly ? crossSet.has(normalizeEmail(s.email)) : true))
      .filter((s) => (failedOnly ? failedSet.has(normalizeEmail(s.email)) : true))
      .filter((s) => (bouncedOnly ? bouncedSet.has(normalizeEmail(s.email)) : true))
      .filter((s) => {
        if (!needle) return true;
        return (
          s.email.toLowerCase().includes(needle) ||
          (s.first_name || "").toLowerCase().includes(needle) ||
          (s.last_name || "").toLowerCase().includes(needle)
        );
      });
  }, [
    signups,
    q,
    status,
    dupOnly,
    failedOnly,
    bouncedOnly,
    crossSet,
    failedSet,
    bouncedSet,
    displayStatus,
  ]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) filtered.forEach((s) => next.delete(s.id));
      else filtered.forEach((s) => next.add(s.id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const refresh = () => startTransition(() => router.refresh());

  const requestSend = (opts: {
    ids?: string[];
    all?: boolean;
    resend?: boolean;
    label: string;
  }) => {
    if (opts.ids && opts.ids.length === 0) return;
    setConfirmState({
      title: opts.resend ? "Resend the welcome email?" : "Send the welcome email?",
      message: `The beta welcome email will be sent to ${opts.label}.`,
      confirmLabel: "Send",
      onConfirm: () => runSend(opts),
    });
  };

  const runSend = async (opts: {
    ids?: string[];
    all?: boolean;
    resend?: boolean;
    label: string;
  }) => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: opts.ids,
          all: opts.all,
          resend: opts.resend,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data.error || "Send failed.");
      } else {
        setNotice(
          `Sent ${data.sent}, failed ${data.failed}, skipped ${data.skipped}.`
        );
        setSelected(new Set());
        refresh();
      }
    } finally {
      setBusy(false);
      setConfirmState(null);
    }
  };

  const onImportFile = async (file: File) => {
    setBusy(true);
    setNotice(null);
    setDupDetail(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data.error || "Import failed.");
      } else {
        setNotice(
          `Imported ${data.added} new, skipped ${data.skipped} existing, ${data.invalid} invalid rows.`
        );
        const existing: string[] = data.existingDuplicates ?? [];
        const inFile: string[] = data.fileDuplicates ?? [];
        const detail: { label: string; emails: string[] }[] = [];
        if (existing.length)
          detail.push({
            label: `${existing.length} already on the list`,
            emails: existing,
          });
        if (inFile.length)
          detail.push({
            label: `${inFile.length} repeated inside the file`,
            emails: inFile,
          });
        setDupDetail(detail.length ? detail : null);
        refresh();
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const runScan = async () => {
    setScanning(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/duplicates");
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setNotice((data && data.error) || "Scan failed.");
        setReport(null);
      } else {
        setReport(data as DuplicateReport);
      }
    } finally {
      setScanning(false);
    }
  };

  const runMerge = async () => {
    setBusy(true);
    setNotice(null);
    const res = await fetch("/api/admin/duplicates/merge", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setConfirmState(null);
    if (res.ok) {
      setNotice(
        data.removed > 0
          ? `Merged ${data.groups} duplicate group${data.groups === 1 ? "" : "s"}, removed ${data.removed} extra row${data.removed === 1 ? "" : "s"}.`
          : "No duplicate rows to merge."
      );
      setReport(null);
      refresh();
    } else {
      setNotice(data.error || "Merge failed.");
    }
  };

  const requestMerge = () =>
    setConfirmState({
      title: "Merge duplicate subscribers?",
      message:
        "Subscribers stored under the same email (different spelling, case, or Gmail dots) will be combined into one row. The oldest is kept, blank fields are filled from the others, an unsubscribe is respected, and the extra rows are deleted. This cannot be undone.",
      confirmLabel: "Merge duplicates",
      onConfirm: runMerge,
    });

  const openResolve = async (s: Signup) => {
    setResolve({
      email: s.email,
      records: [],
      keep: `subscriber:${s.id}`,
      loading: true,
      busy: false,
    });
    try {
      const res = await fetch(
        `/api/admin/duplicates/records?email=${encodeURIComponent(s.email)}`
      );
      const data = await res.json().catch(() => ({ records: [] }));
      setResolve((r) =>
        r ? { ...r, records: data.records ?? [], loading: false } : r
      );
    } catch {
      setResolve((r) => (r ? { ...r, loading: false } : r));
    }
  };

  const doResolve = async () => {
    if (!resolve) return;
    setResolve({ ...resolve, busy: true });
    const remove = resolve.records
      .filter((r) => `${r.type}:${r.id}` !== resolve.keep)
      .map((r) => ({ type: r.type, id: r.id }));
    const res = await fetch("/api/admin/duplicates/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remove }),
    });
    const data = await res.json().catch(() => ({}));
    setResolve(null);
    if (res.ok) {
      setNotice(
        `Resolved. Removed ${data.removed} duplicate record${data.removed === 1 ? "" : "s"}.`
      );
      refresh();
    } else {
      setNotice(data.error || "Could not resolve.");
    }
  };

  const requestRemove = (s: Signup) => {
    setConfirmState({
      title: "Delete this subscriber?",
      message: `${s.email} will be removed. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => runRemove(s.id),
    });
  };

  const runRemove = async (id: string) => {
    setBusy(true);
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
    setBusy(false);
    setConfirmState(null);
    if (res.ok) refresh();
    else setNotice("Could not delete.");
  };

  const startEdit = (s: Signup) => {
    setEditingId(s.id);
    setEditEmail(s.email);
  };

  const saveEmail = async (id: string) => {
    const value = editEmail.trim();
    if (!value) return;
    setBusy(true);
    setNotice(null);
    const res = await fetch(`/api/admin/subscribers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setEditingId(null);
      setNotice("Email updated.");
      refresh();
    } else {
      setNotice(data.error || "Could not update the email.");
    }
  };

  const exportCsv = () => {
    const header = "email,first_name,last_name,status,source,created_at\n";
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = signups.map((s) =>
      [s.email, s.first_name, s.last_name, s.status, s.source, s.created_at]
        .map(esc)
        .join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klario-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedIds = [...selected];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 rounded-xl border border-bg/15 bg-bg/4 px-3 py-2 text-sm">
          <Search size={14} className="text-bg/45" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email or name"
            className="w-full min-w-0 bg-transparent text-bg placeholder:text-bg/40 focus:outline-none sm:w-64"
          />
        </label>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/75 hover:border-bg/30 hover:text-bg disabled:opacity-40"
        >
          <Upload size={13} /> Import CSV
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!signups.length}
          className="rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:border-bg/30 hover:text-bg disabled:opacity-40"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={runScan}
          disabled={scanning}
          className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:border-bg/30 hover:text-bg disabled:opacity-40"
        >
          <ScanSearch size={13} /> {scanning ? "Scanning..." : "Scan duplicates"}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              requestSend({
                ids: selectedIds,
                resend: false,
                label: `${selectedIds.length} selected`,
              })
            }
            disabled={busy || selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[12px] font-medium text-ink hover:scale-[1.02] disabled:opacity-40"
          >
            <Send size={13} /> Send to selected ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const count =
            f.id === "all"
              ? signups.length
              : signups.filter((s) => displayStatus(s) === f.id).length;
          const active = status === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatus(f.id)}
              className={
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-colors " +
                (active
                  ? "bg-bg/10 text-bg"
                  : "text-bg/55 hover:bg-bg/5 hover:text-bg")
              }
            >
              {f.label}
              <span className="rounded-full bg-bg/10 px-1.5 text-[10px]">
                {count}
              </span>
            </button>
          );
        })}

        {failedCount > 0 && (
          <button
            type="button"
            onClick={() => {
              const next = !failedOnly;
              setFailedOnly(next);
              if (next) {
                setStatus("all");
                setDupOnly(false);
                setBouncedOnly(false);
              }
            }}
            title="Sends that errored before leaving (never accepted)"
            className={
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-colors " +
              (failedOnly
                ? "bg-red-400/20 text-red-100"
                : "text-red-200/70 hover:bg-red-400/10 hover:text-red-100")
            }
          >
            <AlertTriangle size={12} /> Failed
            <span className="rounded-full bg-red-400/20 px-1.5 text-[10px]">
              {failedCount}
            </span>
          </button>
        )}

        {bouncedCount > 0 && (
          <button
            type="button"
            onClick={() => {
              const next = !bouncedOnly;
              setBouncedOnly(next);
              if (next) {
                setStatus("all");
                setDupOnly(false);
                setFailedOnly(false);
              }
            }}
            title="Accepted, then rejected by the recipient's mail server"
            className={
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-colors " +
              (bouncedOnly
                ? "bg-orange-400/20 text-orange-100"
                : "text-orange-200/70 hover:bg-orange-400/10 hover:text-orange-100")
            }
          >
            <AlertTriangle size={12} /> Bounced
            <span className="rounded-full bg-orange-400/20 px-1.5 text-[10px]">
              {bouncedCount}
            </span>
          </button>
        )}

        {crossSet.size > 0 && (
          <button
            type="button"
            onClick={() => {
              const next = !dupOnly;
              setDupOnly(next);
              // Show duplicates across every status, so the count matches the rows.
              if (next) setStatus("all");
            }}
            title="Subscribers whose email also appears in the submissions log"
            className={
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-colors " +
              (dupOnly
                ? "bg-amber-400/20 text-amber-100"
                : "text-amber-200/70 hover:bg-amber-400/10 hover:text-amber-100")
            }
          >
            <Copy size={12} /> Duplicates
            <span className="rounded-full bg-amber-400/20 px-1.5 text-[10px]">
              {crossSet.size}
            </span>
          </button>
        )}
      </div>

      {notice && (
        <div className="rounded-xl border border-bg/15 bg-bg/4 px-4 py-2.5 text-[13px] text-bg/80">
          {notice}
        </div>
      )}

      {dupDetail && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 py-3 text-[13px] text-amber-100">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">Duplicate emails in that upload</span>
            <button
              type="button"
              onClick={() => setDupDetail(null)}
              className="text-[11px] text-amber-200/70 hover:text-amber-100"
            >
              Dismiss
            </button>
          </div>
          {dupDetail.map((group) => (
            <EmailList
              key={group.label}
              label={group.label}
              emails={group.emails}
            />
          ))}
        </div>
      )}

      {report && (
        <div className="flex flex-col gap-3 rounded-xl border border-bg/15 bg-bg/4 px-4 py-3 text-[13px] text-bg/80">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-bg">Duplicate scan</span>
            <div className="flex items-center gap-3">
              {report.counts.storedVariants > 0 && (
                <button
                  type="button"
                  onClick={requestMerge}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-[11px] text-gold hover:border-gold disabled:opacity-50"
                >
                  <Merge size={12} /> Merge {report.counts.storedVariants} duplicate
                  {report.counts.storedVariants === 1 ? "" : "s"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setReport(null)}
                className="text-[11px] text-bg/55 hover:text-bg"
              >
                Dismiss
              </button>
            </div>
          </div>
          {report.counts.crossList === 0 &&
          report.counts.submissionRepeats === 0 &&
          report.counts.storedVariants === 0 ? (
            <p className="text-bg/65">
              No duplicates found across {report.counts.signups} subscribers and{" "}
              {report.counts.submissions} submissions.
            </p>
          ) : (
            <>
              {report.crossList.length > 0 && (
                <EmailList
                  label={`${report.crossList.length} also in the submissions log`}
                  emails={report.crossList.map(
                    (c) => `${c.email} (${c.submissions} submission${c.submissions === 1 ? "" : "s"})`
                  )}
                />
              )}
              {report.submissionRepeats.length > 0 && (
                <EmailList
                  label={`${report.submissionRepeats.length} repeat submitter${report.submissionRepeats.length === 1 ? "" : "s"}`}
                  emails={report.submissionRepeats.map(
                    (c) => `${c.email} (×${c.count})`
                  )}
                />
              )}
              {report.storedVariants.length > 0 && (
                <EmailList
                  label={`${report.storedVariants.length} stored under multiple spellings`}
                  emails={report.storedVariants.map(
                    (v) => v.variants.join("  ·  ")
                  )}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-bg/10">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-bg/10 bg-bg/4 text-left text-[11px] uppercase tracking-[0.14em] text-bg/45">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="accent-gold"
                />
              </th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-bg/45">
                  No subscribers found. Import a CSV to get started.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const ds = displayStatus(s);
                const mailed = ds === "mailed" || ds === "active";
                const unsub = ds === "unsubscribed";
                const failed = isFailed(s);
                const bounced = isBounced(s);
                const problem = failed || bounced;
                const dup = isDuplicate(s);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-bg/8 last:border-0 hover:bg-bg/3"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggleOne(s.id)}
                        aria-label={`Select ${s.email}`}
                        className="accent-gold"
                      />
                    </td>
                    <td className="px-4 py-3 text-bg/85">
                      {editingId === s.id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEmail(s.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                            className="w-56 rounded-md border border-gold/40 bg-bg/5 px-2 py-1 text-[13px] text-bg focus:border-gold focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => saveEmail(s.id)}
                            disabled={busy}
                            aria-label="Save email"
                            className="rounded-md p-1 text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-40"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancel"
                            className="rounded-md p-1 text-bg/55 hover:bg-bg/10 hover:text-bg"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          {s.email}
                          <button
                            type="button"
                            onClick={() => startEdit(s)}
                            aria-label="Edit email"
                            title="Fix a typo in this email"
                            className="rounded p-0.5 text-bg/40 transition-colors hover:bg-gold/10 hover:text-gold"
                          >
                            <Pencil size={12} />
                          </button>
                          {isFailed(s) && (
                            <span
                              title="Send errored before leaving (never accepted)"
                              className="inline-flex items-center gap-1 rounded-full bg-red-400/15 px-1.5 py-0.5 text-[10px] text-red-200"
                            >
                              <AlertTriangle size={10} /> failed
                            </span>
                          )}
                          {isBounced(s) && (
                            <span
                              title="Accepted, then rejected by the recipient's mail server"
                              className="inline-flex items-center gap-1 rounded-full bg-orange-400/15 px-1.5 py-0.5 text-[10px] text-orange-200"
                            >
                              <AlertTriangle size={10} /> bounced
                            </span>
                          )}
                          {isDuplicate(s) && (
                            <span
                              title="Also appears in the submissions log"
                              className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-200"
                            >
                              <Copy size={10} /> dup
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-bg/70">
                      {[s.first_name, s.last_name].filter(Boolean).join(" ") || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] " + STATUS_STYLE[ds]
                        }
                      >
                        {STATUS_LABEL[ds]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-bg/55">
                      {new Date(s.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!unsub && (
                          <button
                            type="button"
                            onClick={() =>
                              requestSend({
                                ids: [s.id],
                                resend: mailed,
                                label: s.email,
                              })
                            }
                            disabled={busy}
                            className={
                              "rounded-full border px-2.5 py-1 text-[11px] disabled:opacity-40 " +
                              (problem
                                ? "border-red-400/40 text-red-200 hover:border-red-400/70"
                                : "border-bg/15 text-bg/75 hover:border-gold/50 hover:text-bg")
                            }
                          >
                            {mailed || problem ? "Resend" : "Send invite"}
                          </button>
                        )}
                        {dup && (
                          <button
                            type="button"
                            onClick={() => openResolve(s)}
                            disabled={busy}
                            className="rounded-full border border-amber-400/40 px-2.5 py-1 text-[11px] text-amber-200 hover:border-amber-400/70 disabled:opacity-40"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => requestRemove(s)}
                          disabled={busy || pending}
                          aria-label="Delete subscriber"
                          className="rounded-md p-1.5 text-bg/55 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-bg/45">
        CSV format: a header row with an <span className="text-bg/70">email</span>{" "}
        column, optionally <span className="text-bg/70">first_name</span> and{" "}
        <span className="text-bg/70">last_name</span>. Existing emails are skipped.
      </p>

      <ConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
        loading={busy}
      />

      {resolve && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => !resolve.busy && setResolve(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-bg/15 bg-[#0d0e12] p-5"
          >
            <h2 className="font-display text-lg text-bg">Resolve duplicate</h2>
            <p className="mt-1 text-[13px] text-bg/55">
              <span className="text-bg/80">{resolve.email}</span> appears in more
              than one record. Pick the one to keep; the rest are deleted.
            </p>

            <div className="mt-4 flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
              {resolve.loading ? (
                <p className="py-6 text-center text-[13px] text-bg/45">
                  Loading records...
                </p>
              ) : resolve.records.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-bg/45">
                  No records found.
                </p>
              ) : (
                resolve.records.map((r) => {
                  const key = `${r.type}:${r.id}`;
                  const on = resolve.keep === key;
                  return (
                    <label
                      key={key}
                      className={
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 " +
                        (on
                          ? "border-gold/60 bg-gold/5"
                          : "border-bg/12 bg-bg/4 hover:border-bg/25")
                      }
                    >
                      <input
                        type="radio"
                        name="keep-record"
                        checked={on}
                        onChange={() => setResolve({ ...resolve, keep: key })}
                        className="mt-0.5 accent-gold"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] text-bg/85">
                            {r.title}
                          </span>
                          <span
                            className={
                              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] capitalize " +
                              (r.type === "subscriber"
                                ? "bg-blue-400/15 text-blue-200"
                                : "bg-bg/10 text-bg/60")
                            }
                          >
                            {r.type}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-bg/50">
                          {r.detail}
                        </p>
                        <p className="text-[10px] text-bg/35">
                          {new Date(r.date).toLocaleDateString()}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolve(null)}
                disabled={resolve.busy}
                className="rounded-full border border-bg/15 px-4 py-2 text-sm text-bg/75 hover:text-bg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doResolve}
                disabled={
                  resolve.busy || resolve.loading || resolve.records.length <= 1
                }
                className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink hover:scale-[1.01] disabled:opacity-50"
              >
                {resolve.busy
                  ? "Resolving..."
                  : `Keep selected, remove ${Math.max(0, resolve.records.length - 1)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Collapsible-ish list of emails: shows the first 12, with a copy-all action. */
function EmailList({ label, emails }: { label: string; emails: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? emails : emails.slice(0, 12);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium">{label}</span>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(emails.join("\n"))}
          className="text-[11px] underline decoration-dotted underline-offset-2 opacity-70 hover:opacity-100"
        >
          Copy all
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((e) => (
          <code
            key={e}
            className="rounded bg-black/20 px-1.5 py-0.5 text-[11px] break-all"
          >
            {e}
          </code>
        ))}
        {emails.length > 12 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="rounded px-1.5 py-0.5 text-[11px] underline decoration-dotted underline-offset-2 opacity-70 hover:opacity-100"
          >
            {showAll ? "Show fewer" : `+${emails.length - 12} more`}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Upload, Send, Copy, ScanSearch } from "lucide-react";
import type { Signup, SignupStatus } from "@/lib/db/signups";
import type { DuplicateReport } from "@/lib/db/duplicates";
import { normalizeEmail } from "@/lib/duplicates";
import { ConfirmModal, type ConfirmState } from "../_components/Modal";

const STATUS_FILTERS: { id: "all" | SignupStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "invited", label: "Invited" },
  { id: "active", label: "Active" },
  { id: "unsubscribed", label: "Unsubscribed" },
];

const STATUS_STYLE: Record<SignupStatus, string> = {
  pending: "bg-amber-400/15 text-amber-200",
  invited: "bg-blue-400/15 text-blue-200",
  active: "bg-emerald-400/15 text-emerald-200",
  unsubscribed: "bg-red-400/15 text-red-200",
};

export function SubscribersTable({
  signups,
  crossListEmails = [],
}: {
  signups: Signup[];
  crossListEmails?: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | SignupStatus>("all");
  const [dupOnly, setDupOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [dupDetail, setDupDetail] = useState<
    { label: string; emails: string[] }[] | null
  >(null);
  const [report, setReport] = useState<DuplicateReport | null>(null);
  const [scanning, setScanning] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  // Subscribers whose email also shows up in the public submissions log.
  const crossSet = useMemo(
    () => new Set(crossListEmails.map(normalizeEmail)),
    [crossListEmails]
  );
  const isDuplicate = (s: Signup) => crossSet.has(normalizeEmail(s.email));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return signups
      .filter((s) => (status === "all" ? true : s.status === status))
      .filter((s) => (dupOnly ? crossSet.has(normalizeEmail(s.email)) : true))
      .filter((s) => {
        if (!needle) return true;
        return (
          s.email.toLowerCase().includes(needle) ||
          (s.first_name || "").toLowerCase().includes(needle) ||
          (s.last_name || "").toLowerCase().includes(needle)
        );
      });
  }, [signups, q, status, dupOnly, crossSet]);

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
              : signups.filter((s) => s.status === f.id).length;
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

        {crossSet.size > 0 && (
          <button
            type="button"
            onClick={() => setDupOnly((v) => !v)}
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
            <button
              type="button"
              onClick={() => setReport(null)}
              className="text-[11px] text-bg/55 hover:text-bg"
            >
              Dismiss
            </button>
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
                const invited = s.status === "invited";
                const unsub = s.status === "unsubscribed";
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
                      <span className="inline-flex items-center gap-2">
                        {s.email}
                        {isDuplicate(s) && (
                          <span
                            title="Also appears in the submissions log"
                            className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-200"
                          >
                            <Copy size={10} /> dup
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bg/70">
                      {[s.first_name, s.last_name].filter(Boolean).join(" ") || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] capitalize " +
                          STATUS_STYLE[s.status]
                        }
                      >
                        {s.status}
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
                                resend: invited,
                                label: s.email,
                              })
                            }
                            disabled={busy}
                            className="rounded-full border border-bg/15 px-2.5 py-1 text-[11px] text-bg/75 hover:border-gold/50 hover:text-bg disabled:opacity-40"
                          >
                            {invited ? "Resend" : "Send invite"}
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

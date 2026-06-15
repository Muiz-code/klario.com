"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, X, ChevronRight, Copy } from "lucide-react";
import type { Submission, SubmissionKind } from "@/lib/db/submissions";
import { duplicateEmailSet, normalizeEmail } from "@/lib/duplicates";

const TABS: { id: "all" | SubmissionKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "beta", label: "Beta" },
  { id: "ambassador", label: "Ambassadors" },
  { id: "contact", label: "Contact" },
];

const KIND_STYLE: Record<SubmissionKind, string> = {
  beta: "bg-gold/15 text-gold",
  ambassador: "bg-emerald-400/15 text-emerald-200",
  contact: "bg-blue-400/15 text-blue-200",
  newsletter: "bg-purple-400/15 text-purple-200",
};

export function SubmissionsView({
  submissions,
}: {
  submissions: Submission[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | SubmissionKind>("all");
  const [query, setQuery] = useState("");
  const [dupOnly, setDupOnly] = useState(false);
  const [open, setOpen] = useState<Submission | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Emails that appear in more than one submission row — repeat submitters.
  const dupSet = useMemo(
    () => duplicateEmailSet(submissions.map((s) => s.email)),
    [submissions]
  );
  const isDuplicate = (s: Submission) => dupSet.has(normalizeEmail(s.email));

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return submissions
      .filter((s) => (tab === "all" ? true : s.kind === tab))
      .filter((s) => (dupOnly ? dupSet.has(normalizeEmail(s.email)) : true))
      .filter((s) => {
        if (!needle) return true;
        const hay = [
          s.email,
          s.name,
          s.phone,
          s.banks,
          s.device,
          s.institution,
          s.why,
          s.topic,
          s.message,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
  }, [submissions, tab, query, dupOnly, dupSet]);

  const exportCsv = () => {
    const cols = [
      "id",
      "kind",
      "created_at",
      "email",
      "name",
      "phone",
      "banks",
      "device",
      "role",
      "institution",
      "why",
      "topic",
      "message",
    ];
    const escape = (v: unknown) => {
      const s = v === undefined || v === null ? "" : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = cols.join(",") + "\n";
    const rows = filtered.map((s) =>
      [
        s.id,
        s.kind,
        s.created_at,
        s.email,
        s.name,
        s.phone,
        s.banks,
        s.device,
        s.role,
        s.institution,
        s.why,
        s.topic,
        s.message,
      ]
        .map(escape)
        .join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klario-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this submission? This cannot be undone.")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (res.ok) {
      if (open?.id === id) setOpen(null);
      startTransition(() => router.refresh());
    } else {
      alert("Could not delete.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => {
            const count =
              t.id === "all"
                ? submissions.length
                : submissions.filter((s) => s.kind === t.id).length;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-colors " +
                  (active
                    ? "bg-bg/10 text-bg"
                    : "text-bg/55 hover:bg-bg/5 hover:text-bg")
                }
              >
                {t.label}
                <span className="rounded-full bg-bg/10 px-1.5 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}

          {dupSet.size > 0 && (
            <button
              type="button"
              onClick={() => setDupOnly((v) => !v)}
              title="Emails that submitted more than one form"
              className={
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-colors " +
                (dupOnly
                  ? "bg-amber-400/20 text-amber-100"
                  : "text-amber-200/70 hover:bg-amber-400/10 hover:text-amber-100")
              }
            >
              <Copy size={12} /> Duplicates
              <span className="rounded-full bg-amber-400/20 px-1.5 text-[10px]">
                {dupSet.size}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-bg/15 bg-bg/4 px-3 py-2 text-sm">
            <Search size={14} className="text-bg/45" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full min-w-0 bg-transparent text-bg placeholder:text-bg/40 focus:outline-none sm:w-56"
            />
          </label>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!filtered.length}
            className="rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:border-bg/30 hover:text-bg disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-bg/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-bg/10 bg-bg/4 text-left text-[11px] uppercase tracking-[0.14em] text-bg/45">
            <tr>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-bg/45">
                  No submissions yet.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const preview =
                  s.kind === "beta"
                    ? [s.device, s.banks].filter(Boolean).join(" · ")
                    : s.kind === "ambassador"
                      ? [s.role, s.institution].filter(Boolean).join(" · ")
                      : [s.topic, s.message?.slice(0, 60)].filter(Boolean).join(" · ");
                return (
                  <tr
                    key={s.id}
                    onClick={() => setOpen(s)}
                    className="cursor-pointer border-b border-bg/8 last:border-0 hover:bg-bg/3"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] capitalize " +
                          KIND_STYLE[s.kind]
                        }
                      >
                        {s.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bg/85">
                      <span className="inline-flex items-center gap-2">
                        {s.email || "-"}
                        {isDuplicate(s) && (
                          <span
                            title="This email submitted more than one form"
                            className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-200"
                          >
                            <Copy size={10} /> dup
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bg/70">{s.name || "-"}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-[12px] text-bg/55">
                      {preview || "-"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-bg/55">
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight size={14} className="ml-auto text-bg/45" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <DetailDrawer
          submission={open}
          onClose={() => setOpen(null)}
          onDelete={() => remove(open.id)}
          deleting={busy === open.id || pending}
        />
      )}
    </div>
  );
}

function DetailDrawer({
  submission: s,
  onClose,
  onDelete,
  deleting,
}: {
  submission: Submission;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const allRows: [string, string | null | undefined][] =
    s.kind === "beta"
      ? [
          ["Email", s.email],
          ["Name", s.name],
          ["Phone", s.phone],
          ["Banks", s.banks],
          ["Device", s.device],
        ]
      : s.kind === "ambassador"
        ? [
            ["Email", s.email],
            ["Name", s.name],
            ["Phone", s.phone],
            ["Role", s.role],
            ["Institution", s.institution],
            ["Why", s.why],
          ]
        : [
            ["Email", s.email],
            ["Name", s.name],
            ["Topic", s.topic],
            ["Message", s.message],
          ];
  const rows = allRows.filter(([, v]) => Boolean(v));

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/65 backdrop-blur-sm"
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#0d0e12] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-bg/10 px-6 py-5">
          <div>
            <p
              className={
                "inline-block rounded-full px-2 py-0.5 text-[11px] capitalize " +
                KIND_STYLE[s.kind]
              }
            >
              {s.kind}
            </p>
            <h2 className="font-display mt-2 text-xl text-bg">{s.email}</h2>
            <p className="mt-1 text-[12px] text-bg/55">
              {new Date(s.created_at).toLocaleString()}
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
          <a
            href={`mailto:${s.email}`}
            className="text-[12px] text-bg/70 hover:text-bg"
          >
            Reply by email →
          </a>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 px-3 py-1.5 text-[12px] text-red-200 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 size={12} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </footer>
      </aside>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Download, Send, Plus, Trash2, X } from "lucide-react";
import { ConfirmModal, type ConfirmState } from "../_components/Modal";
import {
  FIELDS,
  OP_LABELS,
  fieldMeta,
  type MatchType,
  type Rule,
  type RuleField,
  type RuleOp,
  type SegmentDef,
} from "@/lib/segments/types";
import type { BuiltinGroup } from "@/lib/db/segments";

export type CustomSegmentRow = {
  id: string;
  name: string;
  match: MatchType;
  rules: Rule[];
  count: number;
  def: SegmentDef;
};

type Member = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  source: string | null;
  created_at: string;
};

const SESSION_KEY = "klario_segment_target";

// Native <option> popups ignore the dark page theme on some platforms (white
// background + near-white text = unreadable). Styling the option directly is
// honored by Chrome/Edge, so the popup renders dark with light text.
const OPT = "bg-[#16181d] text-bg";

export function SegmentsView({
  groups,
  custom,
  total,
}: {
  groups: BuiltinGroup[];
  custom: CustomSegmentRow[];
  total: number;
}) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{
    label: string;
    count: number;
    members: Member[];
  } | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [deleting, setDeleting] = useState(false);

  const resolve = async (
    def: SegmentDef
  ): Promise<{ count: number; members: Member[] } | null> => {
    const res = await fetch("/api/admin/segments/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ def }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      setNotice((data && data.error) || "Could not resolve segment.");
      return null;
    }
    return { count: data.count, members: data.members };
  };

  const onView = async (label: string, def: SegmentDef, key: string) => {
    setBusyKey(key);
    setNotice(null);
    const r = await resolve(def);
    setBusyKey(null);
    if (r) setViewer({ label, ...r });
  };

  const onExport = async (label: string, def: SegmentDef, key: string) => {
    setBusyKey(key);
    setNotice(null);
    const r = await resolve(def);
    setBusyKey(null);
    if (!r) return;
    downloadCsv(label, r.members);
  };

  const onSend = async (label: string, def: SegmentDef, key: string) => {
    setBusyKey(key);
    setNotice(null);
    const r = await resolve(def);
    setBusyKey(null);
    if (!r) return;
    if (r.count === 0) {
      setNotice("That segment has no members to send to.");
      return;
    }
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ label, emails: r.members.map((m) => m.email) })
    );
    router.push("/p@ss1/newsletters/new");
  };

  const requestDelete = (id: string, name: string) => {
    setConfirmState({
      title: "Delete this segment?",
      message: `"${name}" will be removed. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => runDelete(id),
    });
  };

  const runDelete = async (id: string) => {
    setDeleting(true);
    const res = await fetch(`/api/admin/segments/${id}`, { method: "DELETE" });
    setDeleting(false);
    setConfirmState(null);
    if (res.ok) router.refresh();
    else setNotice("Could not delete segment.");
  };

  const actions = (label: string, def: SegmentDef, key: string) => (
    <div className="flex items-center gap-1">
      <IconBtn title="View members" disabled={busyKey === key} onClick={() => onView(label, def, key)}>
        <Eye size={14} />
      </IconBtn>
      <IconBtn title="Export CSV" disabled={busyKey === key} onClick={() => onExport(label, def, key)}>
        <Download size={14} />
      </IconBtn>
      <IconBtn title="Send campaign" disabled={busyKey === key} onClick={() => onSend(label, def, key)}>
        <Send size={14} />
      </IconBtn>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {notice && (
        <div className="rounded-xl border border-bg/15 bg-bg/4 px-4 py-2.5 text-[13px] text-bg/80">
          {notice}
        </div>
      )}

      {/* Custom segments */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-bg">Custom segments</h2>
          <button
            type="button"
            onClick={() => setBuilderOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[12px] font-medium text-ink transition-transform hover:scale-[1.02]"
          >
            <Plus size={14} /> New segment
          </button>
        </div>

        {custom.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-bg/12 bg-bg/3 px-5 py-8 text-center text-[13px] text-bg/45">
            No custom segments yet. Build one to target a specific slice of your
            audience.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {custom.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border border-bg/10 bg-bg/4 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-bg">{s.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-bg/45">
                      {ruleSummary(s.match, s.rules)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => requestDelete(s.id, s.name)}
                    aria-label="Delete segment"
                    className="shrink-0 rounded-md p-1 text-bg/40 hover:bg-red-400/10 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <p className="font-display text-2xl text-bg">
                    {s.count.toLocaleString()}
                    <span className="ml-1 text-[12px] font-normal text-bg/40">
                      {pct(s.count, total)}
                    </span>
                  </p>
                  {actions(s.name, s.def, `custom:${s.id}`)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Built-in groups */}
      {groups.map((g) => (
        <section key={g.key} className="flex flex-col gap-3">
          <h2 className="font-display text-lg text-bg">{g.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {g.segments.map((seg) => (
              <div
                key={seg.key}
                className="flex flex-col gap-3 rounded-2xl border border-bg/10 bg-bg/4 p-4"
              >
                <p className="truncate text-[13px] text-bg/60">{seg.label}</p>
                <div className="flex items-end justify-between">
                  <p className="font-display text-2xl text-bg">
                    {seg.count.toLocaleString()}
                    <span className="ml-1 text-[12px] font-normal text-bg/40">
                      {pct(seg.count, total)}
                    </span>
                  </p>
                </div>
                {actions(`${g.title} · ${seg.label}`, seg.def, seg.key)}
              </div>
            ))}
          </div>
        </section>
      ))}

      {viewer && (
        <MembersModal viewer={viewer} onClose={() => setViewer(null)} />
      )}
      {builderOpen && (
        <SegmentBuilder
          onClose={() => setBuilderOpen(false)}
          onSaved={() => {
            setBuilderOpen(false);
            router.refresh();
          }}
        />
      )}
      <ConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
        loading={deleting}
      />
    </div>
  );
}

function IconBtn({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-bg/12 p-1.5 text-bg/60 hover:border-gold/40 hover:text-bg disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function MembersModal({
  viewer,
  onClose,
}: {
  viewer: { label: string; count: number; members: Member[] };
  onClose: () => void;
}) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-ink/65 backdrop-blur-sm" aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#0d0e12] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-bg/10 px-6 py-4">
          <div>
            <h2 className="font-display text-lg text-bg">{viewer.label}</h2>
            <p className="text-[12px] text-bg/50">
              {viewer.count.toLocaleString()} member{viewer.count === 1 ? "" : "s"}
              {viewer.members.length < viewer.count
                ? ` · showing first ${viewer.members.length}`
                : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-bg/55 hover:text-bg">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {viewer.members.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-bg/45">
              No members in this segment.
            </p>
          ) : (
            <ul className="flex flex-col">
              {viewer.members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-bg/4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-bg/85">{m.email}</p>
                    <p className="truncate text-[11px] text-bg/45">
                      {[m.first_name, m.last_name].filter(Boolean).join(" ") || "-"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-bg/8 px-2 py-0.5 text-[10px] capitalize text-bg/60">
                    {m.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

function SegmentBuilder({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [match, setMatch] = useState<MatchType>("all");
  const [rules, setRules] = useState<Rule[]>([
    { field: "status", op: "is", value: "active" },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRule = (i: number, patch: Partial<Rule>) =>
    setRules((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const onFieldChange = (i: number, field: RuleField) => {
    const meta = fieldMeta(field)!;
    setRule(i, {
      field,
      op: meta.ops[0],
      value: meta.valueType === "select" ? meta.values![0].value : "",
    });
  };

  const addRule = () =>
    setRules((prev) => [...prev, { field: "status", op: "is", value: "active" }]);
  const removeRule = (i: number) =>
    setRules((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, match_type: match, rules }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-ink/65 backdrop-blur-sm" aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-[#0d0e12] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-bg/10 px-6 py-4">
          <h2 className="font-display text-lg text-bg">New segment</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-bg/55 hover:text-bg">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engaged iOS users"
              className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
            />
          </label>

          <div className="mt-5 flex items-center gap-2 text-[13px] text-bg/70">
            Match
            <select
              value={match}
              onChange={(e) => setMatch(e.target.value as MatchType)}
              className="rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-sm text-bg scheme-dark focus:border-gold/50 focus:outline-none"
            >
              <option className={OPT} value="all">all rules (AND)</option>
              <option className={OPT} value="any">any rule (OR)</option>
            </select>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {rules.map((r, i) => {
              const meta = fieldMeta(r.field)!;
              return (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-bg/10 bg-bg/3 p-2.5">
                  <select
                    value={r.field}
                    onChange={(e) => onFieldChange(i, e.target.value as RuleField)}
                    className="rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-[13px] text-bg scheme-dark focus:border-gold/50 focus:outline-none"
                  >
                    {FIELDS.map((f) => (
                      <option key={f.field} className={OPT} value={f.field}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={r.op}
                    onChange={(e) => setRule(i, { op: e.target.value as RuleOp })}
                    className="rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-[13px] text-bg scheme-dark focus:border-gold/50 focus:outline-none"
                  >
                    {meta.ops.map((op) => (
                      <option key={op} className={OPT} value={op}>
                        {OP_LABELS[op]}
                      </option>
                    ))}
                  </select>
                  {meta.valueType === "select" ? (
                    <select
                      value={r.value}
                      onChange={(e) => setRule(i, { value: e.target.value })}
                      className="min-w-0 flex-1 rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-[13px] text-bg scheme-dark focus:border-gold/50 focus:outline-none"
                    >
                      {meta.values!.map((v) => (
                        <option key={v.value} className={OPT} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={meta.valueType === "number" ? "number" : "text"}
                      value={r.value}
                      onChange={(e) => setRule(i, { value: e.target.value })}
                      placeholder={meta.valueType === "number" ? "days" : "value"}
                      className="min-w-0 flex-1 rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-[13px] text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeRule(i)}
                    disabled={rules.length === 1}
                    aria-label="Remove rule"
                    className="rounded-md p-1.5 text-bg/40 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addRule}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:border-gold/40 hover:text-bg"
          >
            <Plus size={13} /> Add rule
          </button>

          {error && (
            <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[12px] text-red-200">
              {error}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-bg/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-bg/15 px-4 py-2 text-[13px] text-bg/70 hover:text-bg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !name.trim()}
            className="rounded-full bg-gold px-4 py-2 text-[13px] font-medium text-ink transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
          >
            {busy ? "Saving..." : "Save segment"}
          </button>
        </footer>
      </aside>
    </>
  );
}

// ───────────────────────────── Helpers ─────────────────────────────────────

function pct(n: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function ruleSummary(match: MatchType, rules: Rule[]): string {
  const join = match === "all" ? " and " : " or ";
  return rules
    .map((r) => {
      const meta = fieldMeta(r.field);
      const label = meta?.label ?? r.field;
      return `${label} ${OP_LABELS[r.op]} ${r.value}`.trim();
    })
    .join(join);
}

function downloadCsv(label: string, members: Member[]): void {
  const header = "email,first_name,last_name,status,source,created_at\n";
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = members.map((m) =>
    [m.email, m.first_name, m.last_name, m.status, m.source, m.created_at]
      .map(esc)
      .join(",")
  );
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  a.href = url;
  a.download = `segment-${slug || "export"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

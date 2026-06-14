"use client";

import { useState } from "react";
import {
  ChevronRight,
  Send,
  Mail,
  FlaskConical,
  Upload,
  Loader2,
} from "lucide-react";
import type { AuditEvent, AuditRecipient } from "@/lib/db/audit";

const ACTION_META: Record<
  string,
  { label: string; icon: typeof Send }
> = {
  beta_invite: { label: "Beta invite", icon: Send },
  newsletter: { label: "Newsletter", icon: Mail },
  test_send: { label: "Test send", icon: FlaskConical },
  import: { label: "Import", icon: Upload },
};

export function AuditTable({ events }: { events: AuditEvent[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Record<string, AuditRecipient[]>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const toggle = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (!recipients[id]) {
      setLoading(id);
      try {
        const res = await fetch(`/api/admin/audit/${id}/recipients`);
        const data = await res.json().catch(() => ({ recipients: [] }));
        setRecipients((prev) => ({ ...prev, [id]: data.recipients ?? [] }));
      } finally {
        setLoading(null);
      }
    }
  };

  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-bg/10 bg-bg/4 p-6 text-sm text-bg/55">
        No activity yet. Sends and imports will appear here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((e) => {
        const meta = ACTION_META[e.action] ?? { label: e.action, icon: Send };
        const Icon = meta.icon;
        const open = openId === e.id;
        const isEmail = e.action !== "import";
        return (
          <div
            key={e.id}
            className="overflow-hidden rounded-2xl border border-bg/10 bg-bg/4"
          >
            <button
              type="button"
              onClick={() => toggle(e.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-bg/5"
            >
              <ChevronRight
                size={16}
                className={
                  "shrink-0 text-bg/40 transition-transform " +
                  (open ? "rotate-90" : "")
                }
              />
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-bg">
                  {e.subject || meta.label}
                </p>
                <p className="truncate text-[12px] text-bg/45">
                  {meta.label}
                  {e.segment ? ` · ${e.segment}` : ""}
                  {e.actor ? ` · ${e.actor}` : ""}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-4 sm:flex">
                {isEmail && (
                  <>
                    <Stat label="Sent" value={e.sent_count} />
                    <Stat
                      label="Delivered"
                      value={e.delivered_count}
                      tone="good"
                    />
                    <Stat label="Opened" value={e.opened_count} />
                    <Stat label="Clicked" value={e.clicked_count} />
                    {e.failed_count + e.bounced_count > 0 && (
                      <Stat
                        label="Failed"
                        value={e.failed_count + e.bounced_count}
                        tone="bad"
                      />
                    )}
                  </>
                )}
                {!isEmail && <Stat label="Recipients" value={e.recipient_count} />}
              </div>
              <span className="shrink-0 text-right text-[11px] text-bg/40">
                {formatDate(e.created_at)}
              </span>
            </button>

            {open && (
              <div className="border-t border-bg/10 px-4 py-3">
                {/* Mobile-only counts */}
                <div className="mb-3 flex gap-4 sm:hidden">
                  <Stat label="Recipients" value={e.recipient_count} />
                  {isEmail && <Stat label="Sent" value={e.sent_count} />}
                  {isEmail && (
                    <Stat label="Delivered" value={e.delivered_count} tone="good" />
                  )}
                </div>

                {!isEmail ? (
                  <ImportMeta meta={e.meta} />
                ) : loading === e.id ? (
                  <p className="flex items-center gap-2 py-2 text-[13px] text-bg/55">
                    <Loader2 size={14} className="animate-spin" /> Loading
                    recipients...
                  </p>
                ) : (
                  <RecipientList rows={recipients[e.id] ?? []} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RecipientList({ rows }: { rows: AuditRecipient[] }) {
  if (rows.length === 0) {
    return <p className="py-2 text-[13px] text-bg/45">No recipients recorded.</p>;
  }
  return (
    <div className="max-h-72 overflow-y-auto">
      <table className="w-full text-[13px]">
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.email + i} className="border-b border-bg/5 last:border-0">
              <td className="py-2 pr-3 text-bg/85">{r.email}</td>
              <td className="py-2 pr-3">
                <DeliveryBadge status={r.status} />
              </td>
              <td className="py-2 text-right text-[11px] text-bg/40">
                {r.delivered_at
                  ? `delivered ${formatDate(r.delivered_at)}`
                  : formatDate(r.sent_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeliveryBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: "bg-emerald-400/15 text-emerald-300",
    sent: "bg-bg/10 text-bg/65",
    failed: "bg-red-400/15 text-red-300",
    bounced: "bg-red-400/15 text-red-300",
    complained: "bg-amber-400/15 text-amber-300",
  };
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-[11px] capitalize " +
        (map[status] ?? "bg-bg/10 text-bg/65")
      }
    >
      {status}
    </span>
  );
}

function ImportMeta({ meta }: { meta: Record<string, unknown> | null }) {
  const m = (meta ?? {}) as {
    added?: number;
    skipped?: number;
    invalid?: number;
    parsed?: number;
  };
  return (
    <div className="flex flex-wrap gap-4 py-1 text-[13px] text-bg/70">
      <span>Parsed: {m.parsed ?? 0}</span>
      <span className="text-emerald-300">Added: {m.added ?? 0}</span>
      <span>Skipped (existing): {m.skipped ?? 0}</span>
      {(m.invalid ?? 0) > 0 && (
        <span className="text-amber-300">Invalid: {m.invalid}</span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "good" | "bad";
}) {
  const color =
    tone === "good"
      ? "text-emerald-300"
      : tone === "bad"
        ? "text-red-300"
        : "text-bg";
  return (
    <div className="text-center">
      <p className={"text-sm font-medium " + color}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-bg/40">{label}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

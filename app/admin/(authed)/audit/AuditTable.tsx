"use client";

import { useState } from "react";
import {
  ChevronRight,
  Send,
  Mail,
  FlaskConical,
  Upload,
  Loader2,
  Users,
  ArrowUpRight,
} from "lucide-react";
import type { AuditEvent, AuditRecipient } from "@/lib/db/audit";

type GroupedRecip = {
  email: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
};
type GroupedReport = {
  recipients: GroupedRecip[];
  totalSends: number;
  uniqueRecipients: number;
  duplicated: number;
  approximate: boolean;
  error?: string;
};
type GroupedState = { loading: boolean; error?: string; report?: GroupedReport };

const ACTION_META: Record<
  string,
  { label: string; icon: typeof Send }
> = {
  beta_invite: { label: "Beta invite", icon: Send },
  newsletter: { label: "Newsletter", icon: Mail },
  test_send: { label: "Test send", icon: FlaskConical },
  import: { label: "Import", icon: Upload },
};

export function AuditTable({
  events,
  onOpenRecipients,
}: {
  events: AuditEvent[];
  onOpenRecipients?: (subject: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Record<string, AuditRecipient[]>>({});
  const [loading, setLoading] = useState<string | null>(null);
  // Complete per-campaign recipients from Resend (keyed by event id).
  const [grouped, setGrouped] = useState<Record<string, GroupedState>>({});

  const toggle = async (e: AuditEvent) => {
    const id = e.id;
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);

    // Our logged recipients (delivery detail, may be incomplete).
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

    // Complete recipients for this campaign, straight from Resend.
    const isEmail = e.action !== "import";
    if (isEmail && e.subject && !grouped[id]) {
      setGrouped((prev) => ({ ...prev, [id]: { loading: true } }));
      try {
        const res = await fetch(
          `/api/admin/resend-recipients?subject=${encodeURIComponent(e.subject)}&days=60`
        );
        const d = await res.json().catch(() => ({}));
        setGrouped((prev) => ({
          ...prev,
          [id]: res.ok
            ? { loading: false, report: d as GroupedReport }
            : { loading: false, error: d.error || "Could not reach Resend." },
        }));
      } catch {
        setGrouped((prev) => ({ ...prev, [id]: { loading: false, error: "Network error." } }));
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
              onClick={() => toggle(e)}
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
              <span
                suppressHydrationWarning
                className="shrink-0 text-right text-[11px] text-bg/40"
              >
                {formatDate(e.created_at)}
              </span>
            </button>

            {open && (
              <div className="border-t border-bg/10 px-4 py-3">
                {/* Mobile-only counts */}
                <div className="mb-3 flex flex-wrap gap-4 sm:hidden">
                  <Stat label="Recipients" value={e.recipient_count} />
                  {isEmail && <Stat label="Sent" value={e.sent_count} />}
                  {isEmail && (
                    <Stat label="Delivered" value={e.delivered_count} tone="good" />
                  )}
                  {isEmail && <Stat label="Opened" value={e.opened_count} />}
                  {isEmail && <Stat label="Clicked" value={e.clicked_count} />}
                </div>

                {!isEmail ? (
                  <ImportMeta meta={e.meta} />
                ) : (
                  <EmailRecipients
                    grouped={grouped[e.id]}
                    fallback={recipients[e.id] ?? []}
                    fallbackLoading={loading === e.id}
                    subject={e.subject}
                    onOpenFull={onOpenRecipients}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Recipients for an email campaign. Prefers the COMPLETE record from Resend
 * (grouped by person, with "times sent" so duplicates show), and falls back to
 * our own logged rows if Resend is unreachable.
 */
function EmailRecipients({
  grouped,
  fallback,
  fallbackLoading,
  subject,
  onOpenFull,
}: {
  grouped: GroupedState | undefined;
  fallback: AuditRecipient[];
  fallbackLoading: boolean;
  subject: string | null;
  onOpenFull?: (subject: string) => void;
}) {
  if (grouped?.loading) {
    return (
      <p className="flex items-center gap-2 py-2 text-[13px] text-bg/55">
        <Loader2 size={14} className="animate-spin" /> Reading complete recipients from Resend…
      </p>
    );
  }

  const report = grouped?.report;
  if (report && report.recipients.length > 0) {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] text-bg/55">
            <span className="font-semibold text-bg">{report.uniqueRecipients.toLocaleString()}</span>{" "}
            recipients ·{" "}
            <span className="font-semibold text-bg">{report.totalSends.toLocaleString()}</span> sends
            {report.duplicated > 0 && (
              <span className="text-amber-300"> · {report.duplicated} got duplicates</span>
            )}
            <span className="text-bg/35"> · from Resend</span>
          </p>
          {subject && onOpenFull && (
            <button
              type="button"
              onClick={() => onOpenFull(subject)}
              className="inline-flex items-center gap-1 text-[12px] text-gold hover:underline"
            >
              <Users size={12} /> Open full view <ArrowUpRight size={12} />
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto rounded-xl border border-bg/8">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-[#101216] text-[10px] uppercase tracking-wide text-bg/40">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">Recipient</th>
                <th className="px-2 py-1.5 text-right font-medium">Sent</th>
                <th className="px-2 py-1.5 text-right font-medium">Deliv.</th>
                <th className="px-2 py-1.5 text-right font-medium">Open</th>
                <th className="px-3 py-1.5 text-right font-medium">Click</th>
              </tr>
            </thead>
            <tbody>
              {report.recipients.slice(0, 300).map((r) => (
                <tr key={r.email} className={"border-b border-bg/5 last:border-0 " + (r.sent > 1 ? "bg-amber-400/[0.04]" : "")}>
                  <td className="px-3 py-1.5 text-bg/85">{r.email}</td>
                  <td className="px-2 py-1.5 text-right">
                    <span className={r.sent > 1 ? "font-semibold text-amber-300" : "text-bg/75"}>{r.sent}</span>
                  </td>
                  <td className="px-2 py-1.5 text-right text-emerald-400/80">{r.delivered}</td>
                  <td className="px-2 py-1.5 text-right text-bg/70">{r.opened}</td>
                  <td className="px-3 py-1.5 text-right text-bg/70">{r.clicked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {report.recipients.length > 300 && (
          <p className="text-center text-[11px] text-bg/40">
            Showing 300 of {report.recipients.length.toLocaleString()}.{" "}
            {subject && onOpenFull && (
              <button type="button" onClick={() => onOpenFull(subject)} className="text-gold hover:underline">
                Open full view
              </button>
            )}
          </p>
        )}
      </div>
    );
  }

  // Fallback: our logged rows (with a note if Resend was the reason).
  if (fallbackLoading) {
    return (
      <p className="flex items-center gap-2 py-2 text-[13px] text-bg/55">
        <Loader2 size={14} className="animate-spin" /> Loading recipients...
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {grouped?.error && (
        <p className="text-[11px] text-amber-300/80">
          Couldn’t reach Resend ({grouped.error}) — showing our logged recipients, which may be incomplete.
        </p>
      )}
      <RecipientList rows={fallback} />
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
                <div className="flex flex-wrap items-center gap-1.5">
                  <DeliveryBadge status={r.status} />
                  {r.opened_at && (
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[11px] text-sky-300">
                      Opened
                    </span>
                  )}
                  {r.clicked_at && (
                    <span className="rounded-full bg-violet-400/15 px-2 py-0.5 text-[11px] text-violet-300">
                      Clicked
                    </span>
                  )}
                </div>
              </td>
              <td
                suppressHydrationWarning
                className="py-2 text-right text-[11px] text-bg/40"
              >
                {r.clicked_at
                  ? `clicked ${formatDate(r.clicked_at)}`
                  : r.opened_at
                    ? `opened ${formatDate(r.opened_at)}`
                    : r.delivered_at
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
    // Fixed locale so server and client agree on ordering. The remaining
    // timezone difference (server vs browser) is handled by
    // suppressHydrationWarning on the elements that render this.
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

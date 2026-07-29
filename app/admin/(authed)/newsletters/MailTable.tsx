"use client";

import { useState } from "react";
import { NewsletterRowActions } from "./BroadcastRowActions";
import { MailPreviewModal } from "./MailPreviewModal";

/** A row on the Mail list — the body is fetched only when a row is opened. */
export type MailRow = {
  id: string;
  subject: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  sent_at: string | null;
};

export function MailTable({ rows }: { rows: MailRow[] }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-bg/10">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-bg/10 bg-bg/4 text-left text-[11px] uppercase tracking-[0.14em] text-bg/45">
            <tr>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Recipients</th>
              <th className="px-4 py-3 font-medium">Sent</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-bg/45">
                  Nothing yet. Click &quot;Compose mail&quot; to write one.
                </td>
              </tr>
            ) : (
              rows.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => setPreview(n.id)}
                  title="Open this mail"
                  className="cursor-pointer border-b border-bg/8 last:border-0 hover:bg-bg/3"
                >
                  <td className="px-4 py-3 text-bg/85">{n.subject}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={n.status} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-bg/55">
                    {n.status === "sent" || n.status === "sending"
                      ? `${n.sent_count} / ${n.recipient_count}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-bg/55" suppressHydrationWarning>
                    {n.sent_at ? new Date(n.sent_at).toLocaleString() : "-"}
                  </td>
                  {/* Row actions are their own thing — don't open the preview. */}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <NewsletterRowActions
                      id={n.id}
                      status={n.status}
                      recipientCount={n.recipient_count}
                      failedCount={Math.max(0, n.recipient_count - n.sent_count)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {preview && <MailPreviewModal id={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: "bg-emerald-400/15 text-emerald-200",
    sending: "bg-blue-400/15 text-blue-200",
    draft: "bg-bg/10 text-bg/70",
    failed: "bg-red-400/15 text-red-200",
  };
  const cls = map[status] || "bg-bg/10 text-bg/70";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] capitalize ${cls}`}>{status}</span>
  );
}

import Link from "next/link";
import { listNewsletters } from "@/lib/db/newsletters";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { NewsletterRowActions } from "./BroadcastRowActions";

export const dynamic = "force-dynamic";

export default async function NewslettersPage() {
  const configured = isSupabaseConfigured();
  const newsletters = configured ? await listNewsletters() : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-bg">Mail</h1>
          <p className="mt-1 text-sm text-bg/55">
            Emails you have composed and sent from the admin.
          </p>
        </div>
        <Link
          href="/p@ss1/newsletters/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink hover:scale-[1.02]"
        >
          Compose mail
        </Link>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured yet.
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-bg/10">
        <table className="w-full text-sm">
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
            {newsletters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-bg/45">
                  Nothing yet. Click &quot;Compose mail&quot; to write one.
                </td>
              </tr>
            ) : (
              newsletters.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-bg/8 last:border-0 hover:bg-bg/3"
                >
                  <td className="px-4 py-3 text-bg/85">{n.subject}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={n.status} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-bg/55">
                    {n.status === "sent"
                      ? `${n.sent_count} / ${n.recipient_count}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-bg/55">
                    {n.sent_at ? new Date(n.sent_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <NewsletterRowActions id={n.id} status={n.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
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
    <span className={`rounded-full px-2 py-0.5 text-[11px] capitalize ${cls}`}>
      {status}
    </span>
  );
}

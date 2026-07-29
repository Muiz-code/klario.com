import Link from "next/link";
import { listNewsletters } from "@/lib/db/newsletters";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { MailTable, type MailRow } from "./MailTable";

export const dynamic = "force-dynamic";

export default async function NewslettersPage() {
  const configured = isSupabaseConfigured();
  const newsletters = configured ? await listNewsletters() : [];

  // Only the list columns go to the client; the body is fetched when a row is
  // opened, so the page payload stays small however many mails there are.
  const rows: MailRow[] = newsletters.map((n) => ({
    id: n.id,
    subject: n.subject,
    status: n.status,
    recipient_count: n.recipient_count,
    sent_count: n.sent_count,
    sent_at: n.sent_at,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-bg">Mail</h1>
          <p className="mt-1 text-sm text-bg/55">
            Emails you have composed and sent from the admin. Click one to read it.
          </p>
        </div>
        <Link
          href="/marketing/newsletters/new"
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

      <MailTable rows={rows} />
    </div>
  );
}

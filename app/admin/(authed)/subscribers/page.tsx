import { listSignups } from "@/lib/db/signups";
import { submissionEmailCounts } from "@/lib/db/duplicates";
import { normalizeEmail } from "@/lib/duplicates";
import { getMailedEmails, getDeliveryProblems } from "@/lib/db/email-log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { SubscribersTable } from "./SubscribersTable";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const configured = isSupabaseConfigured();
  const [signups, submissionCounts, mailedEmails, problems] = configured
    ? await Promise.all([
        listSignups({ limit: 2000 }),
        submissionEmailCounts(),
        getMailedEmails(),
        getDeliveryProblems(),
      ])
    : [
        [],
        new Map<string, number>(),
        [] as string[],
        { failed: [] as string[], bounced: [] as string[] },
      ];

  // Subscriber emails that also appear in the public submissions log - the same
  // person reached us through more than one channel (website form + the list).
  const crossListEmails = signups
    .map((s) => normalizeEmail(s.email))
    .filter((e) => submissionCounts.has(e));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-bg">Subscribers</h1>
        <p className="text-sm text-bg/55">
          The beta list. Import contacts, then send the welcome email.
        </p>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and
          SUPABASE_SERVICE_ROLE_KEY to load and manage the list.
        </div>
      )}

      <SubscribersTable
        signups={signups}
        crossListEmails={crossListEmails}
        mailedEmails={mailedEmails}
        failedEmails={problems.failed}
        bouncedEmails={problems.bounced}
      />
    </div>
  );
}

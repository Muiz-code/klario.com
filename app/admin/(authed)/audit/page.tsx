import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listAuditEvents } from "@/lib/db/audit";
import { listMemberActivity } from "@/lib/db/adminActivity";
import { AuditViews } from "./AuditViews";
import { StorageCleanupButton } from "./StorageCleanupButton";
import { SyncFromResendButton } from "./SyncFromResendButton";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const configured = isSupabaseConfigured();
  const [events, activity] = configured
    ? await Promise.all([listAuditEvents(), listMemberActivity({ limit: 300 })])
    : [[], []];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-bg">Audit log</h1>
          <p className="mt-1 text-sm text-bg/55">
            Every email send and import: who, what, how many, and delivery. Click
            a row to see the recipients.
          </p>
        </div>
        {configured && (
          <div className="flex flex-wrap items-center gap-2">
            <SyncFromResendButton />
            <StorageCleanupButton />
          </div>
        )}
      </div>

      {!configured ? (
        <p className="rounded-2xl border border-bg/10 bg-bg/4 p-6 text-sm text-bg/55">
          Supabase is not configured, so there is nothing to show yet.
        </p>
      ) : (
        <AuditViews events={events} activity={activity} />
      )}
    </div>
  );
}

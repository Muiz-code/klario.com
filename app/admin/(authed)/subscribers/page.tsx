import { listSignups } from "@/lib/db/signups";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { SubscribersTable } from "./SubscribersTable";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const configured = isSupabaseConfigured();
  const signups = configured ? await listSignups({ limit: 2000 }) : [];

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

      <SubscribersTable signups={signups} />
    </div>
  );
}

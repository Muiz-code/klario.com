import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { isAppSupabaseConfigured } from "@/lib/supabase/appAdmin";
import { listAppUsers } from "@/lib/db/appUsers";
import { AppUsersView } from "./AppUsersView";

export const dynamic = "force-dynamic";

export default async function AppUsersPage() {
  const configured = isSupabaseConfigured();
  const appLinked = isAppSupabaseConfigured();
  const rows = configured ? await listAppUsers() : [];

  const onApp = rows.filter((r) => r.app).length;
  // App users we hold no contact record for — nobody can mail them today.
  const appOnly = rows.filter((r) => r.sources.includes("app_only")).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">App users</h1>
        <p className="mt-1 text-sm text-bg/55">
          Everyone on both sides: our contacts (audience, imports, Anchor Club, beta) and
          every Klario app account, joined by email. That includes app users who are on
          none of our lists. Click anyone to see their usage.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured. Set the Supabase env vars to load contacts.
        </div>
      ) : (
        <>
          {!appLinked && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-[13px] text-amber-200/90">
              App performance is not linked. Set{" "}
              <code className="text-amber-100">APP_SUPABASE_URL</code> and{" "}
              <code className="text-amber-100">APP_SUPABASE_SERVICE_ROLE_KEY</code> (the
              Kairo app project&apos;s values) to match contacts to app accounts.
            </div>
          )}
          <AppUsersView
            rows={rows}
            onApp={onApp}
            appOnly={appOnly}
            appLinked={appLinked}
          />
        </>
      )}
    </div>
  );
}

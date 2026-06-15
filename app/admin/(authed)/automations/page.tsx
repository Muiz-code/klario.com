import { listAutomations, type Automation } from "@/lib/db/automations";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { AutomationsView } from "./AutomationsView";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const configured = isSupabaseConfigured();
  const automations: Automation[] = configured ? await listAutomations() : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Automations</h1>
        <p className="mt-1 text-sm text-bg/55">
          Trigger emails automatically based on where subscribers are in their
          journey. They run once daily and never send to the same person twice.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured. Set the Supabase env vars to manage
          automations.
        </div>
      ) : (
        <AutomationsView automations={automations} />
      )}
    </div>
  );
}

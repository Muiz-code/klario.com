import { listSubmissions } from "@/lib/db/submissions";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { SubmissionsView } from "./SubmissionsView";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const configured = isSupabaseConfigured();
  const submissions = configured ? await listSubmissions({ limit: 500 }) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Submissions</h1>
        <p className="mt-1 text-sm text-bg/55">
          Every beta, ambassador, and contact submission, in one place.
        </p>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured yet. Set{" "}
          <code className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[12px]">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[12px]">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          to load submissions.
        </div>
      )}

      <SubmissionsView submissions={submissions} />
    </div>
  );
}

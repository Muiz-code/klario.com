import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { TestLab } from "./TestLab";

export const dynamic = "force-dynamic";

export default function TestLabPage() {
  const configured = isSupabaseConfigured();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Test lab</h1>
        <p className="mt-1 text-sm text-bg/55">
          Load-test the send pipeline with throwaway users on Resend&apos;s safe test
          addresses. Create a batch, blast them at once, then clear them.
        </p>
      </div>
      {!configured ? (
        <p className="rounded-2xl border border-bg/10 bg-bg/4 p-6 text-sm text-bg/55">
          Supabase is not configured, so there is nothing to test yet.
        </p>
      ) : (
        <TestLab />
      )}
    </div>
  );
}

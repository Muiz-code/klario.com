import { listBetaResponses, type BetaResponse } from "@/lib/db/betaResponses";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { BetaResponsesView, type Summary } from "./BetaResponsesView";

export const dynamic = "force-dynamic";

export default async function BetaResponsesPage() {
  const configured = isSupabaseConfigured();
  const responses: BetaResponse[] = configured ? await listBetaResponses() : [];

  const total = responses.length;
  const spreadsheet = responses.filter((r) =>
    (r.method || "").toLowerCase().includes("spreadsheet")
  ).length;
  const trusts = responses
    .map((r) => r.trust)
    .filter((t): t is number => t !== null);
  const avgTrust =
    trusts.length > 0
      ? trusts.reduce((a, b) => a + b, 0) / trusts.length
      : 0;

  const featureCounts = new Map<string, number>();
  for (const r of responses) {
    for (const f of r.features) {
      featureCounts.set(f, (featureCounts.get(f) ?? 0) + 1);
    }
  }
  const topFeatures = [...featureCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }));

  const summary: Summary = {
    total,
    spreadsheetPct: total > 0 ? Math.round((spreadsheet / total) * 100) : 0,
    avgTrust,
    topFeatures,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Beta responses</h1>
        <p className="mt-1 text-sm text-bg/55">
          Answers from the public <span className="text-bg/70">/beta</span>{" "}
          questionnaire.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured. Set the Supabase env vars to load responses.
        </div>
      ) : (
        <BetaResponsesView responses={responses} summary={summary} />
      )}
    </div>
  );
}

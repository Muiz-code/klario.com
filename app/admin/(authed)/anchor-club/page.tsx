import { listAnchorResponses, type AnchorResponse } from "@/lib/db/anchorClub";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { isAppSupabaseConfigured } from "@/lib/supabase/appAdmin";
import {
  getAppProfilesByEmails,
  getAppActivityByUserIds,
  getDeletedAccountsByEmails,
  type AppProfile,
  type ActivityCounts,
  type DeletedAccount,
} from "@/lib/db/appProfiles";
import { normalizeEmail } from "@/lib/duplicates";
import { AnchorResponsesView, type AnchorSummary } from "./AnchorResponsesView";

export const dynamic = "force-dynamic";

export default async function AnchorClubPage() {
  const configured = isSupabaseConfigured();
  const responses: AnchorResponse[] = configured ? await listAnchorResponses() : [];

  // Cross-reference each applicant against their app profile (Klario ID +
  // performance), joined by email. No-op when the app DB isn't configured.
  const appConfigured = isAppSupabaseConfigured();
  const appByEmail = appConfigured
    ? await getAppProfilesByEmails(responses.map((r) => r.email))
    : new Map<string, AppProfile>();
  const appProfiles: Record<string, AppProfile> = {};
  const appUserIdByResponse: Record<string, string> = {};
  let onApp = 0;
  for (const r of responses) {
    const p = appByEmail.get(normalizeEmail(r.email));
    if (p) {
      appProfiles[r.id] = p;
      if (p.id) appUserIdByResponse[r.id] = p.id;
      onApp++;
    }
  }

  // Fetch what those matched users have actually done in the app (their tasks),
  // then key the counts back to the anchor response id.
  const activityByUserId = appConfigured
    ? await getAppActivityByUserIds(Object.values(appUserIdByResponse))
    : new Map<string, ActivityCounts>();
  const appActivity: Record<string, ActivityCounts> = {};
  for (const [responseId, userId] of Object.entries(appUserIdByResponse)) {
    const a = activityByUserId.get(userId);
    if (a) appActivity[responseId] = a;
  }

  // Account-deletion tombstones (survive a hard delete), keyed by response id.
  const deletedByEmail = appConfigured
    ? await getDeletedAccountsByEmails(responses.map((r) => r.email))
    : new Map<string, DeletedAccount>();
  const appDeleted: Record<string, DeletedAccount> = {};
  for (const r of responses) {
    const d = deletedByEmail.get(normalizeEmail(r.email));
    if (d) appDeleted[r.id] = d;
  }

  const total = responses.length;

  const areaCounts = new Map<string, number>();
  for (const r of responses) {
    const key = r.area || r.notes?.area;
    if (key) areaCounts.set(key, (areaCounts.get(key) ?? 0) + 1);
  }
  const topAreas = [...areaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }));

  const challengeCounts = new Map<string, number>();
  for (const r of responses) {
    const key = r.challenge || r.notes?.challenge;
    if (key) challengeCounts.set(key, (challengeCounts.get(key) ?? 0) + 1);
  }
  const topChallenge =
    [...challengeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const institutions = new Set(
    responses.map((r) => (r.institution || "").trim().toLowerCase()).filter(Boolean)
  ).size;

  const summary: AnchorSummary = {
    total,
    topAreas,
    topChallenge,
    institutions,
    onApp,
    appLinked: appConfigured,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Anchor Club</h1>
        <p className="mt-1 text-sm text-bg/55">
          Registrations from the public{" "}
          <span className="text-bg/70">/anchor-club</span> form.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured. Set the Supabase env vars to load registrations.
        </div>
      ) : (
        <>
          {!appConfigured && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-[13px] text-amber-200/90">
              App performance is not linked. Set{" "}
              <code className="text-amber-100">APP_SUPABASE_URL</code> and{" "}
              <code className="text-amber-100">APP_SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              (the Kairo app project&apos;s values) to show each applicant&apos;s
              Klario ID, score, streak and plan.
            </div>
          )}
          <AnchorResponsesView
            responses={responses}
            summary={summary}
            appProfiles={appProfiles}
            appActivity={appActivity}
            appDeleted={appDeleted}
          />
        </>
      )}
    </div>
  );
}

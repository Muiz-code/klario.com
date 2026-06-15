import {
  loadAudience,
  buildBuiltinGroups,
  listSegments,
  countCustom,
  segmentToDef,
  type BuiltinGroup,
} from "@/lib/db/segments";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { SegmentsView, type CustomSegmentRow } from "./SegmentsView";

export const dynamic = "force-dynamic";

export default async function SegmentsPage() {
  const configured = isSupabaseConfigured();

  let groups: BuiltinGroup[] = [];
  let custom: CustomSegmentRow[] = [];
  let total = 0;

  if (configured) {
    const [audience, segments] = await Promise.all([
      loadAudience(),
      listSegments(),
    ]);
    total = audience.signups.length;
    groups = buildBuiltinGroups(audience);
    custom = countCustom(audience, segments).map(({ segment, count }) => ({
      id: segment.id,
      name: segment.name,
      match: segment.match_type,
      rules: segment.rules,
      count,
      def: segmentToDef(segment),
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Segments</h1>
        <p className="mt-1 text-sm text-bg/55">
          Group your audience by status, engagement, and attributes. View members,
          export a CSV, or send a campaign to any segment.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured. Set the Supabase env vars to use segments.
        </div>
      ) : (
        <SegmentsView groups={groups} custom={custom} total={total} />
      )}
    </div>
  );
}

import { supabaseAdmin } from "@/lib/supabase/admin";
import { listSignups } from "@/lib/db/signups";
import { normalizeEmail } from "@/lib/duplicates";
import type { MatchType, Rule, SegmentDef } from "@/lib/segments/types";
import {
  countAudience,
  filterAudience,
  type Audience,
  type Engagement,
} from "@/lib/segments/evaluate";

export type CustomSegment = {
  id: string;
  name: string;
  match_type: MatchType;
  rules: Rule[];
  created_at: string;
  updated_at: string;
};

/** Load the whole list plus an open/click engagement lookup, once. */
export async function loadAudience(): Promise<Audience> {
  const db = supabaseAdmin();
  const [signups, engRes] = await Promise.all([
    listSignups({ limit: 50000 }),
    db
      .from("email_log")
      .select("email, opened_at, clicked_at")
      .or("opened_at.not.is.null,clicked_at.not.is.null")
      .limit(80000),
  ]);

  const engagement = new Map<string, Engagement>();
  for (const r of engRes.data ?? []) {
    const e = normalizeEmail(r.email as string | null);
    if (!e) continue;
    const cur = engagement.get(e) ?? { opened: false, clicked: false };
    if (r.opened_at) cur.opened = true;
    if (r.clicked_at) cur.clicked = true;
    engagement.set(e, cur);
  }

  return { signups, engagement };
}

export type BuiltinSegment = {
  key: string;
  label: string;
  count: number;
  def: SegmentDef;
};
export type BuiltinGroup = {
  key: string;
  title: string;
  segments: BuiltinSegment[];
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function distinct(values: (string | null)[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const t = (v ?? "").trim();
    if (t) set.add(t);
  }
  return [...set].sort();
}

/** Compute the built-in segment groups (status / source / device / engagement). */
export function buildBuiltinGroups(aud: Audience): BuiltinGroup[] {
  const groups: BuiltinGroup[] = [];

  const statusDef = (v: string): SegmentDef => ({
    match: "all",
    rules: [{ field: "status", op: "is", value: v }],
  });
  groups.push({
    key: "status",
    title: "By status",
    segments: ["pending", "invited", "active", "unsubscribed"].map((v) => ({
      key: `status:${v}`,
      label: cap(v),
      count: countAudience(aud, statusDef(v)),
      def: statusDef(v),
    })),
  });

  const sources = distinct(aud.signups.map((s) => s.source));
  if (sources.length) {
    groups.push({
      key: "source",
      title: "By source",
      segments: sources.map((v) => {
        const def: SegmentDef = { match: "all", rules: [{ field: "source", op: "is", value: v }] };
        return { key: `source:${v}`, label: cap(v), count: countAudience(aud, def), def };
      }),
    });
  }

  const devices = distinct(aud.signups.map((s) => s.device));
  if (devices.length) {
    groups.push({
      key: "device",
      title: "By device",
      segments: devices.map((v) => {
        const def: SegmentDef = { match: "all", rules: [{ field: "device", op: "is", value: v }] };
        return { key: `device:${v}`, label: v, count: countAudience(aud, def), def };
      }),
    });
  }

  const engagementSegs: { v: string; label: string }[] = [
    { v: "opened", label: "Opened an email" },
    { v: "clicked", label: "Clicked a link" },
    { v: "never", label: "Never engaged" },
  ];
  groups.push({
    key: "engagement",
    title: "By engagement",
    segments: engagementSegs.map(({ v, label }) => {
      const def: SegmentDef = { match: "all", rules: [{ field: "engagement", op: "is", value: v }] };
      return { key: `eng:${v}`, label, count: countAudience(aud, def), def };
    }),
  });

  return groups;
}

// ───────────────────────────── Custom segment CRUD ─────────────────────────

export async function listSegments(): Promise<CustomSegment[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("segments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("[db] listSegments failed:", error.message);
    return [];
  }
  return (data ?? []) as CustomSegment[];
}

export async function getSegment(id: string): Promise<CustomSegment | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("segments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db] getSegment failed:", error.message);
    return null;
  }
  return (data as CustomSegment) ?? null;
}

export async function createSegment(input: {
  name: string;
  match_type: MatchType;
  rules: Rule[];
}): Promise<CustomSegment | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("segments")
    .insert({
      name: input.name,
      match_type: input.match_type,
      rules: input.rules,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[db] createSegment failed:", error.message);
    return null;
  }
  return data as CustomSegment;
}

export async function deleteSegment(id: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db.from("segments").delete().eq("id", id);
  if (error) {
    console.error("[db] deleteSegment failed:", error.message);
    return false;
  }
  return true;
}

/** A custom segment as a definition the evaluator understands. */
export function segmentToDef(s: CustomSegment): SegmentDef {
  return { match: s.match_type, rules: s.rules };
}

/** Resolve a definition to its members against a freshly loaded audience. */
export async function resolveMembers(def: SegmentDef, limit = 5000) {
  const aud = await loadAudience();
  const all = filterAudience(aud, def);
  return { count: all.length, members: all.slice(0, limit) };
}

/** Count each custom segment against an already-loaded audience. */
export function countCustom(aud: Audience, segments: CustomSegment[]) {
  return segments.map((s) => ({
    segment: s,
    count: countAudience(aud, segmentToDef(s)),
  }));
}

import type { Signup } from "@/lib/db/signups";
import { normalizeEmail } from "@/lib/duplicates";
import type { Rule, SegmentDef } from "./types";

export type Engagement = { opened: boolean; clicked: boolean };

/** The full list plus an engagement lookup, loaded once and filtered in JS. */
export type Audience = {
  signups: Signup[];
  engagement: Map<string, Engagement>;
};

const DAY = 86_400_000;
const NONE: Engagement = { opened: false, clicked: false };

function lower(v: string | null | undefined): string {
  return (v ?? "").toLowerCase();
}

function ruleMatches(s: Signup, eng: Engagement, r: Rule): boolean {
  const val = r.value.toLowerCase().trim();
  switch (r.field) {
    case "status":
      return r.op === "is_not" ? s.status !== r.value : s.status === r.value;
    case "source": {
      const src = lower(s.source);
      if (r.op === "contains") return src.includes(val);
      return r.op === "is_not" ? src !== val : src === val;
    }
    case "device": {
      const d = lower(s.device);
      return r.op === "is_not" ? d !== val : d === val;
    }
    case "banks":
      return lower(s.banks).includes(val);
    case "name": {
      const hay = `${lower(s.first_name)} ${lower(s.last_name)} ${lower(s.email)}`;
      return hay.includes(val);
    }
    case "engagement": {
      const has =
        r.value === "opened"
          ? eng.opened
          : r.value === "clicked"
            ? eng.clicked
            : !eng.opened && !eng.clicked; // "never"
      return r.op === "is_not" ? !has : has;
    }
    case "created_days": {
      const n = Number(r.value) || 0;
      const t = Date.parse(s.created_at);
      const cutoff = Date.now() - n * DAY;
      return r.op === "before" ? t < cutoff : t >= cutoff; // within
    }
    default:
      return false;
  }
}

export function defMatches(
  s: Signup,
  eng: Engagement | undefined,
  def: SegmentDef
): boolean {
  if (!def.rules.length) return true;
  const e = eng ?? NONE;
  return def.match === "any"
    ? def.rules.some((r) => ruleMatches(s, e, r))
    : def.rules.every((r) => ruleMatches(s, e, r));
}

export function filterAudience(aud: Audience, def: SegmentDef): Signup[] {
  return aud.signups.filter((s) =>
    defMatches(s, aud.engagement.get(normalizeEmail(s.email)), def)
  );
}

export function countAudience(aud: Audience, def: SegmentDef): number {
  let n = 0;
  for (const s of aud.signups) {
    if (defMatches(s, aud.engagement.get(normalizeEmail(s.email)), def)) n++;
  }
  return n;
}

/**
 * Does this segment deliberately target unsubscribed people? True only when a
 * rule is literally `status is unsubscribed`, e.g. the built-in "By status →
 * Unsubscribed" segment. Everything else (opened, clicked, all, source, …) is
 * treated as a normal audience that must never include unsubscribed people.
 */
export function targetsUnsubscribed(def: SegmentDef): boolean {
  return def.rules.some(
    (r) => r.field === "status" && r.op === "is" && r.value === "unsubscribed"
  );
}

/**
 * Send-safe view of a segment: the matched rows minus anyone who has
 * unsubscribed, unless the segment explicitly targets unsubscribed. Use this
 * (not filterAudience) anywhere the result feeds a send, a count shown next to
 * a send, or the recipient list an admin reviews before sending, so unsubscribed
 * people are never listed, counted, or mailed.
 */
export function filterForSend(aud: Audience, def: SegmentDef): Signup[] {
  const rows = filterAudience(aud, def);
  if (targetsUnsubscribed(def)) return rows;
  return rows.filter((s) => s.status !== "unsubscribed");
}

export function countForSend(aud: Audience, def: SegmentDef): number {
  return filterForSend(aud, def).length;
}

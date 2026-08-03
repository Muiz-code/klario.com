import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  listMemberActivity,
  areaOfAction,
  describeAction,
  type AdminActivity,
} from "@/lib/db/adminActivity";
import { listAuditEvents } from "@/lib/db/audit";

/**
 * One timeline of everything that happened on the admin, from three sources of
 * decreasing certainty:
 *
 *  - "logged"        — admin_activity: we recorded the actor at the time.
 *  - "send"          — audit_log: real send events, actor recorded.
 *  - "reconstructed" — inferred from rows that predate the logging (a template's
 *                      created_at, a member's invited_by, …). These tables never
 *                      stored WHO for most things, so the actor is usually
 *                      unknown. Derived on read; nothing is written back, so the
 *                      real log is never polluted with guesses.
 */
export type TimelineSource = "logged" | "send" | "reconstructed";

export type TimelineEvent = {
  id: string;
  at: string;
  actor: string | null;
  /** Readable phrase: "turned automation OFF". */
  description: string;
  /** What it happened to. */
  target: string | null;
  area: string;
  source: TimelineSource;
  meta?: Record<string, unknown> | null;
};

function fromActivity(a: AdminActivity): TimelineEvent {
  return {
    id: `act:${a.id}`,
    at: a.created_at,
    actor: a.actor_email,
    description: describeAction(a.action),
    target: a.target,
    area: areaOfAction(a.action),
    source: "logged",
    meta: a.meta,
  };
}

/** Each reconstructed table: where to read, and how to phrase a row. */
const RECONSTRUCT: {
  table: string;
  columns: string;
  area: string;
  /** Phrase for the event. */
  verb: string;
  /** Column holding the timestamp to place it at. */
  at: string;
  /** Column to show as the target. */
  label?: string;
  /** Column holding an actor, where the table happens to keep one. */
  actor?: string;
}[] = [
  { table: "newsletters", columns: "id, subject, created_at", area: "mail", verb: "created mail", at: "created_at", label: "subject" },
  { table: "email_templates", columns: "id, name, created_at", area: "template", verb: "created template", at: "created_at", label: "name" },
  { table: "segments", columns: "id, name, created_at", area: "segment", verb: "created segment", at: "created_at", label: "name" },
  { table: "blog_posts", columns: "id, title, created_at", area: "blog", verb: "created blog post", at: "created_at", label: "title" },
  { table: "automations", columns: "id, name, created_at", area: "automation", verb: "created automation", at: "created_at", label: "name" },
  { table: "admin_members", columns: "id, email, created_at, invited_by", area: "team", verb: "invited a member", at: "created_at", label: "email", actor: "invited_by" },
  { table: "admin_roles", columns: "id, name, created_at", area: "team", verb: "created a role", at: "created_at", label: "name" },
];

const PER_TABLE = 200;

/**
 * History inferred from existing rows, for the period before actions were
 * logged. Fail-soft per table: one that doesn't exist is skipped.
 */
async function reconstructed(): Promise<TimelineEvent[]> {
  const db = supabaseAdmin();
  const out: TimelineEvent[] = [];

  await Promise.all(
    RECONSTRUCT.map(async (spec) => {
      const { data, error } = await db
        .from(spec.table)
        .select(spec.columns)
        .order(spec.at, { ascending: false })
        .limit(PER_TABLE);
      if (error) {
        // A table that isn't there (or renamed) simply contributes nothing.
        return;
      }
      for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
        const at = row[spec.at];
        if (typeof at !== "string" || !at) continue;
        const actor = spec.actor ? row[spec.actor] : null;
        out.push({
          id: `rec:${spec.table}:${String(row.id ?? at)}`,
          at,
          actor: typeof actor === "string" && actor ? actor.toLowerCase() : null,
          description: spec.verb,
          target: spec.label ? String(row[spec.label] ?? "") || null : null,
          area: spec.area,
          source: "reconstructed",
        });
      }
    })
  );
  return out;
}

/** Send events already carry an actor — fold them in as first-class history. */
async function sends(): Promise<TimelineEvent[]> {
  const events = await listAuditEvents();
  return events.map((e) => ({
    id: `snd:${e.id}`,
    at: e.created_at,
    actor: e.actor,
    description:
      e.action === "import"
        ? "imported subscribers"
        : e.action === "test_send"
          ? "ran a load test"
          : "sent mail",
    target: e.subject,
    area: e.action === "import" ? "audience" : "mail",
    source: "send",
    meta: {
      recipients: e.recipient_count,
      sent: e.sent_count,
      failed: e.failed_count,
      delivered: e.delivered_count,
    },
  }));
}

/**
 * The full timeline, newest first. `includeHistory` adds the reconstructed
 * (pre-logging) events; leave it off to see only what was genuinely recorded.
 */
export async function getActivityTimeline(opts?: {
  includeHistory?: boolean;
  limit?: number;
}): Promise<TimelineEvent[]> {
  const [activity, sendEvents, history] = await Promise.all([
    listMemberActivity({ limit: 1000 }),
    sends(),
    opts?.includeHistory ? reconstructed() : Promise.resolve([]),
  ]);

  // A logged row and a reconstructed row can describe the same act (e.g. a mail
  // created after logging began). Drop the reconstructed twin: same area, same
  // target, within a minute.
  const loggedKeys = new Set(
    activity.map(
      (a) =>
        `${areaOfAction(a.action)}|${(a.target ?? "").toLowerCase()}|${a.created_at.slice(0, 16)}`
    )
  );

  const merged = [
    ...activity.map(fromActivity),
    ...sendEvents,
    ...history.filter(
      (h) => !loggedKeys.has(`${h.area}|${(h.target ?? "").toLowerCase()}|${h.at.slice(0, 16)}`)
    ),
  ];

  merged.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return merged.slice(0, opts?.limit ?? 1000);
}

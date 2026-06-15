import { supabaseAdmin } from "@/lib/supabase/admin";
import { signupStats } from "@/lib/db/signups";
import { normalizeEmail } from "@/lib/duplicates";

/**
 * Dashboard analytics over an explicit inclusive date range (from..to, UTC days).
 * Rows are fetched for the range and bucketed by UTC day in JS — fine at
 * beta-scale and avoids SQL RPCs.
 */

export type DateRange = { from: string; to: string }; // YYYY-MM-DD, inclusive

export type Series = {
  /** UTC day keys (YYYY-MM-DD), ascending, one per day in the range. */
  days: string[];
  lines: { key: string; label: string; values: number[] }[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function rangeAxis(from: string, to: string): {
  days: string[];
  index: Map<string, number>;
} {
  const start = Date.parse(from + "T00:00:00Z");
  const end = Date.parse(to + "T00:00:00Z");
  const days: string[] = [];
  const index = new Map<string, number>();
  for (let t = start; t <= end; t += DAY_MS) {
    const key = new Date(t).toISOString().slice(0, 10);
    index.set(key, days.length);
    days.push(key);
  }
  return { days, index };
}

function emptyLine(len: number): number[] {
  return new Array(len).fill(0);
}

const startIso = (from: string) => `${from}T00:00:00.000Z`;
const endIso = (to: string) => `${to}T23:59:59.999Z`;
const todayUtc = () => new Date().toISOString().slice(0, 10);

function lengthDays(from: string, to: string): number {
  return (
    Math.round(
      (Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / DAY_MS
    ) + 1
  );
}

/** The equal-length period immediately before the given range. */
function priorRange(from: string, to: string): DateRange {
  const len = lengthDays(from, to);
  const fromMs = Date.parse(from + "T00:00:00Z");
  return {
    from: new Date(fromMs - len * DAY_MS).toISOString().slice(0, 10),
    to: new Date(fromMs - DAY_MS).toISOString().slice(0, 10),
  };
}

/** Default range: today only (the present day). */
export function defaultRange(): DateRange {
  const to = todayUtc();
  return { from: to, to };
}

/** Validate/normalize a from/to pair; falls back to the default range. */
export function resolveRange(from?: string, to?: string): DateRange {
  const ok = (s?: string) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!ok(from) || !ok(to)) return defaultRange();
  // Ensure from <= to.
  return Date.parse(from!) <= Date.parse(to!)
    ? { from: from!, to: to! }
    : { from: to!, to: from! };
}

/** Audience interactions per day: new signups + form submissions. */
export async function getInteractionSeries(range: DateRange): Promise<Series> {
  const db = supabaseAdmin();
  const { days: axis, index } = rangeAxis(range.from, range.to);

  const [signupRes, submissionRes] = await Promise.all([
    db
      .from("beta_signups")
      .select("created_at")
      .gte("created_at", startIso(range.from))
      .lte("created_at", endIso(range.to))
      .limit(40000),
    db
      .from("submissions")
      .select("created_at")
      .gte("created_at", startIso(range.from))
      .lte("created_at", endIso(range.to))
      .limit(40000),
  ]);

  const signups = emptyLine(axis.length);
  const submissions = emptyLine(axis.length);
  for (const r of signupRes.data ?? []) {
    const i = index.get(dayKey(r.created_at as string));
    if (i !== undefined) signups[i]++;
  }
  for (const r of submissionRes.data ?? []) {
    const i = index.get(dayKey(r.created_at as string));
    if (i !== undefined) submissions[i]++;
  }

  return {
    days: axis,
    lines: [
      { key: "signups", label: "Signups", values: signups },
      { key: "submissions", label: "Submissions", values: submissions },
    ],
  };
}

/** Mail tracking per day: sent / opened / clicked. */
export async function getEngagementSeries(range: DateRange): Promise<Series> {
  const db = supabaseAdmin();
  const { days: axis, index } = rangeAxis(range.from, range.to);

  const { data } = await db
    .from("email_log")
    .select("sent_at, opened_at, clicked_at, status")
    .gte("sent_at", startIso(range.from))
    .lte("sent_at", endIso(range.to))
    .limit(80000);

  const sent = emptyLine(axis.length);
  const opened = emptyLine(axis.length);
  const clicked = emptyLine(axis.length);
  for (const r of data ?? []) {
    // "Sent" = anything that left our system (sent / delivered / bounced /
    // complained). The webhook flips 'sent' → 'delivered' on delivery, so
    // matching only 'sent' would undercount and push open rates over 100%.
    if (r.status !== "failed" && r.sent_at) {
      const i = index.get(dayKey(r.sent_at as string));
      if (i !== undefined) sent[i]++;
    }
    if (r.opened_at) {
      const i = index.get(dayKey(r.opened_at as string));
      if (i !== undefined) opened[i]++;
    }
    if (r.clicked_at) {
      const i = index.get(dayKey(r.clicked_at as string));
      if (i !== undefined) clicked[i]++;
    }
  }

  return {
    days: axis,
    lines: [
      { key: "sent", label: "Sent", values: sent },
      { key: "opened", label: "Opened", values: opened },
      { key: "clicked", label: "Clicked", values: clicked },
    ],
  };
}

// ───────────────────────────── Dashboard overview ──────────────────────────

export type Kpi = {
  key: string;
  label: string;
  value: number;
  isRate: boolean;
  deltaPct: number | null;
  spark: number[];
  note?: string;
};

export type FunnelStage = {
  key: string;
  label: string;
  value: number | null;
  /** Step-conversion rate vs the stage above (Sent is vs the whole list). */
  pct: number | null;
  /** What the percentage is measured against, e.g. "of 105 users". */
  hint?: string;
};

export type Segment = { key: string; label: string; value: number };

export type DashboardData = {
  rangeStart: string;
  rangeEnd: string;
  kpis: Kpi[];
  funnel: FunnelStage[];
  segments: Segment[];
  /** Emails sent today (UTC). */
  sentToday: number;
  /** Failed sends within the range (for the notification bell). */
  failed: number;
};

export type GrowthSeries = { days: string[]; values: number[] };

/**
 * Cumulative subscriber growth, independent of the dashboard date filter.
 * `days` is the trailing window to display (e.g. 90); pass null for all-time.
 * Cumulative counts include everyone who signed up before the window start, so
 * the line is always the true running total.
 */
export async function getGrowthSeries(
  days: number | null
): Promise<GrowthSeries> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("beta_signups")
    .select("created_at")
    .order("created_at", { ascending: true })
    .limit(100000);
  const rows = data ?? [];

  const to = todayUtc();
  if (rows.length === 0) {
    const from = days
      ? new Date(Date.parse(to + "T00:00:00Z") - (days - 1) * DAY_MS)
          .toISOString()
          .slice(0, 10)
      : to;
    const { days: axis } = rangeAxis(from, to);
    return { days: axis, values: axis.map(() => 0) };
  }

  const perDay = new Map<string, number>();
  for (const r of rows) {
    const k = dayKey(r.created_at as string);
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }

  const firstDay = dayKey(rows[0].created_at as string);
  const from = days
    ? new Date(Date.parse(to + "T00:00:00Z") - (days - 1) * DAY_MS)
        .toISOString()
        .slice(0, 10)
    : firstDay;
  const { days: axis } = rangeAxis(from, to);

  // Seed the running total with everyone who signed up before the window.
  let running = 0;
  for (const r of rows) {
    if (dayKey(r.created_at as string) < axis[0]) running++;
  }
  const values = axis.map((day) => (running += perDay.get(day) ?? 0));

  return { days: axis, values };
}

function pctChange(cur: number, prior: number): number | null {
  if (prior === 0) return cur === 0 ? 0 : null;
  return ((cur - prior) / prior) * 100;
}

export async function getDashboard(range: DateRange): Promise<DashboardData> {
  const db = supabaseAdmin();
  const { days: axis, index } = rangeAxis(range.from, range.to);
  const prior = priorRange(range.from, range.to);
  const fromTs = startIso(range.from); // boundary between prior and current
  const today = todayUtc();

  const [stats, signupRes, mailRes, allSignupsRes, contactedRes] =
    await Promise.all([
      signupStats(),
      db
        .from("beta_signups")
        .select("created_at")
        .gte("created_at", startIso(prior.from))
        .lte("created_at", endIso(range.to))
        .limit(60000),
      db
        .from("email_log")
        .select("email, sent_at, opened_at, clicked_at, status")
        .gte("sent_at", startIso(prior.from))
        .lte("sent_at", endIso(range.to))
        .limit(120000),
      // Full list (email + status) for contact-based segments.
      db.from("beta_signups").select("email, status").limit(60000),
      // Every email we've ever attempted — to know who has been contacted.
      db.from("email_log").select("email").limit(200000),
    ]);

  // ---- Signups: split current vs prior; daily spark for current ----
  const signupSpark = emptyLine(axis.length);
  let curSignups = 0;
  let priorSignups = 0;
  for (const r of signupRes.data ?? []) {
    const ts = r.created_at as string;
    if (ts >= fromTs) {
      curSignups++;
      const i = index.get(dayKey(ts));
      if (i !== undefined) signupSpark[i]++;
    } else {
      priorSignups++;
    }
  }

  // ---- Email: split current vs prior; sparks; today's count ----
  const sentSpark = emptyLine(axis.length);
  const openSpark = emptyLine(axis.length);
  const clickSpark = emptyLine(axis.length);
  let curSent = 0, curOpened = 0, curClicked = 0;
  let priorSent = 0, priorOpened = 0, priorClicked = 0;
  let sentToday = 0;
  let failed = 0;
  const curRecipients = new Set<string>();
  for (const r of mailRes.data ?? []) {
    const sentAt = r.sent_at as string | null;
    const current = sentAt ? sentAt >= fromTs : false;
    // Everything except 'failed' counts as a send (the webhook moves rows to
    // 'delivered', so matching only 'sent' undercounts and breaks the funnel).
    if (r.status === "failed") {
      if (current) failed++;
    } else {
      if (current) {
        curSent++;
        const email = normalizeEmail(r.email as string | null);
        if (email) curRecipients.add(email);
        const i = index.get(dayKey(sentAt as string));
        if (i !== undefined) sentSpark[i]++;
        if (sentAt && dayKey(sentAt) === today) sentToday++;
      } else priorSent++;
    }
    if (r.opened_at) {
      if (current) {
        curOpened++;
        const i = index.get(dayKey(r.opened_at as string));
        if (i !== undefined) openSpark[i]++;
      } else priorOpened++;
    }
    if (r.clicked_at) {
      if (current) {
        curClicked++;
        const i = index.get(dayKey(r.clicked_at as string));
        if (i !== undefined) clickSpark[i]++;
      } else priorClicked++;
    }
  }

  const openRate = curSent > 0 ? curOpened / curSent : 0;
  const priorOpenRate = priorSent > 0 ? priorOpened / priorSent : 0;
  const clickRate = curSent > 0 ? curClicked / curSent : 0;
  const priorClickRate = priorSent > 0 ? priorClicked / priorSent : 0;

  const rangeDays = axis.length;
  const kpis: Kpi[] = [
    {
      key: "subscribers",
      label: "Total subscribers",
      value: stats.total,
      isRate: false,
      deltaPct: pctChange(curSignups, priorSignups),
      spark: signupSpark,
      note: `+${curSignups} in ${rangeDays}d`,
    },
    {
      key: "reach",
      label: "Campaign reach",
      value: curSent,
      isRate: false,
      deltaPct: pctChange(curSent, priorSent),
      spark: sentSpark,
    },
    {
      key: "openRate",
      label: "Open rate",
      value: openRate,
      isRate: true,
      deltaPct: pctChange(openRate, priorOpenRate),
      spark: openSpark,
    },
    {
      key: "clickRate",
      label: "Click rate",
      value: clickRate,
      isRate: true,
      deltaPct: pctChange(clickRate, priorClickRate),
      spark: clickSpark,
    },
  ];

  // ---- Conversion: recipients emailed in range who are now active ----
  let converted = 0;
  const recipients = [...curRecipients];
  for (let i = 0; i < recipients.length; i += 500) {
    const chunk = recipients.slice(i, i + 500);
    const { count } = await db
      .from("beta_signups")
      .select("email", { count: "exact", head: true })
      .eq("status", "active")
      .in("email", chunk);
    converted += count ?? 0;
  }
  // Converted can't exceed Clicked (you must click to convert).
  const convertedCapped = Math.min(converted, curClicked);

  // Step-conversion funnel: Sent is the 100% base; each later stage is a % of
  // the stage above it. Every value is therefore 0–100%.
  const funnel: FunnelStage[] = [
    {
      key: "sent",
      label: "Sent",
      value: curSent,
      pct: curSent > 0 ? 1 : null,
      hint: "total sent",
    },
    {
      key: "opened",
      label: "Opened",
      value: curOpened,
      pct: curSent > 0 ? curOpened / curSent : null,
      hint: `of ${curSent.toLocaleString()} sent`,
    },
    {
      key: "clicked",
      label: "Clicked",
      value: curClicked,
      pct: curOpened > 0 ? curClicked / curOpened : null,
      hint: `of ${curOpened.toLocaleString()} opened`,
    },
    {
      key: "converted",
      label: "Converted",
      value: curClicked > 0 ? convertedCapped : null,
      pct: curClicked > 0 ? convertedCapped / curClicked : null,
      hint: `of ${curClicked.toLocaleString()} clicked`,
    },
  ];

  // ---- Segments by actual contact (not just the status field) ----
  const contacted = new Set<string>();
  for (const r of contactedRes.data ?? []) {
    const e = normalizeEmail(r.email as string | null);
    if (e) contacted.add(e);
  }
  let notContacted = 0;
  let contactedCount = 0;
  let active = 0;
  let unsubscribed = 0;
  for (const r of allSignupsRes.data ?? []) {
    const status = r.status as string;
    if (status === "unsubscribed") {
      unsubscribed++;
      continue;
    }
    if (status === "active") active++;
    if (contacted.has(normalizeEmail(r.email as string | null))) contactedCount++;
    else notContacted++;
  }

  const segments: Segment[] = [
    { key: "pending", label: "Not contacted", value: notContacted },
    { key: "contacted", label: "Contacted", value: contactedCount },
    { key: "active", label: "Active", value: active },
    { key: "unsubscribed", label: "Unsubscribed", value: unsubscribed },
  ];

  return {
    rangeStart: axis[0],
    rangeEnd: axis[axis.length - 1],
    kpis,
    funnel,
    segments,
    sentToday,
    failed,
  };
}

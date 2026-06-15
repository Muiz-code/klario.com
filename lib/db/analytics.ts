import { supabaseAdmin } from "@/lib/supabase/admin";
import { signupStats } from "@/lib/db/signups";
import { normalizeEmail } from "@/lib/duplicates";

/**
 * Dashboard analytics: daily time series for audience interactions (signups +
 * form submissions) and mail tracking (sent / opened / clicked), plus engagement
 * totals. Rows are fetched for the window and bucketed by UTC day in JS — fine
 * for a beta-scale list and avoids needing SQL RPCs.
 */

export type Series = {
  /** UTC day keys (YYYY-MM-DD), ascending, one per day in the window. */
  days: string[];
  lines: { key: string; label: string; values: number[] }[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** UTC YYYY-MM-DD for an ISO timestamp. */
function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Build an ascending list of UTC day keys covering the last `days` days. */
function buildAxis(days: number): { days: string[]; index: Map<string, number> } {
  const today = new Date();
  const end = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  const keys: string[] = [];
  const index = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(end - i * DAY_MS).toISOString().slice(0, 10);
    index.set(key, keys.length);
    keys.push(key);
  }
  return { days: keys, index };
}

function emptyLine(len: number): number[] {
  return new Array(len).fill(0);
}

function sinceIso(days: number): string {
  // Start at midnight UTC `days-1` days ago so the first bucket is complete.
  const today = new Date();
  const end = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  return new Date(end - (days - 1) * DAY_MS).toISOString();
}

/**
 * Audience interactions per day: new signups (beta_signups) and public form
 * submissions (submissions), bucketed by created_at.
 */
export async function getInteractionSeries(days = 30): Promise<Series> {
  const db = supabaseAdmin();
  const since = sinceIso(days);
  const { days: axis, index } = buildAxis(days);

  const [signupRes, submissionRes] = await Promise.all([
    db.from("beta_signups").select("created_at").gte("created_at", since).limit(20000),
    db.from("submissions").select("created_at").gte("created_at", since).limit(20000),
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

/**
 * Mail tracking per day: emails sent (status 'sent'), opens, and clicks,
 * bucketed by their respective timestamps.
 */
export async function getEngagementSeries(days = 30): Promise<Series> {
  const db = supabaseAdmin();
  const since = sinceIso(days);
  const { days: axis, index } = buildAxis(days);

  const { data } = await db
    .from("email_log")
    .select("sent_at, opened_at, clicked_at, status")
    .gte("sent_at", since)
    .limit(50000);

  const sent = emptyLine(axis.length);
  const opened = emptyLine(axis.length);
  const clicked = emptyLine(axis.length);

  for (const r of data ?? []) {
    if (r.status === "sent" && r.sent_at) {
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
  /** Raw value; rate KPIs are 0..1 and rendered as a percentage. */
  value: number;
  isRate: boolean;
  /** Percent change vs the previous equal-length window; null when N/A. */
  deltaPct: number | null;
  /** Per-day mini series for the sparkline; empty when not applicable. */
  spark: number[];
  /** Small text under the value (e.g. "of 105 signups"); optional. */
  note?: string;
};

export type FunnelStage = {
  key: string;
  label: string;
  value: number | null;
  /** Share of the top stage (0..1); null when value is unknown. */
  pct: number | null;
};

export type Segment = { key: string; label: string; value: number };

export type DashboardData = {
  /** Window bounds for the date-range label. */
  rangeStart: string;
  rangeEnd: string;
  kpis: Kpi[];
  /** Cumulative subscriber count per day across the window. */
  growthDays: string[];
  growth: number[];
  funnel: FunnelStage[];
  segments: Segment[];
};

function pctChange(cur: number, prior: number): number | null {
  if (prior === 0) return cur === 0 ? 0 : null;
  return ((cur - prior) / prior) * 100;
}

/**
 * Everything the redesigned Overview needs: KPI cards (value + delta vs the
 * prior window + sparkline), cumulative audience growth, the email funnel, and
 * audience segments — all from real tables. Metrics with no data source are
 * returned as null/derived rather than fabricated.
 */
export async function getDashboard(days = 30): Promise<DashboardData> {
  const db = supabaseAdmin();
  const { days: axis, index } = buildAxis(days);
  const since = sinceIso(days);
  const priorStart = sinceIso(days * 2); // start of the previous window

  const [stats, signupRes, mailRes] = await Promise.all([
    signupStats(),
    db
      .from("beta_signups")
      .select("created_at")
      .gte("created_at", priorStart)
      .limit(40000),
    db
      .from("email_log")
      .select("email, sent_at, opened_at, clicked_at, status")
      .gte("sent_at", priorStart)
      .limit(80000),
  ]);

  // Signups: split current vs prior window; daily spark for the current one.
  const signupSpark = emptyLine(axis.length);
  let curSignups = 0;
  let priorSignups = 0;
  for (const r of signupRes.data ?? []) {
    const ts = r.created_at as string;
    if (ts >= since) {
      curSignups++;
      const i = index.get(dayKey(ts));
      if (i !== undefined) signupSpark[i]++;
    } else {
      priorSignups++;
    }
  }

  // Email: split current vs prior; daily sparks for the current window.
  const sentSpark = emptyLine(axis.length);
  const openSpark = emptyLine(axis.length);
  const clickSpark = emptyLine(axis.length);
  let curSent = 0, curOpened = 0, curClicked = 0;
  let priorSent = 0, priorOpened = 0, priorClicked = 0;
  // Distinct recipients emailed in the current window — basis for conversion.
  const curRecipients = new Set<string>();
  for (const r of mailRes.data ?? []) {
    const sentAt = r.sent_at as string | null;
    const current = sentAt ? sentAt >= since : false;
    if (r.status === "sent") {
      if (current) {
        curSent++;
        const email = normalizeEmail(r.email as string | null);
        if (email) curRecipients.add(email);
        const i = index.get(dayKey(sentAt as string));
        if (i !== undefined) sentSpark[i]++;
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

  const kpis: Kpi[] = [
    {
      key: "subscribers",
      label: "Total subscribers",
      value: stats.total,
      isRate: false,
      deltaPct: pctChange(curSignups, priorSignups),
      spark: signupSpark,
      note: `+${curSignups} in ${days}d`,
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

  // Cumulative subscriber growth across the window. Start from the count that
  // existed before the window (total minus everyone who signed up within it).
  const start = Math.max(0, stats.total - curSignups);
  const growth: number[] = [];
  let running = start;
  for (let i = 0; i < axis.length; i++) {
    running += signupSpark[i];
    growth.push(running);
  }

  // Conversion: of the recipients emailed in the window, how many are now
  // active subscribers. Chunked to stay under Postgres' `IN (...)` limits.
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

  const funnel: FunnelStage[] = [
    { key: "sent", label: "Sent", value: curSent, pct: 1 },
    {
      key: "opened",
      label: "Opened",
      value: curOpened,
      pct: curSent > 0 ? curOpened / curSent : null,
    },
    {
      key: "clicked",
      label: "Clicked",
      value: curClicked,
      pct: curSent > 0 ? curClicked / curSent : null,
    },
    {
      key: "converted",
      label: "Converted",
      value: curSent > 0 ? converted : null,
      pct: curSent > 0 ? converted / curSent : null,
    },
  ];

  const segments: Segment[] = [
    { key: "pending", label: "New (pending)", value: stats.pending },
    { key: "invited", label: "Invited", value: stats.invited },
    { key: "active", label: "Active", value: stats.active },
    { key: "unsubscribed", label: "Unsubscribed", value: stats.unsubscribed },
  ];

  return {
    rangeStart: axis[0],
    rangeEnd: axis[axis.length - 1],
    kpis,
    growthDays: axis,
    growth,
    funnel,
    segments,
  };
}

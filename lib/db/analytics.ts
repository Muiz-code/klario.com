import { supabaseAdmin } from "@/lib/supabase/admin";

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

export type EngagementTotals = {
  sent: number;
  opened: number;
  clicked: number;
  /** 0..1 */
  openRate: number;
  /** 0..1 */
  clickRate: number;
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

/** Aggregate sent / opened / clicked and the derived rates over the window. */
export async function getEngagementTotals(days = 30): Promise<EngagementTotals> {
  const db = supabaseAdmin();
  const since = sinceIso(days);

  const { data } = await db
    .from("email_log")
    .select("opened_at, clicked_at, status")
    .gte("sent_at", since)
    .limit(50000);

  let sent = 0;
  let opened = 0;
  let clicked = 0;
  for (const r of data ?? []) {
    if (r.status === "sent") sent++;
    if (r.opened_at) opened++;
    if (r.clicked_at) clicked++;
  }

  return {
    sent,
    opened,
    clicked,
    openRate: sent > 0 ? opened / sent : 0,
    clickRate: sent > 0 ? clicked / sent : 0,
  };
}

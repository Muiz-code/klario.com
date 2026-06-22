import { supabaseAdmin } from "@/lib/supabase/admin";

/** True for the "relation/table not found" error you get before a migration runs. */
function isMissingTable(e: { code?: string; message?: string } | null): boolean {
  return (
    !!e &&
    (e.code === "PGRST205" ||
      /schema cache|does not exist/i.test(e.message || ""))
  );
}

export type TrackInput = {
  type: "pageview" | "click";
  path?: string | null;
  label?: string | null;
  href?: string | null;
  referrer?: string | null;
  session?: string | null;
};

export async function recordEvent(e: TrackInput): Promise<void> {
  const db = supabaseAdmin();
  const cap = (v: string | null | undefined, n: number) =>
    typeof v === "string" ? v.slice(0, n) : null;
  const { error } = await db.from("analytics_events").insert({
    type: e.type,
    path: cap(e.path, 512),
    label: cap(e.label, 200),
    href: cap(e.href, 512),
    referrer: cap(e.referrer, 512),
    session: cap(e.session, 80),
  });
  if (error && !isMissingTable(error)) {
    console.error("[db] recordEvent failed:", error.message);
  }
}

export type AnalyticsOverview = {
  days: string[];
  visits: number[];
  clicks: number[];
  totals: { visits: number; visitors: number; clicks: number };
  topPages: { path: string; count: number }[];
  topClicks: { label: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  blogViews: { path: string; count: number }[];
};

function utcDayKey(iso: string): string {
  return iso.slice(0, 10);
}

function lastNDays(n: number): string[] {
  // Build day keys without Date.now() pitfalls: derive from the newest row time
  // is unreliable, so use the current date here (server runtime).
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - i
      )
    );
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function getAnalyticsOverview(
  days = 30
): Promise<AnalyticsOverview> {
  const db = supabaseAdmin();
  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await db
    .from("analytics_events")
    .select("type, path, label, href, referrer, session, created_at")
    .gte("created_at", since)
    .limit(100000);

  const dayKeys = lastNDays(days);
  const visitsByDay = new Map(dayKeys.map((d) => [d, 0]));
  const clicksByDay = new Map(dayKeys.map((d) => [d, 0]));

  if (error || !data) {
    if (error && !isMissingTable(error)) {
      console.error("[db] getAnalyticsOverview failed:", error.message);
    }
    return {
      days: dayKeys,
      visits: dayKeys.map(() => 0),
      clicks: dayKeys.map(() => 0),
      totals: { visits: 0, visitors: 0, clicks: 0 },
      topPages: [],
      topClicks: [],
      topReferrers: [],
      blogViews: [],
    };
  }

  const sessions = new Set<string>();
  const pageCount = new Map<string, number>();
  const clickCount = new Map<string, number>();
  const refCount = new Map<string, number>();
  const blogCount = new Map<string, number>();
  let visits = 0;
  let clicks = 0;

  const bump = (m: Map<string, number>, k: string) =>
    m.set(k, (m.get(k) ?? 0) + 1);

  for (const row of data) {
    const day = utcDayKey(row.created_at as string);
    if (row.type === "pageview") {
      visits++;
      if (visitsByDay.has(day)) visitsByDay.set(day, visitsByDay.get(day)! + 1);
      if (row.session) sessions.add(row.session as string);
      const path = (row.path as string) || "/";
      bump(pageCount, path);
      if (path.startsWith("/blog/")) bump(blogCount, path);
      if (row.referrer) {
        try {
          const host = new URL(row.referrer as string).hostname;
          if (host) bump(refCount, host);
        } catch {
          /* ignore unparseable referrers */
        }
      }
    } else if (row.type === "click") {
      clicks++;
      if (clicksByDay.has(day)) clicksByDay.set(day, clicksByDay.get(day)! + 1);
      const label =
        ((row.label as string) || (row.href as string) || "(unlabeled)").trim();
      bump(clickCount, label);
    }
  }

  const top = (m: Map<string, number>, n: number) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, count]) => ({ k, count }));

  return {
    days: dayKeys,
    visits: dayKeys.map((d) => visitsByDay.get(d) ?? 0),
    clicks: dayKeys.map((d) => clicksByDay.get(d) ?? 0),
    totals: { visits, visitors: sessions.size, clicks },
    topPages: top(pageCount, 10).map((x) => ({ path: x.k, count: x.count })),
    topClicks: top(clickCount, 10).map((x) => ({ label: x.k, count: x.count })),
    topReferrers: top(refCount, 8).map((x) => ({
      referrer: x.k,
      count: x.count,
    })),
    blogViews: top(blogCount, 8).map((x) => ({ path: x.k, count: x.count })),
  };
}

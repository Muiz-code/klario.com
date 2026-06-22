import { TrendChart, type ChartLine } from "../dashboard/_components/TrendChart";
import { getAnalyticsOverview } from "@/lib/db/analytics-events";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const configured = isSupabaseConfigured();
  const data = configured
    ? await getAnalyticsOverview(30)
    : {
        days: [],
        visits: [],
        clicks: [],
        totals: { visits: 0, visitors: 0, clicks: 0 },
        topPages: [],
        topClicks: [],
        topReferrers: [],
        blogViews: [],
      };

  const lines: ChartLine[] = [
    { key: "visits", label: "Visits", values: data.visits, color: "#d4a853" },
    { key: "clicks", label: "Clicks", values: data.clicks, color: "#2b7fd6" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Analytics</h1>
        <p className="mt-1 text-sm text-bg/55">
          First-party traffic for the public site, last 30 days. Admin pages are
          not tracked.
        </p>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Visits" value={data.totals.visits} />
        <Kpi label="Unique visitors" value={data.totals.visitors} />
        <Kpi label="Clicks" value={data.totals.clicks} />
      </div>

      <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
        <h2 className="mb-4 text-sm font-medium text-bg/80">
          Visits &amp; clicks over time
        </h2>
        <div className="text-bg">
          <TrendChart days={data.days} lines={lines} legend="sum" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ListCard
          title="Top pages"
          rows={data.topPages.map((p) => ({ label: p.path, count: p.count }))}
          empty="No pageviews yet."
        />
        <ListCard
          title="Most clicked"
          rows={data.topClicks.map((c) => ({ label: c.label, count: c.count }))}
          empty="No clicks tracked yet."
        />
        <ListCard
          title="Top referrers"
          rows={data.topReferrers.map((r) => ({
            label: r.referrer,
            count: r.count,
          }))}
          empty="No referrers yet (direct traffic only)."
        />
        <ListCard
          title="Most-read posts"
          rows={data.blogViews.map((b) => ({
            label: b.path.replace("/blog/", ""),
            count: b.count,
          }))}
          empty="No blog reads yet."
        />
      </div>

      <p className="text-[12px] leading-relaxed text-bg/40">
        Traffic is also sent to Vercel Web Analytics. Enable it once under your
        project&apos;s Analytics tab on the Vercel dashboard to see geography,
        devices and Core Web Vitals there.
      </p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
      <p className="font-display text-3xl text-bg">{value.toLocaleString()}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-bg/45">
        {label}
      </p>
    </div>
  );
}

function ListCard({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; count: number }[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
      <h2 className="mb-3 text-sm font-medium text-bg/80">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-[13px] text-bg/40">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-bg/70" title={r.label}>
                {r.label}
              </span>
              <span className="shrink-0 font-mono text-[12px] text-gold">
                {r.count.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

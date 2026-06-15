import Link from "next/link";
import { signupStats } from "@/lib/db/signups";
import { sentCountSince } from "@/lib/db/email-log";
import {
  getInteractionSeries,
  getEngagementSeries,
  getEngagementTotals,
  type Series,
  type EngagementTotals,
} from "@/lib/db/analytics";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { TrendChart, type ChartLine } from "./_components/TrendChart";

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 30;

const COLORS: Record<string, string> = {
  signups: "#d4a853",
  submissions: "#5b9cff",
  sent: "#5b9cff",
  opened: "#d4a853",
  clicked: "#00b86b",
};

const emptySeries: Series = { days: [], lines: [] };

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  const [stats, sent7, interactions, engagement, totals]: [
    Awaited<ReturnType<typeof signupStats>>,
    number,
    Series,
    Series,
    EngagementTotals,
  ] = configured
    ? await Promise.all([
        signupStats(),
        sentCountSince(7),
        getInteractionSeries(WINDOW_DAYS),
        getEngagementSeries(WINDOW_DAYS),
        getEngagementTotals(WINDOW_DAYS),
      ])
    : [
        { total: 0, pending: 0, invited: 0, active: 0, unsubscribed: 0 },
        0,
        emptySeries,
        emptySeries,
        { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 },
      ];

  const withColor = (s: Series): ChartLine[] =>
    s.lines.map((l) => ({ ...l, color: COLORS[l.key] ?? "#d4a853" }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-bg">Overview</h1>
        <p className="mt-1 text-sm text-bg/55">
          The beta list and email activity at a glance.
        </p>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured. Set the Supabase env vars to see live numbers.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Total signups" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Invited" value={stats.invited} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Sent (7 days)" value={sent7} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Audience interactions"
          subtitle={`New signups and form submissions · last ${WINDOW_DAYS} days`}
        >
          <TrendChart days={interactions.days} lines={withColor(interactions)} />
        </ChartCard>

        <ChartCard
          title="Mail tracking"
          subtitle={`Sent, opened, and clicked · last ${WINDOW_DAYS} days`}
          aside={
            <div className="flex items-center gap-4">
              <Rate label="Open rate" rate={totals.openRate} />
              <Rate label="Click rate" rate={totals.clickRate} />
            </div>
          }
        >
          <TrendChart days={engagement.days} lines={withColor(engagement)} />
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Action
          href="/p@ss1/subscribers"
          title="Manage subscribers"
          body="Import a CSV, search, filter, and send the welcome email."
        />
        <Action
          href="/p@ss1/email"
          title="Beta invite"
          body="Preview the welcome email, edit the subject and CTA, send a test."
        />
        <Action
          href="/p@ss1/newsletters/new"
          title="Compose mail"
          body="Pick a template, write your message, add an image, send to the list."
        />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  aside,
  children,
}: {
  title: string;
  subtitle: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg text-bg">{title}</p>
          <p className="mt-0.5 text-[12px] text-bg/50">{subtitle}</p>
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Rate({ label, rate }: { label: string; rate: number }) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-bg/45">
        {label}
      </p>
      <p className="font-display text-xl text-bg">
        {(rate * 100).toFixed(rate >= 0.1 ? 0 : 1)}%
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
        {label}
      </p>
      <p className="font-display mt-2 text-3xl text-bg">{value}</p>
    </div>
  );
}

function Action({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-bg/10 bg-bg/4 p-6 transition-colors hover:border-gold/40"
    >
      <p className="font-display text-lg text-bg">{title}</p>
      <p className="mt-1 text-sm text-bg/55">{body}</p>
    </Link>
  );
}

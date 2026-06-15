import Link from "next/link";
import {
  Users,
  Send,
  MailOpen,
  MousePointerClick,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  Upload,
  FlaskConical,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  getDashboard,
  getInteractionSeries,
  getEngagementSeries,
  getGrowthSeries,
  resolveRange,
  type DashboardData,
  type Kpi,
  type Series,
  type GrowthSeries,
} from "@/lib/db/analytics";
import { listAuditEvents, type AuditEvent } from "@/lib/db/audit";
import { listNewsletters, type Newsletter } from "@/lib/db/newsletters";
import { listFailedSends, type FailedSend } from "@/lib/db/email-log";
import { getAdminEmail } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { TrendChart, type ChartLine } from "./_components/TrendChart";
import { Sparkline } from "./_components/Sparkline";
import { Funnel } from "./_components/Funnel";
import { DateRangePicker } from "./_components/DateRangePicker";
import { NotificationBell } from "./_components/NotificationBell";
import { AudienceGrowth } from "./_components/AudienceGrowth";

export const dynamic = "force-dynamic";

const SERIES_COLORS: Record<string, string> = {
  signups: "#d4a853",
  submissions: "#5b9cff",
  sent: "#5b9cff",
  opened: "#d4a853",
  clicked: "#00b86b",
};

const emptySeries: Series = { days: [], lines: [] };

const KPI_ICON: Record<string, typeof Users> = {
  subscribers: Users,
  reach: Send,
  openRate: MailOpen,
  clickRate: MousePointerClick,
};

const ACTIVITY_ICON: Record<string, typeof Mail> = {
  beta_invite: Send,
  newsletter: Mail,
  test_send: FlaskConical,
  import: Upload,
};

const emptyDashboard: DashboardData = {
  rangeStart: "",
  rangeEnd: "",
  kpis: [],
  funnel: [],
  segments: [],
  sentToday: 0,
  failed: 0,
};

const emptyGrowth: GrowthSeries = { days: [], values: [] };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const range = resolveRange(from, to);
  const configured = isSupabaseConfigured();
  const [
    email,
    data,
    events,
    newsletters,
    interactions,
    engagement,
    failures,
    growth,
  ]: [
    string | null,
    DashboardData,
    AuditEvent[],
    Newsletter[],
    Series,
    Series,
    FailedSend[],
    GrowthSeries,
  ] = configured
    ? await Promise.all([
        getAdminEmail(),
        getDashboard(range),
        listAuditEvents(6),
        listNewsletters(),
        getInteractionSeries(range),
        getEngagementSeries(range),
        listFailedSends(20),
        getGrowthSeries(null),
      ])
    : [null, emptyDashboard, [], [], emptySeries, emptySeries, [], emptyGrowth];

  const name = email ? email.split("@")[0] : "there";
  const campaigns = newsletters
    .filter((n) => n.status === "sent")
    .slice(0, 5);
  const withColor = (s: Series): ChartLine[] =>
    s.lines.map((l) => ({ ...l, color: SERIES_COLORS[l.key] ?? "#d4a853" }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-bg">
            {greeting()}, <span className="capitalize">{name}</span>
          </h1>
          <p className="mt-1 text-sm text-bg/55">
            Here&apos;s what&apos;s happening with your marketing today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-bg/12 bg-bg/4 px-3 py-2 text-[13px] text-bg/70">
            <Send size={13} className="text-gold" />
            <span className="font-medium text-bg">{data.sentToday}</span> sent today
          </span>
          <DateRangePicker from={range.from} to={range.to} />
          <NotificationBell failures={configured ? failures : []} />
        </div>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Supabase is not configured. Set the Supabase env vars to see live numbers.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(configured ? data.kpis : PLACEHOLDER_KPIS).map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>

      {/* Segments */}
      <Panel title="Audience segments" subtitle="Your list by status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(configured ? data.segments : PLACEHOLDER_SEGMENTS).map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-bg/8 bg-bg/3 p-4"
            >
              <p className="text-[12px] text-bg/55">{s.label}</p>
              <p className="font-display mt-1 text-2xl text-bg">
                {s.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Quick actions */}
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

      {/* Growth + Activity */}
      <div className="grid gap-4 lg:grid-cols-12">
        <AudienceGrowth
          className="lg:col-span-8"
          initial={growth}
          initialKey="all"
        />

        <Panel
          className="lg:col-span-4"
          title="Recent activity"
          action={{ href: "/p@ss1/audit", label: "View all" }}
        >
          {events.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {events.map((e) => (
                <ActivityRow key={e.id} event={e} />
              ))}
            </ul>
          ) : (
            <Empty label="No activity yet." />
          )}
        </Panel>
      </div>

      {/* Funnel + Campaigns */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          className="lg:col-span-5"
          title="Email funnel"
          subtitle="How recipients move through your sends"
        >
          {data.funnel.length > 0 ? (
            <Funnel stages={data.funnel} />
          ) : (
            <Empty />
          )}
        </Panel>

        <Panel
          className="lg:col-span-7"
          title="Top campaign performance"
          subtitle="Your most recent sends"
          action={{ href: "/p@ss1/newsletters", label: "View all campaigns" }}
        >
          {campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px] text-sm">
                <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-bg/40">
                  <tr>
                    <th className="pb-3 font-medium">Campaign</th>
                    <th className="pb-3 font-medium">Sent</th>
                    <th className="pb-3 font-medium">Recipients</th>
                    <th className="pb-3 text-right font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-bg/8 text-bg/80"
                    >
                      <td className="max-w-[220px] truncate py-3 pr-3 text-bg">
                        {c.subject}
                      </td>
                      <td className="py-3">{c.sent_count.toLocaleString()}</td>
                      <td className="py-3">
                        {c.recipient_count.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-[12px] text-bg/55">
                        {c.sent_at ? formatDate(c.sent_at) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty label="No campaigns sent yet." />
          )}
        </Panel>
      </div>

      {/* Analytics: interactions + mail tracking */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Audience interactions"
          subtitle="New signups and form submissions"
        >
          {interactions.days.length > 0 ? (
            <TrendChart days={interactions.days} lines={withColor(interactions)} />
          ) : (
            <Empty />
          )}
        </Panel>
        <Panel title="Mail tracking" subtitle="Sent, opened, and clicked">
          {engagement.days.length > 0 ? (
            <TrendChart days={engagement.days} lines={withColor(engagement)} />
          ) : (
            <Empty />
          )}
        </Panel>
      </div>
    </div>
  );
}

// ───────────────────────────── Components ──────────────────────────────────

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = KPI_ICON[kpi.key] ?? ActivityIcon;
  const up = kpi.deltaPct !== null && kpi.deltaPct >= 0;
  return (
    <div className="flex flex-col rounded-2xl border border-bg/10 bg-bg/4 p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12 text-gold">
          <Icon size={16} strokeWidth={1.9} />
        </span>
        <span className="text-[12px] text-bg/55">{kpi.label}</span>
      </div>
      <p className="font-display mt-3 text-3xl text-bg">{formatKpi(kpi)}</p>
      <div className="mt-1 flex items-center gap-1.5 text-[12px]">
        {kpi.deltaPct !== null ? (
          <span
            className={
              "inline-flex items-center gap-0.5 font-medium " +
              (up ? "text-accent-green" : "text-red-400")
            }
          >
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(kpi.deltaPct).toFixed(1)}%
          </span>
        ) : kpi.note ? (
          <span className="text-bg/45">{kpi.note}</span>
        ) : null}
        {kpi.deltaPct !== null && (
          <span className="text-bg/40">vs prior period</span>
        )}
      </div>
      <div className="mt-3">
        <Sparkline id={kpi.key} values={kpi.spark} />
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-bg/10 bg-bg/4 p-5 " + (className ?? "")
      }
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg text-bg">{title}</p>
          {subtitle && <p className="mt-0.5 text-[12px] text-bg/50">{subtitle}</p>}
        </div>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-bg/12 px-2.5 py-1 text-[11px] text-bg/65 hover:border-gold/40 hover:text-bg"
          >
            {action.label}
            <ChevronRight size={12} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function ActivityRow({ event }: { event: AuditEvent }) {
  const Icon = ACTIVITY_ICON[event.action] ?? ActivityIcon;
  const title = activityTitle(event);
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold">
        <Icon size={13} strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-bg/85">{title}</p>
        <p className="truncate text-[11px] text-bg/45">
          {event.recipient_count > 0
            ? `${event.recipient_count.toLocaleString()} recipients`
            : event.template || "-"}
        </p>
      </div>
      <span className="shrink-0 text-[11px] text-bg/40">
        {timeAgo(event.created_at)}
      </span>
    </li>
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

function Empty({ label = "No data yet." }: { label?: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-bg/10 text-[12px] text-bg/40">
      {label}
    </div>
  );
}

// ───────────────────────────── Helpers ─────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatKpi(kpi: Kpi): string {
  if (kpi.isRate) {
    const pct = kpi.value * 100;
    return `${pct.toFixed(pct >= 10 ? 1 : 1)}%`;
  }
  if (kpi.value >= 1000) {
    return `${(kpi.value / 1000).toFixed(kpi.value >= 10000 ? 0 : 1)}K`;
  }
  return kpi.value.toLocaleString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function activityTitle(e: AuditEvent): string {
  if (e.subject) return e.subject;
  switch (e.action) {
    case "beta_invite":
      return "Beta invite sent";
    case "newsletter":
      return "Newsletter sent";
    case "test_send":
      return "Test email sent";
    case "import":
      return "Contacts imported";
    default:
      return "Activity";
  }
}

// Shown only when Supabase is not configured, so cards aren't blank.
const PLACEHOLDER_KPIS: Kpi[] = [
  { key: "subscribers", label: "Total subscribers", value: 0, isRate: false, deltaPct: null, spark: [], note: "-" },
  { key: "reach", label: "Campaign reach", value: 0, isRate: false, deltaPct: null, spark: [], note: "-" },
  { key: "openRate", label: "Open rate", value: 0, isRate: true, deltaPct: null, spark: [], note: "-" },
  { key: "clickRate", label: "Click rate", value: 0, isRate: true, deltaPct: null, spark: [], note: "-" },
];

const PLACEHOLDER_SEGMENTS = [
  { key: "pending", label: "Not contacted", value: 0 },
  { key: "contacted", label: "Contacted", value: 0 },
  { key: "active", label: "Active", value: 0 },
  { key: "unsubscribed", label: "Unsubscribed", value: 0 },
];

import Link from "next/link";
import { signupStats } from "@/lib/db/signups";
import { sentCountSince } from "@/lib/db/email-log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  const [stats, sent7] = configured
    ? await Promise.all([signupStats(), sentCountSince(7)])
    : [
        { total: 0, pending: 0, invited: 0, active: 0, unsubscribed: 0 },
        0,
      ];

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

"use client";

import { useState } from "react";
import { ListChecks, Users, Mail, Activity as ActivityIcon } from "lucide-react";
import { AuditTable } from "./AuditTable";
import { RecipientsPanel } from "./RecipientsPanel";
import { AllMailPanel } from "./AllMailPanel";
import type { AuditEvent } from "@/lib/db/audit";
import type { AdminActivity } from "@/lib/db/adminActivity";

/**
 * Two views of delivery. "Activity" is our own audit events (what we logged).
 * "Recipients" reads straight from Resend and groups by person — the complete,
 * accurate record of how many times each user got a mail, since our log misses
 * sends made across separate drafts.
 */
export function AuditViews({
  events,
  activity = [],
}: {
  events: AuditEvent[];
  activity?: AdminActivity[];
}) {
  const [tab, setTab] = useState<"activity" | "recipients" | "allmail" | "team">("activity");
  // When you open a campaign's recipients from an Activity row, this pre-filters
  // the Recipients tab to that subject.
  const [focusSubject, setFocusSubject] = useState<string | null>(null);

  const openRecipients = (subject: string) => {
    setFocusSubject(subject);
    setTab("recipients");
  };

  const tabBtn = (active: boolean) =>
    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-colors " +
    (active
      ? "bg-gold text-ink font-medium"
      : "border border-bg/12 text-bg/70 hover:text-bg");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setTab("activity")} className={tabBtn(tab === "activity")}>
          <ListChecks size={15} /> Activity
        </button>
        <button type="button" onClick={() => setTab("recipients")} className={tabBtn(tab === "recipients")}>
          <Users size={15} /> Recipients
        </button>
        <button type="button" onClick={() => setTab("allmail")} className={tabBtn(tab === "allmail")}>
          <Mail size={15} /> All mail
        </button>
        <button type="button" onClick={() => setTab("team")} className={tabBtn(tab === "team")}>
          <ActivityIcon size={15} /> Team activity
        </button>
      </div>

      {tab === "activity" ? (
        <AuditTable events={events} onOpenRecipients={openRecipients} />
      ) : tab === "recipients" ? (
        <RecipientsPanel focusSubject={focusSubject} />
      ) : tab === "allmail" ? (
        <AllMailPanel />
      ) : (
        <TeamActivity activity={activity} />
      )}
    </div>
  );
}

/** Everything the team does on the system — who did what, when. */
function TeamActivity({ activity }: { activity: AdminActivity[] }) {
  if (activity.length === 0) {
    return (
      <p className="rounded-2xl border border-bg/10 bg-bg/4 p-6 text-sm text-bg/55">
        No team activity yet. Sends, invites, role changes and edits will appear here.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-bg/10">
      <ul className="max-h-[70vh] overflow-y-auto">
        {activity.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between gap-3 border-b border-bg/6 px-4 py-2.5 text-[13px] last:border-0"
          >
            <span className="min-w-0 text-bg/85">
              <span className="text-gold/80">{a.actor_email}</span>{" "}
              {a.action}
              {a.target ? <span className="text-bg/50"> · {a.target}</span> : ""}
            </span>
            <span suppressHydrationWarning className="shrink-0 text-[11px] text-bg/40">
              {new Date(a.created_at).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

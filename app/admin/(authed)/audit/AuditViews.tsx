"use client";

import { useState } from "react";
import { ListChecks, Users, Mail, Activity as ActivityIcon } from "lucide-react";
import { AuditTable } from "./AuditTable";
import { RecipientsPanel } from "./RecipientsPanel";
import { AllMailPanel } from "./AllMailPanel";
import { ActivityTimeline } from "./ActivityTimeline";
import type { AuditEvent } from "@/lib/db/audit";
import type { TimelineEvent } from "@/lib/db/activityTimeline";

/**
 * Two views of delivery. "Activity" is our own audit events (what we logged).
 * "Recipients" reads straight from Resend and groups by person — the complete,
 * accurate record of how many times each user got a mail, since our log misses
 * sends made across separate drafts.
 */
export function AuditViews({
  events,
  timeline = [],
}: {
  events: AuditEvent[];
  timeline?: TimelineEvent[];
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
          <ActivityIcon size={15} /> Everything
        </button>
      </div>

      {tab === "activity" ? (
        <AuditTable events={events} onOpenRecipients={openRecipients} />
      ) : tab === "recipients" ? (
        <RecipientsPanel focusSubject={focusSubject} />
      ) : tab === "allmail" ? (
        <AllMailPanel />
      ) : (
        <ActivityTimeline events={timeline} />
      )}
    </div>
  );
}

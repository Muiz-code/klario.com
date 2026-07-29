import { galleryTemplates } from "@/lib/email/gallery";
import { listCustomTemplates } from "@/lib/db/templates";
import { listSignups } from "@/lib/db/signups";
import {
  getMailedEmails,
  getDeliveryProblems,
  getEmailsMailedSince,
} from "@/lib/db/email-log";
import { normalizeEmail } from "@/lib/duplicates";
import { listAnchorResponses } from "@/lib/db/anchorClub";
import { listBetaResponses } from "@/lib/db/betaResponses";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { ComposeStudio } from "./ComposeStudio";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const configured = isSupabaseConfigured();
  const todayIso = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
  const [custom, signups, mailedEmails, mailedTodayEmails, problems, anchors, betas] = configured
    ? await Promise.all([
        listCustomTemplates(),
        listSignups({ limit: 50000 }),
        getMailedEmails(),
        getEmailsMailedSince(todayIso),
        getDeliveryProblems(),
        listAnchorResponses(),
        listBetaResponses(),
      ])
    : [[], [], [] as string[], [] as string[], { failed: [] as string[], bounced: [] as string[] }, [], []];
  // Saved templates first, then the built-in starters.
  const templates = [...custom, ...galleryTemplates()];
  // "New" = never sent any mail (not in the email log), matching the audience
  // page's "Unmailed". "Existing" = already mailed.
  const mailedSet = new Set(mailedEmails.map(normalizeEmail));
  const mailedTodaySet = new Set(mailedTodayEmails.map(normalizeEmail));
  const failedSet = new Set(
    [...problems.failed, ...problems.bounced].map(normalizeEmail)
  );
  const active = signups.filter((s) => s.status !== "unsubscribed");
  const counts = {
    all: active.length,
    new: active.filter((s) => !mailedSet.has(normalizeEmail(s.email))).length,
    existing: active.filter((s) => mailedSet.has(normalizeEmail(s.email))).length,
    failed: active.filter((s) => failedSet.has(normalizeEmail(s.email))).length,
    sent_today: active.filter((s) => mailedTodaySet.has(normalizeEmail(s.email))).length,
    not_today: active.filter((s) => !mailedTodaySet.has(normalizeEmail(s.email))).length,
  };

  // Lightweight list for the picker (exclude unsubscribed). `mailed` lets the
  // client filter to the "new"/"existing" segment; `failed` flags addresses
  // whose last delivery failed or bounced.
  const people = active.map((s) => ({
    email: s.email,
    name: [s.first_name, s.last_name].filter(Boolean).join(" "),
    status: s.status,
    mailed: mailedSet.has(normalizeEmail(s.email)),
    mailedToday: mailedTodaySet.has(normalizeEmail(s.email)),
    failed: failedSet.has(normalizeEmail(s.email)),
  }));

  // Extra audiences drawn from other tables/sources: Anchor Club applicants,
  // Beta responders, and newsletter-source signups. Selecting one sends to those
  // exact emails (via the "choose" path).
  const uniq = (arr: string[]) => [...new Set(arr.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  const audiences = {
    anchor: uniq(anchors.map((r) => r.email)),
    beta: uniq(betas.map((r) => r.email)),
    newsletter: uniq(
      active.filter((s) => (s.source || "").toLowerCase() === "newsletter").map((s) => s.email)
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Compose mail</h1>
        <p className="mt-1 text-sm text-bg/55">
          Pick a template, edit it (including the HTML), add an image, and send to
          your subscribers.
        </p>
      </div>
      <ComposeStudio
        templates={templates}
        counts={counts}
        people={people}
        audiences={audiences}
        configured={configured}
      />
    </div>
  );
}

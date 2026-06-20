import { galleryTemplates } from "@/lib/email/gallery";
import { listCustomTemplates } from "@/lib/db/templates";
import { listSignups } from "@/lib/db/signups";
import { getMailedEmails } from "@/lib/db/email-log";
import { normalizeEmail } from "@/lib/duplicates";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { ComposeStudio } from "./ComposeStudio";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const configured = isSupabaseConfigured();
  const [custom, signups, mailedEmails] = configured
    ? await Promise.all([
        listCustomTemplates(),
        listSignups({ limit: 50000 }),
        getMailedEmails(),
      ])
    : [[], [], [] as string[]];
  // Saved templates first, then the built-in starters.
  const templates = [...custom, ...galleryTemplates()];
  // "New" = never sent any mail (not in the email log), matching the audience
  // page's "Unmailed". "Existing" = already mailed.
  const mailedSet = new Set(mailedEmails.map(normalizeEmail));
  const active = signups.filter((s) => s.status !== "unsubscribed");
  const counts = {
    all: active.length,
    new: active.filter((s) => !mailedSet.has(normalizeEmail(s.email))).length,
    existing: active.filter((s) => mailedSet.has(normalizeEmail(s.email))).length,
  };

  // Lightweight list for the picker (exclude unsubscribed). `mailed` lets the
  // client filter to the "new" (unmailed) or "existing" (mailed) segment.
  const people = active.map((s) => ({
    email: s.email,
    name: [s.first_name, s.last_name].filter(Boolean).join(" "),
    status: s.status,
    mailed: mailedSet.has(normalizeEmail(s.email)),
  }));

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
        configured={configured}
      />
    </div>
  );
}

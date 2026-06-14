import { galleryTemplates } from "@/lib/email/gallery";
import { listSignups } from "@/lib/db/signups";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { ComposeStudio } from "./ComposeStudio";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const templates = galleryTemplates();
  const configured = isSupabaseConfigured();
  const signups = configured ? await listSignups({ limit: 50000 }) : [];
  const counts = {
    all: signups.filter((s) => s.status !== "unsubscribed").length,
    new: signups.filter((s) => s.status === "pending").length,
    existing: signups.filter(
      (s) => s.status === "invited" || s.status === "active"
    ).length,
  };

  // Lightweight list for the "choose people" picker (exclude unsubscribed).
  const people = signups
    .filter((s) => s.status !== "unsubscribed")
    .map((s) => ({
      email: s.email,
      name: [s.first_name, s.last_name].filter(Boolean).join(" "),
      status: s.status,
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

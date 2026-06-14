import { getSettings } from "@/lib/db/settings";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { WELCOME_TEMPLATE_HTML } from "@/lib/email/welcome";
import { EmailStudio } from "./EmailStudio";

export const dynamic = "force-dynamic";

export default async function EmailPage() {
  const configured = isSupabaseConfigured();
  const settings = configured
    ? await getSettings()
    : {
        id: "default",
        welcome_subject: "Welcome to the Klario beta",
        welcome_cta_url: "https://www.klario.finance",
        deliverability_confirmed: false,
        updated_at: new Date(0).toISOString(),
      };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Beta invite</h1>
        <p className="mt-1 text-sm text-bg/55">
          The welcome email sent to beta signups. Preview it, edit the subject and
          CTA, and send yourself a test before sending to the list.
        </p>
      </div>

      <EmailStudio
        template={WELCOME_TEMPLATE_HTML}
        initialSubject={settings.welcome_subject}
        initialCtaUrl={settings.welcome_cta_url}
        initialDeliverability={settings.deliverability_confirmed}
        configured={configured}
      />
    </div>
  );
}

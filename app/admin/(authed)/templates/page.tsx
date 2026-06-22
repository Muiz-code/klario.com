import { galleryTemplates } from "@/lib/email/gallery";
import { listCustomTemplates } from "@/lib/db/templates";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { TemplatesView, type TemplateItem } from "./TemplatesView";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const configured = isSupabaseConfigured();

  const builtins: TemplateItem[] = galleryTemplates().map((t) => ({
    ...t,
    custom: false,
  }));
  const custom: TemplateItem[] = configured
    ? (await listCustomTemplates()).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        subject: t.subject,
        html: t.html,
        custom: true,
      }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">Templates</h1>
        <p className="mt-1 text-sm text-bg/55">
          Ready-made email layouts and your own saved designs. Preview one, then
          use it to start a campaign - you can edit everything before sending.
        </p>
      </div>

      <TemplatesView builtins={builtins} custom={custom} configured={configured} />
    </div>
  );
}

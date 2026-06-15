import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GalleryTemplate } from "@/lib/email/gallery";

/** A saved template. Shares the GalleryTemplate shape so it drops into the same
 * UI and the compose gallery, with extra fields for management. */
export type CustomTemplate = GalleryTemplate & {
  custom: true;
  created_at: string;
};

export async function listCustomTemplates(): Promise<CustomTemplate[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("[db] listCustomTemplates failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string) ?? "",
    subject: (r.subject as string) ?? "",
    html: r.html as string,
    custom: true as const,
    created_at: r.created_at as string,
  }));
}

export async function createTemplate(input: {
  name: string;
  description: string;
  subject: string;
  html: string;
}): Promise<CustomTemplate | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("email_templates")
    .insert({
      name: input.name,
      description: input.description,
      subject: input.subject,
      html: input.html,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[db] createTemplate failed:", error.message);
    return null;
  }
  return {
    id: data.id as string,
    name: data.name as string,
    description: (data.description as string) ?? "",
    subject: (data.subject as string) ?? "",
    html: data.html as string,
    custom: true as const,
    created_at: data.created_at as string,
  };
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db.from("email_templates").delete().eq("id", id);
  if (error) {
    console.error("[db] deleteTemplate failed:", error.message);
    return false;
  }
  return true;
}

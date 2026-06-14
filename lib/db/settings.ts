import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE } from "@/lib/constants";

export type Settings = {
  id: string;
  welcome_subject: string;
  welcome_cta_url: string;
  deliverability_confirmed: boolean;
  updated_at: string;
};

const DEFAULTS: Omit<Settings, "updated_at"> = {
  id: "default",
  welcome_subject: "Welcome to the Klario beta",
  welcome_cta_url: SITE.url,
  deliverability_confirmed: false,
};

export async function getSettings(): Promise<Settings> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data) {
    return { ...DEFAULTS, updated_at: new Date(0).toISOString() };
  }
  return data as Settings;
}

export async function updateSettings(patch: {
  welcome_subject?: string;
  welcome_cta_url?: string;
  deliverability_confirmed?: boolean;
}): Promise<Settings | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("settings")
    .upsert({
      id: "default",
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) {
    console.error("[db] updateSettings failed:", error.message);
    return null;
  }
  return data as Settings;
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only service-role client for the KAIRO APP database — a *separate*
 * Supabase project from this marketing site. Used only to cross-reference
 * Anchor Club applicants against their app profile (Klario ID + performance),
 * joined by email. Server-only. Never import into a Client Component or expose
 * the key to the browser.
 *
 * Configure with APP_SUPABASE_URL and APP_SUPABASE_SERVICE_ROLE_KEY (the app
 * project's values — distinct from this site's NEXT_PUBLIC_SUPABASE_URL /
 * SUPABASE_SERVICE_ROLE_KEY). Returns null when not configured so the admin
 * degrades gracefully instead of throwing.
 */
let cached: SupabaseClient | null = null;

export function appSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.APP_SUPABASE_URL;
  const serviceKey = process.env.APP_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isAppSupabaseConfigured(): boolean {
  return Boolean(
    process.env.APP_SUPABASE_URL && process.env.APP_SUPABASE_SERVICE_ROLE_KEY
  );
}

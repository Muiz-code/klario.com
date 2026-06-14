import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isAdminEmail } from "./allowlist";

export { isAdminEmail };

/**
 * Auth-aware server client bound to the request cookies. Use this to read the
 * logged-in admin session in Server Components, layouts, and route handlers.
 * Uses the public anon key plus the session cookie, never the service role key.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component (read-only cookies). The
          // session refresh is handled in proxy.ts, so this is safe to ignore.
        }
      },
    },
  });
}

/** Returns the logged-in admin email, or null if not signed in / not allowed. */
export async function getAdminEmail(): Promise<string | null> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return isAdminEmail(user.email) ? user.email : null;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "./allowlist";

/**
 * Refreshes the Supabase auth session on every matched request and reports
 * whether the caller is an allow-listed admin. Cookie writes are mirrored onto
 * the response so the refreshed session sticks.
 */
export async function updateSession(req: NextRequest): Promise<{
  res: NextResponse;
  isAdmin: boolean;
}> {
  let res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured yet, do not block: treat as not-admin so the
  // login page still renders and API routes return their own 401s.
  if (!url || !anon) return { res, isAdmin: false };

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        toSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { res, isAdmin: isAdminEmail(user?.email) };
}

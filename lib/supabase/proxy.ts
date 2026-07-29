import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "./allowlist";

/**
 * Membership status for a non-owner session, via the REST API with the
 * service-role key (admin_members is RLS-locked). Env admins short-circuit
 * before this, so it only runs for non-owner sessions.
 */
export type MemberStatus = {
  found: boolean; // a member row exists (even if disabled)
  active: boolean;
  mustChange: boolean;
  isSuperadmin: boolean;
  capabilities: string[];
};

async function memberStatus(
  baseUrl: string,
  email: string | null | undefined
): Promise<MemberStatus> {
  const none: MemberStatus = { found: false, active: false, mustChange: false, isSuperadmin: false, capabilities: [] };
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !email) return none;
  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/admin_members?select=status,must_change_password,role:admin_roles(is_superadmin,capabilities)&email=eq.${encodeURIComponent(
        email.toLowerCase()
      )}&limit=1`,
      { headers: { apikey: key, authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return none;
    const rows = (await res.json()) as {
      status?: string;
      must_change_password?: boolean;
      role?: { is_superadmin?: boolean; capabilities?: string[] } | null;
    }[];
    const row = Array.isArray(rows) ? rows[0] : undefined;
    if (!row) return none;
    const active = row.status === "active";
    return {
      found: true,
      active,
      mustChange: active && !!row.must_change_password,
      isSuperadmin: !!row.role?.is_superadmin,
      capabilities: row.role?.capabilities ?? [],
    };
  } catch {
    return none;
  }
}

/**
 * Refreshes the Supabase auth session on every matched request and reports
 * whether the caller is an allow-listed admin. Cookie writes are mirrored onto
 * the response so the refreshed session sticks.
 */
export async function updateSession(req: NextRequest): Promise<{
  res: NextResponse;
  isAdmin: boolean;
  memberFound: boolean;
  mustChangePassword: boolean;
  isSuperadmin: boolean;
  capabilities: string[];
}> {
  let res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured yet, do not block: treat as not-admin so the
  // login page still renders and API routes return their own 401s.
  if (!url || !anon)
    return { res, isAdmin: false, memberFound: false, mustChangePassword: false, isSuperadmin: false, capabilities: [] };

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

  if (isAdminEmail(user?.email)) {
    return { res, isAdmin: true, memberFound: false, mustChangePassword: false, isSuperadmin: true, capabilities: [] };
  }
  const s = await memberStatus(url, user?.email);
  return {
    res,
    isAdmin: s.active,
    memberFound: s.found,
    mustChangePassword: s.mustChange,
    isSuperadmin: s.isSuperadmin,
    capabilities: s.capabilities,
  };
}

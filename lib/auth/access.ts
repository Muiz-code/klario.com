import { supabaseServer, isSupabaseAuthConfigured } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/allowlist";
import { getMemberWithRole } from "@/lib/db/rbac";
import { ALL_CAPABILITIES, type Capability } from "@/lib/auth/capabilities";

/**
 * The current admin's resolved access. Env ADMIN_EMAILS are break-glass
 * superadmins (always full access); everyone else is an invited member whose
 * capabilities come from their role. THIS is the security boundary — the sidebar
 * only hides things, so pages and API routes must check capabilities here.
 */
export type Access = {
  email: string;
  isSuperadmin: boolean;
  capabilities: Set<Capability>;
  mustChangePassword: boolean;
};

async function sessionEmail(): Promise<string | null> {
  if (!isSupabaseAuthConfigured()) return null;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email?.toLowerCase() ?? null;
}

export async function getAccess(): Promise<Access | null> {
  const email = await sessionEmail();
  if (!email) return null;

  if (isAdminEmail(email)) {
    return {
      email,
      isSuperadmin: true,
      capabilities: new Set(ALL_CAPABILITIES),
      mustChangePassword: false,
    };
  }

  const member = await getMemberWithRole(email);
  if (!member || member.status !== "active") return null;

  const isSuper = !!member.role?.is_superadmin;
  return {
    email,
    isSuperadmin: isSuper,
    capabilities: new Set(isSuper ? ALL_CAPABILITIES : member.role?.capabilities ?? []),
    mustChangePassword: member.must_change_password,
  };
}

export function can(access: Access | null, cap: Capability): boolean {
  return !!access && access.capabilities.has(cap);
}

/** API-route guard: returns the access when allowed, else null (→ 403). */
export async function requireApiCapability(
  cap: Capability
): Promise<Access | null> {
  const a = await getAccess();
  return a && a.capabilities.has(cap) ? a : null;
}

/** API-route guard for superadmin-only endpoints. */
export async function requireSuperadmin(): Promise<Access | null> {
  const a = await getAccess();
  return a?.isSuperadmin ? a : null;
}

/**
 * Guard for team & roles management: superadmins, or members granted the
 * `settings` capability (delegated team managers). Note: superadmin *status*
 * itself stays env-owner-only — settings managers can't create superadmin roles
 * or invite superadmins (blocked separately).
 */
export async function requireTeamAccess(): Promise<Access | null> {
  const a = await getAccess();
  if (!a) return null;
  return a.isSuperadmin || a.capabilities.has("settings") ? a : null;
}

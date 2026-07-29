import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/duplicates";
import type { Capability } from "@/lib/auth/capabilities";

export type AdminRole = {
  id: string;
  name: string;
  capabilities: Capability[];
  is_superadmin: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminMember = {
  id: string;
  email: string;
  role_id: string | null;
  status: "active" | "disabled";
  must_change_password: boolean;
  invited_by: string | null;
  invited_at: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberWithRole = AdminMember & { role: AdminRole | null };

// ───────────────────────────── Roles ────────────────────────────────────────

export async function listRoles(): Promise<AdminRole[]> {
  const db = supabaseAdmin();
  const { data, error } = await db.from("admin_roles").select("*").order("name");
  if (error) {
    console.error("[rbac] listRoles:", error.message);
    return [];
  }
  return (data ?? []) as AdminRole[];
}

export async function createRole(input: {
  name: string;
  capabilities: Capability[];
  is_superadmin?: boolean;
}): Promise<AdminRole | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("admin_roles")
    .insert({
      name: input.name,
      capabilities: input.capabilities,
      is_superadmin: input.is_superadmin ?? false,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[rbac] createRole:", error.message);
    return null;
  }
  return data as AdminRole;
}

export async function updateRole(
  id: string,
  input: { name?: string; capabilities?: Capability[]; is_superadmin?: boolean }
): Promise<AdminRole | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("admin_roles")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    console.error("[rbac] updateRole:", error.message);
    return null;
  }
  return data as AdminRole;
}

export async function deleteRole(id: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db.from("admin_roles").delete().eq("id", id);
  if (error) console.error("[rbac] deleteRole:", error.message);
  return !error;
}

// ──────────────────────────── Members ───────────────────────────────────────

export async function listMembers(): Promise<MemberWithRole[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("admin_members")
    .select("*, role:admin_roles(*)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[rbac] listMembers:", error.message);
    return [];
  }
  return (data ?? []) as MemberWithRole[];
}

/** The member + their role for a given email (case-insensitive), or null. */
export async function getMemberWithRole(
  email: string
): Promise<MemberWithRole | null> {
  const e = normalizeEmail(email);
  if (!e) return null;
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("admin_members")
    .select("*, role:admin_roles(*)")
    .eq("email", e)
    .maybeSingle();
  if (error) {
    console.error("[rbac] getMemberWithRole:", error.message);
    return null;
  }
  return (data as MemberWithRole) ?? null;
}

export async function getMemberById(id: string): Promise<MemberWithRole | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("admin_members")
    .select("*, role:admin_roles(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[rbac] getMemberById:", error.message);
    return null;
  }
  return (data as MemberWithRole) ?? null;
}

export async function createMember(input: {
  email: string;
  role_id: string | null;
  invited_by: string | null;
  mustChangePassword?: boolean;
}): Promise<AdminMember | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("admin_members")
    .insert({
      email: normalizeEmail(input.email),
      role_id: input.role_id,
      invited_by: input.invited_by,
      status: "active",
      must_change_password: input.mustChangePassword ?? true,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[rbac] createMember:", error.message);
    return null;
  }
  return data as AdminMember;
}

export async function updateMember(
  id: string,
  input: Partial<Pick<AdminMember, "role_id" | "status" | "must_change_password" | "last_login_at">>
): Promise<AdminMember | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("admin_members")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    console.error("[rbac] updateMember:", error.message);
    return null;
  }
  return data as AdminMember;
}

export async function deleteMember(id: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db.from("admin_members").delete().eq("id", id);
  if (error) console.error("[rbac] deleteMember:", error.message);
  return !error;
}

/** Clear the forced-password-change flag once a member sets their own password. */
export async function clearMustChangePassword(email: string): Promise<void> {
  const e = normalizeEmail(email);
  if (!e) return;
  const db = supabaseAdmin();
  await db
    .from("admin_members")
    .update({ must_change_password: false, last_login_at: new Date().toISOString() })
    .eq("email", e);
}

import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/duplicates";

export type SignupStatus = "pending" | "invited" | "active" | "unsubscribed";

export type Signup = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  status: SignupStatus;
  source: string | null;
  phone: string | null;
  device: string | null;
  banks: string | null;
  invited_at: string | null;
  created_at: string;
  unsubscribed_at: string | null;
};

export type SignupInput = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  source?: string | null;
  phone?: string | null;
  device?: string | null;
  banks?: string | null;
};

/**
 * Insert or update a subscriber by email. Never downgrades an existing status
 * (e.g. an already-invited person who refills a form stays invited). Returns
 * the row, or null on error.
 *
 * `opts.touch` bumps `created_at` to now so a returning subscriber visibly
 * resurfaces at the top of the (newest-first) audience list, instead of the
 * update silently doing nothing when there are no gaps to fill.
 */
export async function upsertSignup(
  input: SignupInput,
  opts?: { touch?: boolean }
): Promise<Signup | null> {
  const email = input.email.trim().toLowerCase();
  const db = supabaseAdmin();

  const { data: existing } = await db
    .from("beta_signups")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    // Only fill gaps; do not clobber a known status or existing fields.
    const patch: Partial<Signup> = {};
    if (!existing.first_name && input.first_name) patch.first_name = input.first_name;
    if (!existing.last_name && input.last_name) patch.last_name = input.last_name;
    if (!existing.phone && input.phone) patch.phone = input.phone;
    if (!existing.device && input.device) patch.device = input.device;
    if (!existing.banks && input.banks) patch.banks = input.banks;
    if (opts?.touch) patch.created_at = new Date().toISOString();
    if (Object.keys(patch).length === 0) return existing as Signup;
    const { data, error } = await db
      .from("beta_signups")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();
    return error ? (existing as Signup) : (data as Signup);
  }

  const { data, error } = await db
    .from("beta_signups")
    .insert({
      email,
      first_name: input.first_name ?? null,
      last_name: input.last_name ?? null,
      source: input.source ?? null,
      phone: input.phone ?? null,
      device: input.device ?? null,
      banks: input.banks ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[db] upsertSignup failed:", error.message);
    return null;
  }
  return data as Signup;
}

export async function listSignups(opts?: {
  status?: SignupStatus;
  search?: string;
  limit?: number;
}): Promise<Signup[]> {
  const db = supabaseAdmin();
  let q = db
    .from("beta_signups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 1000);

  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.search) {
    const s = opts.search.replace(/[%,]/g, " ").trim();
    if (s) q = q.or(`email.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%`);
  }

  const { data, error } = await q;
  if (error) {
    console.error("[db] listSignups failed:", error.message);
    return [];
  }
  return (data ?? []) as Signup[];
}

export async function getSignupsByIds(ids: string[]): Promise<Signup[]> {
  if (ids.length === 0) return [];
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("beta_signups")
    .select("*")
    .in("id", ids);
  if (error) {
    console.error("[db] getSignupsByIds failed:", error.message);
    return [];
  }
  return (data ?? []) as Signup[];
}

export async function markInvited(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = supabaseAdmin();
  const { error } = await db
    .from("beta_signups")
    .update({ status: "invited", invited_at: new Date().toISOString() })
    .in("id", ids);
  if (error) console.error("[db] markInvited failed:", error.message);
}

export async function setStatus(id: string, status: SignupStatus): Promise<boolean> {
  const db = supabaseAdmin();
  // Stamp the unsubscribe time when moving to unsubscribed; clear it otherwise.
  const patch = {
    status,
    unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null,
  };
  const { error } = await db.from("beta_signups").update(patch).eq("id", id);
  if (error) {
    console.error("[db] setStatus failed:", error.message);
    return false;
  }
  return true;
}

/**
 * Merge subscriber rows that share the same normalized email (case / spacing /
 * Gmail-dot variants the UNIQUE constraint can't catch). Keeps the oldest row,
 * fills its blank fields from the duplicates, settles on the strongest status
 * (an unsubscribe always wins), then deletes the extra rows.
 */
export async function mergeDuplicateSignups(): Promise<{
  groups: number;
  removed: number;
}> {
  const db = supabaseAdmin();
  const { data, error } = await db.from("beta_signups").select("*").limit(20000);
  if (error || !data) {
    if (error) console.error("[db] mergeDuplicateSignups read failed:", error.message);
    return { groups: 0, removed: 0 };
  }
  const rows = data as Signup[];

  const groups = new Map<string, Signup[]>();
  for (const r of rows) {
    const norm = normalizeEmail(r.email);
    if (!norm) continue;
    (groups.get(norm) ?? groups.set(norm, []).get(norm)!).push(r);
  }

  const statusRank: Record<SignupStatus, number> = {
    unsubscribed: 3,
    active: 2,
    invited: 1,
    pending: 0,
  };

  let groupCount = 0;
  let removed = 0;

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    groupCount++;

    // Keep the oldest row as the primary.
    const sorted = [...group].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const primary = sorted[0];
    const others = sorted.slice(1);

    // Fill the primary's blanks from the duplicates.
    const patch: Record<string, string | null> = {};
    const fields: (keyof Signup)[] = ["first_name", "last_name", "phone", "device", "banks"];
    for (const f of fields) {
      if (!primary[f]) {
        const filled = others.find((o) => o[f]);
        if (filled) patch[f] = filled[f] as string;
      }
    }
    // Settle the status: an unsubscribe always wins; otherwise take the strongest.
    let finalStatus = primary.status;
    for (const r of group) {
      if (statusRank[r.status] > statusRank[finalStatus]) finalStatus = r.status;
    }
    if (finalStatus !== primary.status) patch.status = finalStatus;

    if (Object.keys(patch).length > 0) {
      await db.from("beta_signups").update(patch).eq("id", primary.id);
    }
    const { error: delErr } = await db
      .from("beta_signups")
      .delete()
      .in("id", others.map((o) => o.id));
    if (delErr) {
      console.error("[db] mergeDuplicateSignups delete failed:", delErr.message);
      continue;
    }
    removed += others.length;
  }

  return { groups: groupCount, removed };
}

/** Correct a subscriber's email (e.g. a .con -> .com typo). */
export async function updateSignupEmail(
  id: string,
  email: string
): Promise<{ ok: true } | { error: string }> {
  const db = supabaseAdmin();
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { error: "That doesn't look like a valid email." };
  }
  const { error } = await db
    .from("beta_signups")
    .update({ email: clean })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return { error: "Another subscriber already uses that email." };
    }
    console.error("[db] updateSignupEmail failed:", error.message);
    return { error: "Could not update the email." };
  }
  return { ok: true };
}

export async function deleteSignup(id: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db.from("beta_signups").delete().eq("id", id);
  if (error) {
    console.error("[db] deleteSignup failed:", error.message);
    return false;
  }
  return true;
}

export async function unsubscribeByEmail(email: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("beta_signups")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("email", email.trim().toLowerCase());
  if (error) {
    console.error("[db] unsubscribeByEmail failed:", error.message);
    return false;
  }
  return true;
}

export type SignupStats = {
  total: number;
  pending: number;
  invited: number;
  active: number;
  unsubscribed: number;
};

export async function signupStats(): Promise<SignupStats> {
  const db = supabaseAdmin();
  const statuses: SignupStatus[] = [
    "pending",
    "invited",
    "active",
    "unsubscribed",
  ];

  const [totalRes, ...byStatus] = await Promise.all([
    db.from("beta_signups").select("*", { count: "exact", head: true }),
    ...statuses.map((s) =>
      db
        .from("beta_signups")
        .select("*", { count: "exact", head: true })
        .eq("status", s)
    ),
  ]);

  return {
    total: totalRes.count ?? 0,
    pending: byStatus[0].count ?? 0,
    invited: byStatus[1].count ?? 0,
    active: byStatus[2].count ?? 0,
    unsubscribed: byStatus[3].count ?? 0,
  };
}

export type ImportResult = {
  added: number;
  skipped: number;
  /** Emails that appeared more than once within the uploaded file. */
  fileDuplicates: string[];
  /** Emails skipped because they are already on the list. */
  existingDuplicates: string[];
};

/**
 * Bulk import for CSV upload. Inserts new emails, ignores ones that already
 * exist. Returns counts plus the specific emails that were duplicates - both
 * the ones repeated inside the file and the ones already on the list - so the
 * admin can identify exactly which addresses collided.
 */
export async function importSignups(
  rows: SignupInput[],
  source = "import"
): Promise<ImportResult> {
  if (rows.length === 0)
    return { added: 0, skipped: 0, fileDuplicates: [], existingDuplicates: [] };
  const db = supabaseAdmin();

  // Dedupe within the batch by email, tracking which emails repeated.
  const byEmail = new Map<string, SignupInput>();
  const fileDuplicates = new Set<string>();
  for (const r of rows) {
    const email = normalizeEmail(r.email);
    if (byEmail.has(email)) {
      fileDuplicates.add(email);
      continue;
    }
    byEmail.set(email, { ...r, email, source });
  }
  const unique = [...byEmail.values()];

  // Find which already exist.
  const emails = unique.map((r) => r.email);
  const { data: existingRows } = await db
    .from("beta_signups")
    .select("email")
    .in("email", emails);
  const existing = new Set((existingRows ?? []).map((r) => r.email));

  const toInsert = unique
    .filter((r) => !existing.has(r.email))
    .map((r) => ({
      email: r.email,
      first_name: r.first_name ?? null,
      last_name: r.last_name ?? null,
      phone: r.phone ?? null,
      source,
    }));

  if (toInsert.length > 0) {
    const { error } = await db.from("beta_signups").insert(toInsert);
    if (error) {
      console.error("[db] importSignups insert failed:", error.message);
      return {
        added: 0,
        skipped: unique.length,
        fileDuplicates: [...fileDuplicates],
        existingDuplicates: [...existing],
      };
    }
  }

  return {
    added: toInsert.length,
    skipped: unique.length - toInsert.length,
    fileDuplicates: [...fileDuplicates],
    existingDuplicates: [...existing],
  };
}

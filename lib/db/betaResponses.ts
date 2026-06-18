import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/duplicates";

export type BetaResponse = {
  id: string;
  created_at: string;
  ref: string | null;
  name: string | null;
  email: string;
  phone: string | null;
  method: string | null;
  pain: string[];
  sheetlife: string | null;
  trust: number | null;
  features: string[];
  price: string | null;
  dream: string | null;
  user_agent: string | null;
  referrer: string | null;
  confirmation_sent: boolean;
  /** The beta reference code the respondent typed (whoever referred them). */
  referred_by_ref: string | null;
  /** The referrer's response id, when the code matched an existing response. */
  referred_by_id: string | null;
  /** Submitter IP, for same-IP fraud clustering. */
  ip: string | null;
  /** Coarse device hash, for same-device fraud clustering. */
  fingerprint: string | null;
  /** Whether they confirmed their email. Referrals only count when verified. */
  verified: boolean;
  verified_at: string | null;
  /** AI fraud assessment (admin-triggered Claude classifier). Null until run. */
  ai_risk: number | null;
  ai_level: "low" | "medium" | "high" | null;
  ai_reasons: string[];
  ai_checked_at: string | null;
};

export type BetaResponseInput = {
  name?: string | null;
  email: string;
  phone?: string | null;
  method?: string | null;
  pain?: string[];
  sheetlife?: string | null;
  trust?: number | null;
  features?: string[];
  price?: string | null;
  dream?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  /** Raw referral code typed by the respondent (e.g. "KLR-AB3CD"). */
  referredByRef?: string | null;
  ip?: string | null;
  fingerprint?: string | null;
};

/** Normalize a typed referral code to the canonical KLR-XXXXX shape. */
export function normalizeRef(raw: string): string {
  return raw.trim().toUpperCase();
}

export async function getBetaResponseByRef(
  ref: string
): Promise<BetaResponse | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("beta_responses")
    .select("*")
    .eq("ref", normalizeRef(ref))
    .maybeSingle();
  if (error) {
    console.error("[db] getBetaResponseByRef failed:", error.message);
    return null;
  }
  return (data as BetaResponse) ?? null;
}

// Unambiguous charset (no 0/O/1/I) for human-readable references.
const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRef(): string {
  let s = "";
  for (let i = 0; i < 5; i++) {
    s += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  }
  return `KLR-${s}`;
}

/**
 * Insert a response, or update the existing one for that email (upsert by
 * email). New rows get a fresh KLR-XXXXX ref; updates keep their ref. Returns
 * the row (with its ref), or null on error.
 */
export async function upsertBetaResponse(
  input: BetaResponseInput
): Promise<BetaResponse | null> {
  const db = supabaseAdmin();
  const email = normalizeEmail(input.email);

  // Resolve the referral code, if any, to the referrer's row.
  let referredByRef: string | null = null;
  let referredById: string | null = null;
  if (input.referredByRef && input.referredByRef.trim()) {
    referredByRef = normalizeRef(input.referredByRef);
    const referrer = await getBetaResponseByRef(referredByRef);
    referredById = referrer?.id ?? null;
  }

  const fields = {
    name: input.name ?? null,
    phone: input.phone ?? null,
    method: input.method ?? null,
    pain: input.pain ?? [],
    sheetlife: input.sheetlife ?? null,
    trust: input.trust ?? null,
    features: input.features ?? [],
    price: input.price ?? null,
    dream: input.dream ?? null,
    user_agent: input.user_agent ?? null,
    referrer: input.referrer ?? null,
    referred_by_ref: referredByRef,
    referred_by_id: referredById,
    ip: input.ip ?? null,
    fingerprint: input.fingerprint ?? null,
  };

  const { data: existing } = await db
    .from("beta_responses")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    // Can't refer yourself.
    if (fields.referred_by_id === existing.id) fields.referred_by_id = null;
    const { data, error } = await db
      .from("beta_responses")
      .update({ ...fields, confirmation_sent: false })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) {
      console.error("[db] upsertBetaResponse update failed:", error.message);
      return existing as BetaResponse;
    }
    return data as BetaResponse;
  }

  // Insert with a generated ref; retry a couple of times on the rare collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = generateRef();
    const { data, error } = await db
      .from("beta_responses")
      .insert({ email, ref, ...fields })
      .select("*")
      .single();
    if (!error) return data as BetaResponse;
    if (!/duplicate|unique/i.test(error.message)) {
      console.error("[db] upsertBetaResponse insert failed:", error.message);
      return null;
    }
    // ref collided — loop and try a new one.
  }
  console.error("[db] upsertBetaResponse: could not allocate a unique ref");
  return null;
}

export async function markConfirmationSent(
  id: string,
  sent = true
): Promise<void> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("beta_responses")
    .update({ confirmation_sent: sent })
    .eq("id", id);
  if (error) console.error("[db] markConfirmationSent failed:", error.message);
}

export async function listBetaResponses(limit = 2000): Promise<BetaResponse[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("beta_responses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[db] listBetaResponses failed:", error.message);
    return [];
  }
  return (data ?? []) as BetaResponse[];
}

export async function getBetaResponse(id: string): Promise<BetaResponse | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("beta_responses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db] getBetaResponse failed:", error.message);
    return null;
  }
  return (data as BetaResponse) ?? null;
}

/** Mark an email as verified (it confirmed ownership of the inbox). */
export async function markVerified(email: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("beta_responses")
    .update({ verified: true, verified_at: new Date().toISOString() })
    .eq("email", normalizeEmail(email));
  if (error) {
    console.error("[db] markVerified failed:", error.message);
    return false;
  }
  return true;
}

/** Persist an AI fraud assessment onto a response row. */
export async function saveAiAssessment(
  id: string,
  a: { risk: number; level: "low" | "medium" | "high"; reasons: string[] }
): Promise<boolean> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("beta_responses")
    .update({
      ai_risk: a.risk,
      ai_level: a.level,
      ai_reasons: a.reasons,
      ai_checked_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    console.error("[db] saveAiAssessment failed:", error.message);
    return false;
  }
  return true;
}

/** How many responses came from this IP in the last `minutes` (rate limiting). */
export async function countRecentByIp(
  ip: string,
  minutes: number
): Promise<number> {
  if (!ip) return 0;
  const db = supabaseAdmin();
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count, error } = await db
    .from("beta_responses")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);
  if (error) {
    console.error("[db] countRecentByIp failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

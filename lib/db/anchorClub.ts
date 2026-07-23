import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/duplicates";

// Anchor Club registrations (public /anchor-club wizard). Mirrors the beta
// responses model but simpler: no referrals, fraud scoring, or verification.

export type AnchorResponse = {
  id: string;
  created_at: string;
  ref: string | null;
  name: string | null;
  email: string;
  phone: string | null;
  institution: string | null;
  level: string | null;
  area: string | null;
  why: string | null;
  excites: string[];
  challenge: string | null;
  /** Free-text "other" the respondent typed per question (key -> text). */
  notes: Record<string, string>;
  pledge: boolean;
  guidelines: boolean;
  user_agent: string | null;
  referrer: string | null;
  confirmation_sent: boolean;
};

export type AnchorResponseInput = {
  name?: string | null;
  email: string;
  phone?: string | null;
  institution?: string | null;
  level?: string | null;
  area?: string | null;
  why?: string | null;
  excites?: string[];
  challenge?: string | null;
  notes?: Record<string, string>;
  pledge?: boolean;
  guidelines?: boolean;
  user_agent?: string | null;
  referrer?: string | null;
};

/** Look up an existing registration by email (to detect a repeat submission). */
export async function getAnchorResponseByEmail(
  email: string
): Promise<AnchorResponse | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("anchor_club")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) {
    console.error("[db] getAnchorResponseByEmail failed:", error.message);
    return null;
  }
  return (data as AnchorResponse) ?? null;
}

// Public Anchor Club reference. Grouped like the app's Klario ID (KLR-BAHZ-S6F7)
// but with a distinct KAC- prefix, so it clearly reads as the Anchor Club
// application reference — not the product's Klario ID. It's the handle printed
// on the member card and the key the product app / its admin uses to reconcile
// an Anchor applicant with their Klario account (joined on email). Charset omits
// 0/O/1/I so it's unambiguous when read aloud or typed.
export const ANCHOR_REF_PREFIX = "KAC-";
export const ANCHOR_REF_RE = /^KAC-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRef(): string {
  const pick = () =>
    REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  const group = () => pick() + pick() + pick() + pick();
  return `${ANCHOR_REF_PREFIX}${group()}-${group()}`;
}

/**
 * Insert a registration, or update the existing one for that email (upsert by
 * email). New rows get a fresh KAC-XXXXX ref; updates keep their ref. Returns
 * the row (with its ref), or null on error.
 */
export async function upsertAnchorResponse(
  input: AnchorResponseInput
): Promise<AnchorResponse | null> {
  const db = supabaseAdmin();
  const email = normalizeEmail(input.email);
  if (!email) return null;

  const existing = await getAnchorResponseByEmail(email);
  const ref = existing?.ref ?? generateRef();

  const payload = {
    ref,
    name: input.name ?? null,
    email,
    phone: input.phone ?? null,
    institution: input.institution ?? null,
    level: input.level ?? null,
    area: input.area ?? null,
    why: input.why ?? null,
    excites: input.excites ?? [],
    challenge: input.challenge ?? null,
    notes: input.notes ?? {},
    pledge: input.pledge ?? false,
    guidelines: input.guidelines ?? false,
    user_agent: input.user_agent ?? null,
    referrer: input.referrer ?? null,
  };

  const { data, error } = await db
    .from("anchor_club")
    .upsert(payload, { onConflict: "email" })
    .select("*")
    .single();

  if (error) {
    console.error("[db] upsertAnchorResponse failed:", error.message);
    return null;
  }
  return data as AnchorResponse;
}

/** Mark that the confirmation email was sent (or failed). */
export async function markAnchorConfirmationSent(id: string, sent: boolean) {
  const db = supabaseAdmin();
  const { error } = await db
    .from("anchor_club")
    .update({ confirmation_sent: sent })
    .eq("id", id);
  if (error) {
    console.error("[db] markAnchorConfirmationSent failed:", error.message);
  }
}

/** All registrations, newest first (admin view). */
export async function listAnchorResponses(): Promise<AnchorResponse[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("anchor_club")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) {
    console.error("[db] listAnchorResponses failed:", error.message);
    return [];
  }
  return (data ?? []) as AnchorResponse[];
}

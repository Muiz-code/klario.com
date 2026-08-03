import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/duplicates";
import {
  getAppProfilesByEmails,
  getDeletedAccountsByEmails,
  type AppProfile,
  type DeletedAccount,
} from "@/lib/db/appProfiles";

/**
 * Every email we hold, from every source we hold it in, matched against the
 * Kairo app by email — so "who of our contacts actually uses the app" is one
 * list you can filter, not three pages you cross-reference by hand.
 *
 * This is the LIST layer: cheap enough for a few thousand contacts (one profiles
 * read per 300 emails). The per-user detail — Klario tasks, money, banks — is
 * fetched on demand by /api/admin/app-users/[email], the same way the mail
 * preview works.
 */

/** Where we know this email from. One contact can come from several. */
export type ContactSource = "subscriber" | "imported" | "anchor" | "beta";

export const CONTACT_SOURCES: { key: ContactSource; label: string }[] = [
  { key: "subscriber", label: "Audience" },
  { key: "imported", label: "Imported" },
  { key: "anchor", label: "Anchor Club" },
  { key: "beta", label: "Beta" },
];

export type AppUserRow = {
  email: string;
  name: string | null;
  sources: ContactSource[];
  /** Newest of the contact records we have for them. */
  firstSeen: string | null;
  /** Audience status, when they're a subscriber. */
  status: string | null;
  /** Their app profile, when the email matches one. */
  app: AppProfile | null;
  /** Set when they hard-deleted an app account at some point. */
  deleted: DeletedAccount | null;
};

type Contact = {
  email: string;
  name: string | null;
  sources: Set<ContactSource>;
  firstSeen: string | null;
  status: string | null;
};

function fullName(first?: unknown, last?: unknown): string | null {
  const name = [first, last]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(" ");
  return name || null;
}

/** Keep the earliest known date for a contact. */
function earlier(a: string | null, b: unknown): string | null {
  const s = typeof b === "string" && b ? b : null;
  if (!s) return a;
  if (!a) return s;
  return s < a ? s : a;
}

/**
 * Collect every contact email across the audience, the Anchor Club and the beta
 * responses, deduped by normalized email. Each source is fail-soft.
 */
async function collectContacts(): Promise<Map<string, Contact>> {
  const db = supabaseAdmin();
  const out = new Map<string, Contact>();

  const add = (
    rawEmail: unknown,
    source: ContactSource,
    opts?: { name?: string | null; at?: unknown; status?: string | null }
  ) => {
    const email = normalizeEmail(typeof rawEmail === "string" ? rawEmail : "");
    if (!email) return;
    const existing = out.get(email);
    if (existing) {
      existing.sources.add(source);
      existing.name = existing.name ?? opts?.name ?? null;
      existing.firstSeen = earlier(existing.firstSeen, opts?.at);
      existing.status = existing.status ?? opts?.status ?? null;
      return;
    }
    out.set(email, {
      email,
      name: opts?.name ?? null,
      sources: new Set([source]),
      firstSeen: typeof opts?.at === "string" ? opts.at : null,
      status: opts?.status ?? null,
    });
  };

  const [signups, anchors, betas] = await Promise.all([
    db
      .from("beta_signups")
      .select("email, first_name, last_name, source, status, created_at")
      .limit(10000),
    db.from("anchor_club").select("email, name, created_at").limit(5000),
    db.from("beta_responses").select("email, name, created_at").limit(5000),
  ]);

  if (signups.error) console.error("[appusers] signups failed:", signups.error.message);
  for (const row of signups.data ?? []) {
    const r = row as Record<string, unknown>;
    // An imported contact is still a subscriber; tag it as both so either
    // filter finds them.
    add(r.email, r.source === "import" ? "imported" : "subscriber", {
      name: fullName(r.first_name, r.last_name),
      at: r.created_at,
      status: typeof r.status === "string" ? r.status : null,
    });
    if (r.source === "import") add(r.email, "subscriber", { at: r.created_at });
  }

  if (anchors.error) console.error("[appusers] anchor failed:", anchors.error.message);
  for (const row of anchors.data ?? []) {
    const r = row as Record<string, unknown>;
    add(r.email, "anchor", {
      name: typeof r.name === "string" ? r.name : null,
      at: r.created_at,
    });
  }

  if (betas.error) console.error("[appusers] beta failed:", betas.error.message);
  for (const row of betas.data ?? []) {
    const r = row as Record<string, unknown>;
    add(r.email, "beta", {
      name: typeof r.name === "string" ? r.name : null,
      at: r.created_at,
    });
  }

  return out;
}

/**
 * The full contact list with each one's app account attached (null when that
 * email has never signed up in the app). Newest contact first.
 */
export async function listAppUsers(): Promise<AppUserRow[]> {
  const contacts = await collectContacts();
  const emails = [...contacts.keys()];
  if (emails.length === 0) return [];

  const [profiles, deleted] = await Promise.all([
    getAppProfilesByEmails(emails),
    getDeletedAccountsByEmails(emails),
  ]);

  const rows: AppUserRow[] = [...contacts.values()].map((c) => ({
    email: c.email,
    name: c.name,
    sources: [...c.sources],
    firstSeen: c.firstSeen,
    status: c.status,
    app: profiles.get(c.email) ?? null,
    deleted: deleted.get(c.email) ?? null,
  }));

  rows.sort((a, b) => {
    const x = a.firstSeen ?? "";
    const y = b.firstSeen ?? "";
    return x < y ? 1 : x > y ? -1 : a.email.localeCompare(b.email);
  });
  return rows;
}

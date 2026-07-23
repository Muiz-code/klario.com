import { appSupabaseAdmin } from "@/lib/supabase/appAdmin";
import { normalizeEmail } from "@/lib/duplicates";

// A slice of the app's `profiles` row — the Klario ID and the performance we
// surface next to an Anchor Club applicant. Read-only; lives in the app DB.
export type AppProfile = {
  id: string;
  email: string;
  klario_id: string | null;
  kairo_score: number | null;
  streak: number | null;
  plan: string | null;
  personality: string | null;
  account_type: string | null;
  kyc_status: string | null;
  created_at: string | null;
  /** Number of distinct days the user has been active in the app. */
  activeDays: number;
};

// What the applicant has actually done in the app — counts of the financial
// "tasks" they've set up / completed, keyed by the app user id.
export type ActivityCounts = {
  savingsGoals: number;
  debts: number;
  billsPaid: number;
  linkedBanks: number;
  transactions: number;
  scheduledTransfers: number;
};

export function emptyActivity(): ActivityCounts {
  return {
    savingsGoals: 0,
    debts: 0,
    billsPaid: 0,
    linkedBanks: 0,
    transactions: 0,
    scheduledTransfers: 0,
  };
}

const SELECT =
  "id, email, klario_id, kairo_score, streak, plan, personality, account_type, kyc_status, created_at, active_days";

function toProfile(row: Record<string, unknown>): AppProfile {
  const days = row.active_days;
  return {
    id: String(row.id ?? ""),
    email: String(row.email ?? ""),
    klario_id: (row.klario_id as string) ?? null,
    kairo_score: (row.kairo_score as number) ?? null,
    streak: (row.streak as number) ?? null,
    plan: (row.plan as string) ?? null,
    personality: (row.personality as string) ?? null,
    account_type: (row.account_type as string) ?? null,
    kyc_status: (row.kyc_status as string) ?? null,
    created_at: (row.created_at as string) ?? null,
    activeDays: Array.isArray(days) ? days.length : 0,
  };
}

/**
 * Look up app profiles for a set of Anchor applicant emails, returned as a map
 * keyed by normalized email. Emails are the only link between the two systems
 * (the Anchor ref KAC-… and the app's Klario ID KLR-… are minted separately).
 * Returns an empty map when the app DB isn't configured.
 */
export async function getAppProfilesByEmails(
  emails: string[]
): Promise<Map<string, AppProfile>> {
  const map = new Map<string, AppProfile>();
  const db = appSupabaseAdmin();
  if (!db) return map;

  const wanted = [...new Set(emails.map((e) => normalizeEmail(e)).filter(Boolean))];
  if (wanted.length === 0) return map;

  const CHUNK = 300; // keep the .in() list reasonable
  for (let i = 0; i < wanted.length; i += CHUNK) {
    const slice = wanted.slice(i, i + CHUNK);
    const { data, error } = await db
      .from("profiles")
      .select(SELECT)
      .in("email", slice);
    if (error) {
      console.error("[appdb] getAppProfilesByEmails failed:", error.message);
      continue;
    }
    for (const row of data ?? []) {
      const key = normalizeEmail((row as Record<string, unknown>).email as string);
      if (key) map.set(key, toProfile(row as Record<string, unknown>));
    }
  }
  return map;
}

// A tombstone left when someone hard-deletes their app account (survives the
// cascade). Lets us show "deleted before" even after the profile is gone.
export type DeletedAccount = {
  email: string;
  klario_id: string | null;
  last_deleted_at: string | null;
  deletion_count: number;
};

/**
 * Look up account-deletion tombstones for a set of emails (keyed by normalized
 * email). Empty when the app DB isn't configured, or when the deleted_accounts
 * table doesn't exist yet (the app migration hasn't been run) — it fails soft.
 */
export async function getDeletedAccountsByEmails(
  emails: string[]
): Promise<Map<string, DeletedAccount>> {
  const map = new Map<string, DeletedAccount>();
  const db = appSupabaseAdmin();
  if (!db) return map;
  const wanted = [...new Set(emails.map((e) => normalizeEmail(e)).filter(Boolean))];
  if (wanted.length === 0) return map;

  const CHUNK = 300;
  for (let i = 0; i < wanted.length; i += CHUNK) {
    const slice = wanted.slice(i, i + CHUNK);
    const { data, error } = await db
      .from("deleted_accounts")
      .select("email, klario_id, last_deleted_at, deletion_count")
      .in("email", slice);
    if (error) {
      console.error("[appdb] getDeletedAccountsByEmails failed:", error.message);
      continue;
    }
    for (const row of data ?? []) {
      const r = row as Record<string, unknown>;
      const key = normalizeEmail(r.email as string);
      if (key) {
        map.set(key, {
          email: key,
          klario_id: (r.klario_id as string) ?? null,
          last_deleted_at: (r.last_deleted_at as string) ?? null,
          deletion_count: (r.deletion_count as number) ?? 1,
        });
      }
    }
  }
  return map;
}

// Each activity table, and the ActivityCounts field it increments. All are
// keyed by `user_id` in the app DB.
const ACTIVITY_TABLES: { table: string; field: keyof ActivityCounts }[] = [
  { table: "savings_goals", field: "savingsGoals" },
  { table: "debts", field: "debts" },
  { table: "bill_payments", field: "billsPaid" },
  { table: "linked_banks", field: "linkedBanks" },
  { table: "transactions", field: "transactions" },
  { table: "scheduled_transfers", field: "scheduledTransfers" },
];

/**
 * Count the "tasks" each app user has done — savings goals, debts, bills paid,
 * linked banks, transactions, scheduled transfers — for a set of app user ids.
 * Returns a map keyed by user id (only ids with an app account are passed in).
 * Tolerant: a table that errors just leaves that count at zero.
 */
export async function getAppActivityByUserIds(
  userIds: string[]
): Promise<Map<string, ActivityCounts>> {
  const map = new Map<string, ActivityCounts>();
  const db = appSupabaseAdmin();
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!db || ids.length === 0) return map;
  for (const id of ids) map.set(id, emptyActivity());

  await Promise.all(
    ACTIVITY_TABLES.map(async ({ table, field }) => {
      const { data, error } = await db.from(table).select("user_id").in("user_id", ids);
      if (error) {
        console.error(`[appdb] activity ${table} failed:`, error.message);
        return;
      }
      for (const row of data ?? []) {
        const uid = String((row as Record<string, unknown>).user_id ?? "");
        const counts = map.get(uid);
        if (counts) counts[field] += 1;
      }
    })
  );
  return map;
}

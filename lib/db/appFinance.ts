import { appSupabaseAdmin } from "@/lib/supabase/appAdmin";
import { selectAllRows, chunk } from "@/lib/db/appQuery";

/**
 * What an app user actually has going on with their money — transaction volume,
 * budgets, savings goals + wallet, debts — plus when they were last active.
 * Read-only, batched: one paged query per table for the whole cohort.
 *
 * All amounts are returned in NAIRA. The app DB is inconsistent about units
 * (savings goals and the wallet are stored in kobo, budgets / debts /
 * transactions in naira), so the conversion happens here, once.
 */

/** One budget, savings goal or debt, with enough to draw a progress bar. */
export type ProgressItem = {
  label: string;
  /** Naira: the target — budget limit, goal target, or debt total. */
  target: number;
  /** Naira: progress towards it — spent, saved, or repaid. */
  current: number;
  /** Extra qualifier: "funded", "completed", "loan", … */
  tag?: string;
};

export type AppFinance = {
  /** profiles.last_active_date — the app stamps it each time it opens (YYYY-MM-DD). */
  lastActiveDay: string | null;
  /** Finest last-seen timestamp we can observe (device seen / newest record). */
  lastSeenAt: string | null;

  transactions: {
    count: number;
    debits: number;
    credits: number;
    /** Naira moved out / in. */
    spent: number;
    received: number;
    lastAt: string | null;
  };
  budgets: {
    count: number;
    funded: number;
    limit: number;
    spent: number;
    /** Budgets whose spend has passed the limit. */
    over: number;
    items: ProgressItem[];
  };
  savings: {
    goals: number;
    completed: number;
    target: number;
    saved: number;
    /** Savings-wallet balance (separate from goal balances). */
    wallet: number;
    items: ProgressItem[];
  };
  debts: {
    count: number;
    /** Naira owed in total, and repaid so far. */
    total: number;
    paid: number;
    monthly: number;
    items: ProgressItem[];
  };
};

export function emptyFinance(): AppFinance {
  return {
    lastActiveDay: null,
    lastSeenAt: null,
    transactions: { count: 0, debits: 0, credits: 0, spent: 0, received: 0, lastAt: null },
    budgets: { count: 0, funded: 0, limit: 0, spent: 0, over: 0, items: [] },
    savings: { goals: 0, completed: 0, target: 0, saved: 0, wallet: 0, items: [] },
    debts: { count: 0, total: 0, paid: 0, monthly: 0, items: [] },
  };
}

const ID_CHUNK = 200;
/** Per-user item lists are for eyeballing, not reporting — keep them short. */
const MAX_ITEMS = 8;

const num = (v: unknown) => Number(v ?? 0) || 0;
const kobo = (v: unknown) => num(v) / 100;
const str = (v: unknown) => (v == null ? "" : String(v));

/** Keep the latest of two ISO timestamps. */
function newer(a: string | null, b: unknown): string | null {
  const s = typeof b === "string" && b ? b : null;
  if (!s) return a;
  if (!a) return s;
  return s > a ? s : a;
}

/**
 * Money + presence for a set of app user ids, keyed by user id. Empty when the
 * app DB isn't configured. Every table is fail-soft: one that errors leaves its
 * section at zero rather than failing the page.
 */
export async function getAppFinanceByUserIds(
  userIds: string[]
): Promise<Map<string, AppFinance>> {
  const out = new Map<string, AppFinance>();
  const db = appSupabaseAdmin();
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!db || ids.length === 0) return out;
  for (const id of ids) out.set(id, emptyFinance());

  for (const slice of chunk(ids, ID_CHUNK)) {
    const inSlice = (col: string) => (q: any) => q.in(col, slice); // eslint-disable-line @typescript-eslint/no-explicit-any
    const live = (q: any) => q.in("user_id", slice).is("archived_at", null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const [profiles, txns, budgets, goals, wallets, debts, payments, devices] =
      await Promise.all([
        selectAllRows(db, "profiles", "id, last_active_date, updated_at", inSlice("id")),
        selectAllRows(db, "transactions", "user_id, type, amount, created_at", inSlice("user_id")),
        selectAllRows(
          db,
          "budgets",
          "user_id, category, limit_amount, spent, funding_mode",
          live
        ),
        selectAllRows(
          db,
          "savings_goals",
          "user_id, name, target_kobo, current_kobo, status",
          live
        ),
        selectAllRows(db, "savings_wallets", "user_id, balance_kobo", inSlice("user_id")),
        selectAllRows(
          db,
          "debts",
          "user_id, id, lender, amount, monthly_payment, category",
          live
        ),
        selectAllRows(db, "debt_payments", "user_id, debt_id, amount", inSlice("user_id")),
        selectAllRows(db, "trusted_devices", "user_id, last_seen_at", inSlice("user_id")),
      ]);

    const mine = (row: Record<string, unknown>, key = "user_id") => out.get(str(row[key]));

    for (const row of profiles) {
      const f = mine(row, "id");
      if (!f) continue;
      f.lastActiveDay = row.last_active_date ? str(row.last_active_date).slice(0, 10) : null;
      f.lastSeenAt = newer(f.lastSeenAt, row.updated_at);
    }
    for (const row of devices) {
      const f = mine(row);
      if (f) f.lastSeenAt = newer(f.lastSeenAt, row.last_seen_at);
    }
    for (const row of txns) {
      const f = mine(row);
      if (!f) continue;
      const amount = num(row.amount);
      f.transactions.count += 1;
      if (row.type === "credit") {
        f.transactions.credits += 1;
        f.transactions.received += amount;
      } else {
        f.transactions.debits += 1;
        f.transactions.spent += amount;
      }
      f.transactions.lastAt = newer(f.transactions.lastAt, row.created_at);
      f.lastSeenAt = newer(f.lastSeenAt, row.created_at);
    }
    for (const row of budgets) {
      const f = mine(row);
      if (!f) continue;
      const limit = num(row.limit_amount);
      const spent = num(row.spent);
      const funded = row.funding_mode === "funded";
      f.budgets.count += 1;
      if (funded) f.budgets.funded += 1;
      f.budgets.limit += limit;
      f.budgets.spent += spent;
      if (limit > 0 && spent > limit) f.budgets.over += 1;
      if (f.budgets.items.length < MAX_ITEMS) {
        f.budgets.items.push({
          label: str(row.category) || "Budget",
          target: limit,
          current: spent,
          tag: funded ? "funded" : undefined,
        });
      }
    }
    for (const row of goals) {
      const f = mine(row);
      if (!f) continue;
      const target = kobo(row.target_kobo);
      const saved = kobo(row.current_kobo);
      f.savings.goals += 1;
      f.savings.target += target;
      f.savings.saved += saved;
      if (row.status === "completed") f.savings.completed += 1;
      if (f.savings.items.length < MAX_ITEMS) {
        f.savings.items.push({
          label: str(row.name) || "Goal",
          target,
          current: saved,
          tag: row.status === "completed" ? "completed" : undefined,
        });
      }
    }
    for (const row of wallets) {
      const f = mine(row);
      if (f) f.savings.wallet += kobo(row.balance_kobo);
    }

    // Debts need their payments folded in, so collect them first.
    const paidByDebt = new Map<string, number>();
    for (const row of payments) {
      const debtId = str(row.debt_id);
      if (!debtId) continue;
      paidByDebt.set(debtId, (paidByDebt.get(debtId) ?? 0) + num(row.amount));
    }
    for (const row of debts) {
      const f = mine(row);
      if (!f) continue;
      const total = num(row.amount);
      const paid = paidByDebt.get(str(row.id)) ?? 0;
      f.debts.count += 1;
      f.debts.total += total;
      f.debts.paid += paid;
      f.debts.monthly += num(row.monthly_payment);
      if (f.debts.items.length < MAX_ITEMS) {
        f.debts.items.push({
          label: str(row.lender) || "Lender",
          target: total,
          current: paid,
          tag: str(row.category) || undefined,
        });
      }
    }
  }
  return out;
}

// ── Presence ──
export type Presence = {
  /** What to show on the pill. */
  label: string;
  state: "online" | "today" | "recent" | "dormant" | "never";
  /** ISO timestamp behind the label, when we have one. */
  at: string | null;
};

const MINUTE = 60_000;
const DAY = 86_400_000;

/**
 * Presence, as honestly as the app DB allows. The app has no heartbeat: it
 * stamps `last_active_date` (a DATE) when it opens, and rows carry timestamps.
 * So "online" means something happened in the last 5 minutes — anything older
 * is reported as when they were last seen, never as a live status.
 */
export function presenceOf(f: AppFinance | undefined, now = Date.now()): Presence {
  if (!f) return { label: "Unknown", state: "never", at: null };

  const stamp = f.lastSeenAt ? Date.parse(f.lastSeenAt) : NaN;
  const dayMs = f.lastActiveDay ? Date.parse(`${f.lastActiveDay}T00:00:00Z`) : NaN;
  const best = Math.max(Number.isNaN(stamp) ? -1 : stamp, Number.isNaN(dayMs) ? -1 : dayMs);
  if (best < 0) return { label: "Never opened the app", state: "never", at: null };

  const at = f.lastSeenAt ?? f.lastActiveDay ?? null;
  const age = now - best;
  if (age <= 5 * MINUTE) return { label: "Online now", state: "online", at };

  // Day-level comparison so "today" matches the app's own active-day stamp.
  const days = Math.floor(age / DAY);
  if (days <= 0) return { label: "Active today", state: "today", at };
  if (days === 1) return { label: "Active yesterday", state: "recent", at };
  if (days <= 30) return { label: `Last active ${days} days ago`, state: "recent", at };
  return { label: `Dormant · ${days} days`, state: "dormant", at };
}

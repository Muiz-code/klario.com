import type { SupabaseClient } from "@supabase/supabase-js";
import { appSupabaseAdmin } from "@/lib/supabase/appAdmin";
import { selectAllRows, chunk } from "@/lib/db/appQuery";

/**
 * Klario Tasks, read from the admin side.
 *
 * The Kairo app shows each user a "get the most out of Klario" checklist on
 * their Klario ID (src/lib/klarioTasks.ts in the app repo). Every task is
 * auto-detected from real data — there is no completion table — so the only way
 * to see a user's checklist from here is to re-derive it from the same signals.
 * This module mirrors the app's task list and evaluates it in BATCH: one paged
 * query per signal for the whole cohort, not per user.
 *
 * Keep TASK_DEFS in sync with the app's TASK_DEFS. Read-only; fail-soft — a
 * signal that errors just leaves its tasks not-done.
 */

export type TaskGroup = "Set up" | "Move money" | "Grow" | "Business" | "Make it yours";

export type TaskState = {
  key: string;
  label: string;
  hint: string;
  xp: number;
  group: TaskGroup;
  done: boolean;
};

export type UserTasks = {
  tasks: TaskState[];
  doneCount: number;
  total: number;
  xpEarned: number;
  xpTotal: number;
};

/** Display order for the checklist groups. */
export const TASK_GROUPS: TaskGroup[] = [
  "Set up",
  "Move money",
  "Grow",
  "Make it yours",
  "Business",
];

/** The signals every task's `done` is derived from. All fail-soft to false/0. */
type Signals = {
  verified: boolean;
  bankCount: number;
  incomeSet: boolean;
  budgetCount: number;
  fundedBudgets: number;
  manualBudgets: number;
  budgetsOnTrack: number;
  hasGoal: boolean;
  hasWallet: boolean;
  hasSent: boolean;
  hasSplit: boolean;
  hasBeneficiary: boolean;
  recurrences: Set<string>;
  isPro: boolean;
  colorChosen: boolean;
  usedKai: boolean;
  hasSecurityQuestions: boolean;
  has2fa: boolean;
  raisedTicket: boolean;
  isBusiness: boolean;
  hasLabeledBank: boolean;
  completed: Set<string>;
};

function emptySignals(): Signals {
  return {
    verified: false,
    bankCount: 0,
    incomeSet: false,
    budgetCount: 0,
    fundedBudgets: 0,
    manualBudgets: 0,
    budgetsOnTrack: 0,
    hasGoal: false,
    hasWallet: false,
    hasSent: false,
    hasSplit: false,
    hasBeneficiary: false,
    recurrences: new Set<string>(),
    isPro: false,
    colorChosen: false,
    usedKai: false,
    hasSecurityQuestions: false,
    has2fa: false,
    raisedTicket: false,
    isBusiness: false,
    hasLabeledBank: false,
    completed: new Set<string>(),
  };
}

/** Definition + how each task is marked done. Mirrors the app, in app order. */
const TASK_DEFS: (Omit<TaskState, "done"> & {
  businessOnly?: boolean;
  done: (s: Signals) => boolean;
})[] = [
  // ── Set up ──
  { key: "verify-identity", group: "Set up", xp: 20, label: "Verify your identity", hint: "Complete KYC to unlock full access.", done: (s) => s.verified },
  { key: "connect-bank", group: "Set up", xp: 20, label: "Connect a bank", hint: "Link your first bank account.", done: (s) => s.bankCount >= 1 },
  { key: "add-income", group: "Set up", xp: 15, label: "Add your monthly income", hint: "Tell Klario your income for smarter budgeting.", done: (s) => s.incomeSet },
  { key: "create-budget", group: "Set up", xp: 15, label: "Create a budget", hint: "Set a spending limit for a category.", done: (s) => s.budgetCount > 0 },
  { key: "set-goal", group: "Set up", xp: 15, label: "Set a savings goal", hint: "Pick something to save towards.", done: (s) => s.hasGoal },
  { key: "create-wallet", group: "Set up", xp: 15, label: "Create a savings wallet", hint: "Open a wallet to hold your savings.", done: (s) => s.hasWallet },
  { key: "secure-account", group: "Set up", xp: 15, label: "Set your security questions", hint: "Protect a new-device sign-in.", done: (s) => s.hasSecurityQuestions },
  { key: "enable-2fa", group: "Set up", xp: 20, label: "Turn on two-factor auth", hint: "Add a second layer of login security.", done: (s) => s.has2fa },
  { key: "raise-ticket", group: "Set up", xp: 10, label: "Raise a support ticket", hint: "Reach our team from the Support screen.", done: (s) => s.raisedTicket },
  { key: "enable-notifications", group: "Set up", xp: 10, label: "Turn on notifications", hint: "Stay on top of transfers and reminders.", done: (s) => s.completed.has("enable-notifications") },
  { key: "run-sync", group: "Set up", xp: 10, label: "Sync your accounts", hint: "Pull the latest balances and transactions.", done: (s) => s.completed.has("run-sync") },
  { key: "view-legal", group: "Set up", xp: 10, label: "Read the privacy & legal docs", hint: "Know how Klario protects your data.", done: (s) => s.completed.has("view-legal") },

  // ── Move money ──
  { key: "send-first", group: "Move money", xp: 20, label: "Send your first payment", hint: "Make a transfer to anyone.", done: (s) => s.hasSent },
  { key: "save-beneficiary", group: "Move money", xp: 10, label: "Save a beneficiary", hint: "Save someone for faster sending.", done: (s) => s.hasBeneficiary },
  { key: "split-transfer", group: "Move money", xp: 25, label: "Split a transfer across banks", hint: "Send one amount from several banks at once.", done: (s) => s.hasSplit },
  { key: "schedule-daily", group: "Move money", xp: 15, label: "Schedule a daily transfer", hint: "Automate a payment that repeats every day.", done: (s) => s.recurrences.has("daily") },
  { key: "schedule-monthly", group: "Move money", xp: 20, label: "Schedule a monthly transfer", hint: "Automate a payment that repeats every month.", done: (s) => s.recurrences.has("monthly") },
  { key: "schedule-yearly", group: "Move money", xp: 25, label: "Schedule a yearly transfer", hint: "Automate a payment that repeats every year.", done: (s) => s.recurrences.has("yearly") },
  { key: "pay-bill", group: "Move money", xp: 15, label: "Pay a bill", hint: "Buy airtime, data, electricity and more.", done: (s) => s.completed.has("pay-bill") },
  { key: "download-receipt", group: "Move money", xp: 10, label: "Download a receipt", hint: "Save a transaction receipt as a PDF.", done: (s) => s.completed.has("download-receipt") },

  // ── Grow ──
  { key: "connect-2-banks", group: "Grow", xp: 20, label: "Connect a 2nd bank", hint: "Link two banks to unlock split sending.", done: (s) => s.bankCount >= 2 },
  { key: "connect-5-banks", group: "Grow", xp: 40, label: "Connect 5 banks", hint: "See everything in one place.", done: (s) => s.bankCount >= 5 },
  { key: "fund-budget", group: "Grow", xp: 20, label: "Fund a budget", hint: "Move a budget's limit into a locked vault.", done: (s) => s.fundedBudgets >= 1 },
  { key: "budgets-mix", group: "Grow", xp: 25, label: "Run 2 flexible + 3 funded budgets", hint: "Create 2 regular budgets and 3 funded ones.", done: (s) => s.manualBudgets >= 2 && s.fundedBudgets >= 3 },
  { key: "five-disciplined", group: "Grow", xp: 30, label: "Keep 5 budgets on track", hint: "Have 5 budgets and stay within every limit.", done: (s) => s.budgetCount >= 5 && s.budgetsOnTrack >= 5 },
  { key: "go-pro", group: "Grow", xp: 50, label: "Go Pro", hint: "Unlock unlimited Kai and premium features.", done: (s) => s.isPro },
  { key: "download-analytics", group: "Grow", xp: 10, label: "Download your analytics", hint: "Export a spending breakdown or statement.", done: (s) => s.completed.has("download-analytics") },

  // ── Make it yours ──
  { key: "choose-color", group: "Make it yours", xp: 10, label: "Choose your color style", hint: "Personalise Klario's accent colour.", done: (s) => s.colorChosen },
  { key: "use-kai", group: "Make it yours", xp: 15, label: "Chat with Kai", hint: "Ask your AI assistant anything about your money.", done: (s) => s.completed.has("use-kai") || s.usedKai },
  { key: "set-faceid", group: "Make it yours", xp: 15, label: "Set up Face ID", hint: "Unlock Klario with your face or fingerprint.", done: (s) => s.completed.has("set-faceid") },
  { key: "switch-account-type", group: "Make it yours", xp: 10, label: "Switch your account type", hint: "Change between Personal and Business in Profile.", done: (s) => s.completed.has("switch-account-type") },

  // ── Business (only counted for SME + Solo Founder accounts) ──
  { key: "label-bank", group: "Business", xp: 15, businessOnly: true, label: "Label a bank's purpose", hint: "Tag a linked bank as Business or Personal so Klario can keep the two apart.", done: (s) => s.hasLabeledBank },
  { key: "trigger-commingling", group: "Business", xp: 20, businessOnly: true, label: "Spot a commingling leak", hint: "Send from a business bank with a personal note and watch Klario flag the mixed spend.", done: (s) => s.completed.has("trigger-commingling") },
];

/** How many tasks a personal account sees — the denominator on the leaderboard. */
export const PERSONAL_TASK_TOTAL = TASK_DEFS.filter((t) => !t.businessOnly).length;

const ID_CHUNK = 200;
/** MFA lives in the auth schema (one call per user), so only for small cohorts. */
const MFA_LOOKUP_LIMIT = 250;

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

/** Verified MFA factors, read one user at a time via the auth admin API. */
async function usersWithMfa(db: SupabaseClient, ids: string[]): Promise<Set<string>> {
  const found = new Set<string>();
  if (ids.length > MFA_LOOKUP_LIMIT) {
    console.warn(`[appdb] skipping MFA lookup for ${ids.length} users`);
    return found;
  }
  for (const batch of chunk(ids, 10)) {
    await Promise.all(
      batch.map(async (id) => {
        try {
          const { data } = await db.auth.admin.getUserById(id);
          const factors = (data?.user as { factors?: { status?: string }[] } | null)?.factors ?? [];
          if (factors.some((f) => f?.status === "verified")) found.add(id);
        } catch {
          // Non-critical: an unreadable factor list just leaves the task not-done.
        }
      })
    );
  }
  return found;
}

/**
 * Evaluate the Klario task checklist for a set of app user ids, keyed by user
 * id. Empty when the app DB isn't configured. Business-only tasks are included
 * for SME / Solo Founder accounts only, exactly as the app does.
 */
export async function getAppTasksByUserIds(
  userIds: string[]
): Promise<Map<string, UserTasks>> {
  const out = new Map<string, UserTasks>();
  const db = appSupabaseAdmin();
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!db || ids.length === 0) return out;

  const sig = new Map<string, Signals>();
  for (const id of ids) sig.set(id, emptySignals());

  // One paged read per signal, over the whole cohort. `mine()` resolves a row
  // back to its user's signals (rows for unknown ids are ignored).
  const mine = (row: Record<string, unknown>, key = "user_id") => sig.get(str(row[key]));

  for (const slice of chunk(ids, ID_CHUNK)) {
    const inSlice = (col: string) => (q: any) => q.in(col, slice); // eslint-disable-line @typescript-eslint/no-explicit-any

    const [profiles, banks, budgets, goals, wallets, benefs, debits, splits, sched, tickets, secQ, mfa] =
      await Promise.all([
        selectAllRows(
          db,
          "profiles",
          "id, monthly_income_kobo, plan, accent, kyc_status, ai_daily_count, account_type, completed_tasks",
          inSlice("id")
        ),
        selectAllRows(db, "linked_banks", "user_id, purpose", inSlice("user_id")),
        selectAllRows(db, "budgets", "user_id, limit_amount, spent, funding_mode", (q) =>
          q.in("user_id", slice).is("archived_at", null)
        ),
        selectAllRows(db, "savings_goals", "user_id", (q) =>
          q.in("user_id", slice).is("archived_at", null)
        ),
        selectAllRows(db, "savings_wallets", "user_id", inSlice("user_id")),
        selectAllRows(db, "beneficiaries", "user_id", inSlice("user_id")),
        selectAllRows(db, "transactions", "user_id", (q) =>
          q.in("user_id", slice).eq("type", "debit")
        ),
        selectAllRows(db, "transactions", "user_id", (q) =>
          q.in("user_id", slice).ilike("narration", "Split transfer%")
        ),
        selectAllRows(db, "scheduled_transfers", "user_id, recurrence", inSlice("user_id")),
        selectAllRows(db, "support_tickets", "user_id", inSlice("user_id")),
        selectAllRows(db, "security_questions", "user_id", inSlice("user_id")),
        usersWithMfa(db, slice),
      ]);

    for (const row of profiles) {
      const s = mine(row, "id");
      if (!s) continue;
      const accent = str(row.accent) || "gold";
      const acct = str(row.account_type);
      s.verified = row.kyc_status === "verified";
      s.incomeSet = Number(row.monthly_income_kobo ?? 0) > 0;
      s.isPro = !!row.plan && row.plan !== "free";
      s.colorChosen = accent !== "gold";
      s.usedKai = Number(row.ai_daily_count ?? 0) > 0;
      s.isBusiness = acct === "sme" || acct === "solo_founder";
      s.completed = new Set(
        Array.isArray(row.completed_tasks) ? row.completed_tasks.map(String) : []
      );
    }
    for (const row of banks) {
      const s = mine(row);
      if (!s) continue;
      s.bankCount += 1;
      if (str(row.purpose)) s.hasLabeledBank = true;
    }
    for (const row of budgets) {
      const s = mine(row);
      if (!s) continue;
      s.budgetCount += 1;
      if (row.funding_mode === "funded") s.fundedBudgets += 1;
      else s.manualBudgets += 1;
      const limit = Number(row.limit_amount ?? 0);
      if (limit > 0 && Number(row.spent ?? 0) <= limit) s.budgetsOnTrack += 1;
    }
    for (const row of goals) {
      const s = mine(row);
      if (s) s.hasGoal = true;
    }
    for (const row of wallets) {
      const s = mine(row);
      if (s) s.hasWallet = true;
    }
    for (const row of benefs) {
      const s = mine(row);
      if (s) s.hasBeneficiary = true;
    }
    for (const row of debits) {
      const s = mine(row);
      if (s) s.hasSent = true;
    }
    for (const row of splits) {
      const s = mine(row);
      if (s) s.hasSplit = true;
    }
    for (const row of sched) {
      const s = mine(row);
      if (s) s.recurrences.add(str(row.recurrence));
    }
    for (const row of tickets) {
      const s = mine(row);
      if (s) s.raisedTicket = true;
    }
    for (const row of secQ) {
      const s = mine(row);
      if (s) s.hasSecurityQuestions = true;
    }
    for (const id of mfa) {
      const s = sig.get(id);
      if (s) s.has2fa = true;
    }
  }

  for (const [id, s] of sig) {
    const tasks: TaskState[] = TASK_DEFS.filter((t) => !t.businessOnly || s.isBusiness).map(
      (t) => ({
        key: t.key,
        label: t.label,
        hint: t.hint,
        xp: t.xp,
        group: t.group,
        done: t.done(s),
      })
    );
    out.set(id, {
      tasks,
      doneCount: tasks.filter((t) => t.done).length,
      total: tasks.length,
      xpEarned: tasks.reduce((sum, t) => sum + (t.done ? t.xp : 0), 0),
      xpTotal: tasks.reduce((sum, t) => sum + t.xp, 0),
    });
  }
  return out;
}

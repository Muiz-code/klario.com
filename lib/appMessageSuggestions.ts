import type { AppProfile } from "@/lib/db/appProfiles";
import type { UserTasks } from "@/lib/db/appTasks";
import type { AppFinance } from "@/lib/db/appFinance";
import type { MessageCategory } from "@/lib/appMessageKinds";

/**
 * Message suggestions curated from what a user has actually done in the app.
 *
 * Deliberately rule-based, not generated: each suggestion states the signal it
 * fired on ("no bank linked"), so whoever sends it can see why it was offered
 * and correct it. Rules are ordered by how much the nudge matters; the caller
 * takes the top few.
 *
 * `{name}` in a body is replaced with the person's first name at send time
 * (or dropped, with the sentence still reading properly, when we don't know it).
 */

export type Suggestion = {
  id: string;
  /** Why this was offered — shown next to the suggestion. */
  signal: string;
  title: string;
  body: string;
  category: MessageCategory;
};

type Signals = {
  app: AppProfile;
  tasks?: UserTasks | null;
  finance?: AppFinance | null;
  /** Days since they last opened the app; Infinity when never. */
  daysIdle: number;
};

/** Has the user ticked a given Klario task? */
function done(tasks: UserTasks | null | undefined, key: string): boolean {
  return !!tasks?.tasks.find((t) => t.key === key)?.done;
}

type Rule = {
  id: string;
  /** Higher runs first. */
  weight: number;
  when: (s: Signals) => boolean;
  build: (s: Signals) => Omit<Suggestion, "id">;
};

const RULES: Rule[] = [
  {
    id: "dormant",
    weight: 100,
    when: (s) => s.daysIdle > 30 && s.daysIdle !== Infinity,
    build: (s) => ({
      signal: `Hasn't opened the app in ${s.daysIdle} days`,
      title: "Your money missed you",
      body: "It's been a while, {name}. Open Klario to see where your money went this month — it takes 30 seconds.",
      category: "tip",
    }),
  },
  {
    id: "never-opened",
    weight: 95,
    when: (s) => s.daysIdle === Infinity,
    build: () => ({
      signal: "Signed up but has never opened the app",
      title: "Let's get you started",
      body: "You created a Klario account but haven't looked around yet. Link a bank and we'll show you your spending in one screen.",
      category: "tip",
    }),
  },
  {
    id: "no-bank",
    weight: 90,
    when: (s) => (s.finance?.transactions.count ?? 0) === 0 && !done(s.tasks, "connect-bank"),
    build: () => ({
      signal: "No bank linked yet",
      title: "Connect your first bank",
      body: "Klario only gets useful once it can see your money. Linking a bank takes a minute and nothing leaves your account.",
      category: "tip",
    }),
  },
  {
    id: "unverified",
    weight: 80,
    when: (s) => s.app.kyc_status !== "verified",
    build: () => ({
      signal: "KYC not completed",
      title: "Finish your verification",
      body: "You're a few taps from full access, {name}. Verify your identity to unlock transfers and savings.",
      category: "update",
    }),
  },
  {
    id: "budget-over",
    weight: 75,
    when: (s) => (s.finance?.budgets.over ?? 0) > 0,
    build: (s) => ({
      signal: `${s.finance?.budgets.over} budget(s) over their limit`,
      title: "One of your budgets slipped",
      body: "You've gone past a limit you set. Open Klario to see which one and adjust before month end.",
      category: "tip",
    }),
  },
  {
    id: "goal-close",
    weight: 70,
    when: (s) =>
      (s.finance?.savings.target ?? 0) > 0 &&
      (s.finance?.savings.saved ?? 0) / (s.finance?.savings.target ?? 1) >= 0.75 &&
      (s.finance?.savings.completed ?? 0) === 0,
    build: () => ({
      signal: "A savings goal is at least 75% funded",
      title: "You're nearly there",
      body: "Your savings goal is close to done, {name}. One more push and it's yours.",
      category: "fun",
    }),
  },
  {
    id: "no-goal",
    weight: 60,
    when: (s) => (s.finance?.savings.goals ?? 0) === 0,
    build: () => ({
      signal: "No savings goal set",
      title: "What are you saving for?",
      body: "Pick one thing — rent, a laptop, a trip — and Klario will help you get there a little at a time.",
      category: "tip",
    }),
  },
  {
    id: "debt-progress",
    weight: 55,
    when: (s) => (s.finance?.debts.total ?? 0) > 0 && (s.finance?.debts.paid ?? 0) > 0,
    build: () => ({
      signal: "Actively paying down a tracked debt",
      title: "You're chipping away at it",
      body: "Nice work on your repayments, {name}. Keep going — Klario is tracking every naira of it.",
      category: "fun",
    }),
  },
  {
    id: "go-pro",
    weight: 50,
    when: (s) =>
      (!s.app.plan || s.app.plan === "free") &&
      (s.tasks?.doneCount ?? 0) >= 8 &&
      s.daysIdle <= 7,
    build: () => ({
      signal: "Active free user with 8+ tasks done",
      title: "You've outgrown the free plan",
      body: "You're using Klario properly, {name}. Pro gives you unlimited Kai and the premium tools.",
      category: "promo",
    }),
  },
  {
    id: "business-commingling",
    weight: 45,
    when: (s) =>
      (s.app.account_type === "sme" || s.app.account_type === "solo_founder") &&
      !done(s.tasks, "label-bank"),
    build: () => ({
      signal: "Business account with no bank labelled",
      title: "Keep business and personal apart",
      body: "Tag which of your banks is for business and Klario will flag it when the two get mixed.",
      category: "tip",
    }),
  },
  {
    id: "tasks-left",
    weight: 20,
    when: (s) => !!s.tasks && s.tasks.doneCount < s.tasks.total,
    build: (s) => ({
      signal: `${(s.tasks?.total ?? 0) - (s.tasks?.doneCount ?? 0)} Klario tasks still open`,
      title: "A few things left to try",
      body: `You've done ${s.tasks?.doneCount} of ${s.tasks?.total} Klario tasks. The rest take a minute each — and each one earns XP.`,
      category: "fun",
    }),
  },
];

/** The strongest suggestions for one user, best first. */
export function suggestForUser(s: Signals, limit = 4): Suggestion[] {
  return [...RULES]
    .sort((a, b) => b.weight - a.weight)
    .filter((r) => {
      try {
        return r.when(s);
      } catch {
        return false;
      }
    })
    .slice(0, limit)
    .map((r) => ({ id: r.id, ...r.build(s) }));
}

/**
 * Suggestions for a group, from the list-level facts we have about everyone in
 * it. Each carries how many of the selected users it applies to, so you can see
 * whether a nudge fits the whole group or a corner of it.
 */
export type GroupSuggestion = Suggestion & { matches: number; total: number };

export function suggestForGroup(
  people: {
    daysIdle: number;
    verified: boolean;
    plan: string | null;
    accountType: string | null;
    onApp: boolean;
  }[],
  limit = 4
): GroupSuggestion[] {
  const onApp = people.filter((p) => p.onApp);
  const total = onApp.length;
  if (total === 0) return [];

  const count = (fn: (p: (typeof onApp)[number]) => boolean) => onApp.filter(fn).length;

  const candidates: (Omit<Suggestion, "id"> & { id: string; matches: number })[] = [
    {
      id: "dormant",
      matches: count((p) => p.daysIdle > 30),
      signal: "Dormant for over 30 days",
      title: "Your money missed you",
      body: "It's been a while, {name}. Open Klario to see where your money went this month — it takes 30 seconds.",
      category: "tip",
    },
    {
      id: "never-opened",
      matches: count((p) => p.daysIdle === Infinity),
      signal: "Never opened the app",
      title: "Let's get you started",
      body: "You created a Klario account but haven't looked around yet. Link a bank and we'll show you your spending in one screen.",
      category: "tip",
    },
    {
      id: "unverified",
      matches: count((p) => !p.verified),
      signal: "Not verified",
      title: "Finish your verification",
      body: "You're a few taps from full access, {name}. Verify your identity to unlock transfers and savings.",
      category: "update",
    },
    {
      id: "free-plan",
      matches: count((p) => !p.plan || p.plan === "free"),
      signal: "On the free plan",
      title: "Unlock the full Klario",
      body: "Pro gives you unlimited Kai, funded budgets and the premium tools. Take a look, {name}.",
      category: "promo",
    },
    {
      id: "business",
      matches: count((p) => p.accountType === "sme" || p.accountType === "solo_founder"),
      signal: "Business accounts",
      title: "Built for how you run money",
      body: "Keep business and personal spending apart, and let Klario flag it when they mix.",
      category: "tip",
    },
    {
      id: "active",
      matches: count((p) => p.daysIdle <= 7),
      signal: "Active in the last week",
      title: "Thanks for showing up",
      body: "You've been consistent, {name} — that's the whole game. Here's what's new in Klario this week.",
      category: "update",
    },
  ];

  return candidates
    .filter((c) => c.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, limit)
    .map((c) => ({ ...c, total }));
}

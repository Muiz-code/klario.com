"use client";

import type { UserTasks } from "@/lib/db/appTasks";
import { TASK_GROUPS } from "@/lib/db/appTasks";
import type { AppFinance, Presence, ProgressItem } from "@/lib/db/appFinance";
import { Check } from "lucide-react";

/**
 * The panels that describe one Kairo app user — presence, money, the Klario task
 * checklist — shared by the Anchor Club drawer and the App users section so both
 * read the same way and stay in step.
 */
export function titleCase(v: string | null | undefined): string {
  if (!v) return "—";
  return v.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// The app's plan values map to user-facing tier names (matches the mobile app:
// free = Free, premium = Money Manager, pro = Financial Executive).
export function planLabel(plan: string | null | undefined): string {
  switch (plan) {
    case "premium":
      return "Money Manager";
    case "pro":
      return "Financial Executive";
    case "free":
      return "Free";
    default:
      return plan ? titleCase(plan) : "—";
  }
}

export function verifyLabel(kyc: string | null | undefined): string {
  switch (kyc) {
    case "verified":
      return "Verified";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return "Not verified";
  }
}

// ── Klario tasks (the app's Klario ID checklist, re-derived server-side) ──
export function taskPct(t?: UserTasks): number {
  if (!t || t.total === 0) return 0;
  return Math.round((t.doneCount / t.total) * 100);
}

// ── Money ──
/** ₦12,340 — whole naira; kobo is noise at this altitude. */
export function naira(n: number): string {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}
export function pct(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

const PRESENCE_STYLE: Record<Presence["state"], string> = {
  online: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  today: "border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200/85",
  recent: "border-bg/15 bg-bg/[0.03] text-bg/65",
  dormant: "border-amber-400/25 bg-amber-400/[0.06] text-amber-200/85",
  never: "border-bg/12 bg-bg/[0.02] text-bg/40",
};

export function PresencePill({ presence }: { presence: Presence }) {
  return (
    <span
      // The label is relative to "now", so server and client can disagree by a
      // tick on the boundary between states.
      suppressHydrationWarning
      title={presence.at ? `Last seen ${new Date(presence.at).toLocaleString()}` : undefined}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] " +
        PRESENCE_STYLE[presence.state]
      }
    >
      <span
        className={
          "h-1.5 w-1.5 rounded-full " +
          (presence.state === "online"
            ? "bg-emerald-300"
            : presence.state === "today"
              ? "bg-emerald-400/70"
              : presence.state === "dormant"
                ? "bg-amber-300/80"
                : "bg-bg/30")
        }
      />
      {presence.label}
    </span>
  );
}


/**
 * What the member is doing with money in the app: how much they move, and the
 * budgets, savings and debts they run — each with progress against its target.
 */
export function MoneyPanel({ f }: { f: AppFinance }) {
  const { transactions: tx, budgets, savings, debts } = f;
  return (
    <div className="flex flex-col gap-4">
      {/* Headline numbers */}
      <div className="grid gap-4 rounded-lg border border-bg/10 bg-bg/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Mini
          label={`Transactions (${tx.count})`}
          value={tx.count ? `${naira(tx.spent)} out` : "—"}
        />
        <Mini
          label={`Budgets (${budgets.count})`}
          value={budgets.count ? `${naira(budgets.spent)} / ${naira(budgets.limit)}` : "—"}
        />
        <Mini
          label={`Savings (${savings.goals} goal${savings.goals === 1 ? "" : "s"})`}
          value={savings.goals ? `${naira(savings.saved)} / ${naira(savings.target)}` : "—"}
        />
        <Mini
          label={`Loans & debts (${debts.count})`}
          value={debts.count ? `${naira(debts.paid)} / ${naira(debts.total)}` : "—"}
        />
      </div>

      {/* The qualifiers behind those numbers */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-bg/50">
        {tx.count > 0 && (
          <span>
            {tx.debits} out · {tx.credits} in · {naira(tx.received)} received
          </span>
        )}
        {budgets.count > 0 && (
          <span>
            {budgets.funded} funded
            {budgets.over > 0 && (
              <span className="text-amber-300/80"> · {budgets.over} over limit</span>
            )}
          </span>
        )}
        {savings.wallet > 0 && <span>Wallet balance {naira(savings.wallet)}</span>}
        {savings.completed > 0 && <span>{savings.completed} goal(s) completed</span>}
        {debts.monthly > 0 && <span>{naira(debts.monthly)} / month repayments</span>}
      </div>

      {/* Per-item progress */}
      <div className="grid gap-4 md:grid-cols-3">
        <ProgressList title="Budgets" items={budgets.items} unit="spent" />
        <ProgressList title="Savings goals" items={savings.items} unit="saved" />
        <ProgressList title="Loans & debts" items={debts.items} unit="repaid" />
      </div>
    </div>
  );
}

/** A short list of things with a bar each — budgets, goals or debts. */
export function ProgressList({
  title,
  items,
  unit,
}: {
  title: string;
  items: ProgressItem[];
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-bg/10 bg-bg/[0.02] p-3.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-bg/40">
        {title} <span className="text-bg/25">{items.length || ""}</span>
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-[12.5px] text-bg/35">None yet</p>
      ) : (
        <div className="mt-2.5 flex flex-col gap-2.5">
          {items.map((it, i) => {
            const p = pct(it.current, it.target);
            const over = it.target > 0 && it.current > it.target;
            return (
              <div key={`${it.label}-${i}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12.5px] text-bg/80" title={it.label}>
                    {it.label}
                    {it.tag && <span className="ml-1 text-[11px] text-bg/35">{it.tag}</span>}
                  </span>
                  <span
                    className={"shrink-0 text-[11.5px] " + (over ? "text-amber-300" : "text-bg/45")}
                  >
                    {p}%
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg/10">
                  <div
                    className={"h-full rounded-full " + (over ? "bg-amber-400/70" : "bg-gold/70")}
                    style={{ width: `${p}%` }}
                  />
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-bg/35">
                  {naira(it.current)} {unit} of {naira(it.target)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * The member's Klario ID checklist, grouped exactly as the app groups it. Ticked
 * tasks read gold; the rest stay muted so the gaps are what stands out.
 */
export function TaskChecklist({ tasks }: { tasks: UserTasks }) {
  const groups = TASK_GROUPS.map((g) => ({
    group: g,
    items: tasks.tasks.filter((t) => t.group === g),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="rounded-lg border border-bg/10 bg-bg/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-[15px] font-medium text-bg">
          {tasks.doneCount}
          <span className="text-bg/45"> / {tasks.total} done</span>
        </span>
        <span className="text-[13px] text-gold">
          {tasks.xpEarned} <span className="text-gold/60">/ {tasks.xpTotal} XP</span>
        </span>
        <div className="h-1.5 min-w-[120px] flex-1 overflow-hidden rounded-full bg-bg/10">
          <div
            className="h-full rounded-full bg-gold/70"
            style={{ width: `${taskPct(tasks)}%` }}
          />
        </div>
        <span className="text-[12px] text-bg/45">{taskPct(tasks)}%</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {groups.map(({ group, items }) => (
          <div key={group}>
            <p className="text-[10px] uppercase tracking-[0.12em] text-bg/40">
              {group}{" "}
              <span className="text-bg/25">
                {items.filter((t) => t.done).length}/{items.length}
              </span>
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {items.map((t) => (
                <span
                  key={t.key}
                  title={`${t.hint} · ${t.xp} XP`}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] " +
                    (t.done
                      ? "border-gold/30 bg-gold/[0.08] text-gold"
                      : "border-bg/10 bg-bg/[0.02] text-bg/40")
                  }
                >
                  {t.done ? (
                    <Check size={11} />
                  ) : (
                    <span className="h-[9px] w-[9px] rounded-full border border-bg/25" />
                  )}
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Mini({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-bg/40">{label}</p>
      <p className={"mt-1 text-[13px] text-bg/85" + (mono ? " font-mono text-gold" : "")}>{value}</p>
    </div>
  );
}


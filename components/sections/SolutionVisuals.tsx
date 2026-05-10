"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Wifi,
  Phone,
  Zap,
  Tv,
  Check,
  CalendarCheck,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const accounts = [
  { name: "GTBank", last4: "4521", balance: 234820, color: "#E45A2D" },
  { name: "Access", last4: "8910", balance: 412500, color: "#0046A5" },
  { name: "Zenith", last4: "2334", balance: 142000, color: "#C8102E" },
  { name: "UBA", last4: "7782", balance: 58000, color: "#D81920" },
];

const categories = [
  { label: "Food", amount: 46200 },
  { label: "Transport", amount: 24800 },
  { label: "Bills", amount: 21400 },
  { label: "Other", amount: 50180 },
];

const trend = "M0,22 L12,18 L22,24 L32,16 L44,20 L56,12 L68,15 L80,8 L92,10 L100,4";

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function DashboardVisual() {
  const spent = 142580;
  const budget = 200000;
  const spentPct = Math.round((spent / budget) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
            Net Worth
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              Live
            </span>
          </div>
          <p className="font-mono text-3xl font-medium text-gold md:text-4xl">
            {fmt(847320)}
          </p>
          <p className="font-mono text-[11px] text-emerald-400">
            ▲ {fmt(12400)} (+1.5%) this week
          </p>
        </div>
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="h-12 w-28 shrink-0 text-emerald-400"
          aria-hidden
        >
          <motion.path
            d={trend}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease }}
          />
        </svg>
      </div>

      <hr className="border-white/8" />

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/45">
          <span>Accounts</span>
          <span className="text-white/35">4 connected</span>
        </div>
        <ul className="flex flex-col">
          {accounts.map((a, i) => (
            <motion.li
              key={a.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease }}
              className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <span className="text-sm text-white/90">{a.name}</span>
                <span className="font-mono text-[11px] text-white/40">
                  •••• {a.last4}
                </span>
              </div>
              <span className="font-mono text-sm text-white/85">
                {fmt(a.balance)}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <hr className="border-white/8" />

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Spent this month
          </span>
          <span className="font-mono text-[11px] text-white/55">
            {fmt(spent)} <span className="text-white/30">/ {fmt(budget)}</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${spentPct}%` }}
            transition={{ duration: 1.4, delay: 0.3, ease }}
            className="h-full rounded-full bg-gradient-to-r from-gold to-orange-400"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c, i) => (
            <motion.span
              key={c.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.3, ease }}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.03] px-2 py-1 text-[10px] text-white/70"
            >
              {c.label}
              <span className="font-mono text-white/85">
                ₦{(c.amount / 1000).toFixed(1)}k
              </span>
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

const messages = [
  { from: "user", text: "How much did I spend on food this week?" },
  {
    from: "ai",
    text: "₦12,400 across 6 transactions. ₦2,600 under your weekly food budget.",
  },
  { from: "user", text: "Can I afford ₦80,000 for a flight to Lagos?" },
  { from: "ai", text: "Yes. You'd still hit your savings goal by month-end." },
];

export function AIVisual() {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.18, duration: 0.4, ease }}
          className={
            m.from === "user"
              ? "self-end max-w-[80%] rounded-2xl rounded-br-sm bg-white/10 px-4 py-2.5 text-sm text-white/90"
              : "max-w-[85%] rounded-2xl rounded-bl-sm border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-white/95"
          }
        >
          {m.from === "ai" && (
            <span className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-gold">
              <Sparkles size={10} /> KlarioAI
            </span>
          )}
          {m.text}
        </motion.div>
      ))}
    </div>
  );
}

export function SavingsVisual() {
  const target = 1_000_000;
  const saved = 450_000;
  const pct = Math.round((saved / target) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
          Goal
        </p>
        <p className="mt-1 font-display text-2xl text-white">Lagos Trip 2026</p>
      </div>
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-2xl text-gold">
            ₦{saved.toLocaleString()}
          </span>
          <span className="font-mono text-sm text-white/55">
            / ₦{target.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.5, ease }}
            className="h-full rounded-full bg-gradient-to-r from-gold to-orange-400"
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-white/55">
          <span>{pct}% complete</span>
          <span>Auto-saving ₦25,000 weekly</span>
        </div>
      </div>
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-3 text-[12px] text-emerald-300">
        Real bank account opened in your name. CBN compliant.
      </div>
    </div>
  );
}

const bills = [
  { icon: Phone, label: "Airtime", value: "₦5,000" },
  { icon: Wifi, label: "Data", value: "₦8,500" },
  { icon: Zap, label: "Power", value: "₦12,000" },
  { icon: Tv, label: "DStv", value: "₦6,800" },
];

export function BillsVisual() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {bills.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12, duration: 0.4, ease }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <b.icon size={15} />
              </span>
              <div>
                <p className="text-sm text-white/90">{b.label}</p>
                <p className="font-mono text-[11px] text-white/50">{b.value}</p>
              </div>
            </div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.3, ease }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400"
            >
              <Check size={14} strokeWidth={3} />
            </motion.span>
          </motion.div>
        ))}
      </div>
      <div className="rounded-xl bg-gold/15 px-4 py-3 text-[12px] text-gold">
        All bills paid this month. Zero redirects.
      </div>
    </div>
  );
}

export function ManagerVisual() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-orange-400 font-display text-xl text-ink">
          TA
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
            Your Manager
          </p>
          <p className="font-display text-lg text-white">Tunde Adesanya</p>
          <p className="text-xs text-white/55">CFA · 9 years experience</p>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <CalendarCheck size={16} />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
              Next call
            </p>
            <p className="text-sm text-white/90">
              Tue, Mar 11 at 10:00 WAT
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-[12px] text-gold">
        Monthly strategy call. Quarterly plan refresh.
      </div>
    </div>
  );
}

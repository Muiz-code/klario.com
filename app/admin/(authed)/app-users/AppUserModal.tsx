"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Smartphone,
  Wallet,
  ListChecks,
  Landmark,
  Activity,
} from "lucide-react";
import type { AppUserRow } from "@/lib/db/appUsers";
import { CONTACT_SOURCES } from "@/lib/db/appUsers";
import type { AppProfile, ActivityCounts, LinkedBank } from "@/lib/db/appProfiles";
import type { UserTasks } from "@/lib/db/appTasks";
import { presenceOf, type AppFinance } from "@/lib/db/appFinance";
import {
  Mini,
  MoneyPanel,
  PresencePill,
  TaskChecklist,
  planLabel,
  titleCase,
  verifyLabel,
} from "../_components/AppUserPanels";

type Detail = {
  app: AppProfile | null;
  tasks?: UserTasks | null;
  finance?: AppFinance | null;
  activity?: ActivityCounts | null;
  banks?: LinkedBank[];
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * One contact's app usage — the same panels the Anchor Club drawer shows, but
 * loaded on demand for any email in the contact base.
 */
export function AppUserModal({ row, onClose }: { row: AppUserRow; onClose: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/app-users/${encodeURIComponent(row.email)}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) setError(data.error || "Could not load this user.");
        else setDetail(data as Detail);
      } catch {
        if (!cancelled) setError("Could not load this user.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [row.email]);

  const app = detail?.app ?? null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${row.name || row.email} — app usage`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-4xl rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-bg/10 px-6 py-4">
          <div className="min-w-0">
            <p className="truncate text-[17px] font-medium text-bg">{row.name || "—"}</p>
            <p className="truncate text-[13px] text-bg/50">{row.email}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-bg/45">
              {row.sources.map((s) => (
                <span key={s} className="rounded-full border border-bg/12 px-2 py-0.5">
                  {CONTACT_SOURCES.find((c) => c.key === s)?.label ?? s}
                </span>
              ))}
              {row.firstSeen && <span>Contact since {fmtDate(row.firstSeen)}</span>}
              {app?.klario_id && (
                <span className="inline-flex items-center gap-1 font-mono text-gold">
                  <Smartphone size={11} /> {app.klario_id}
                </span>
              )}
            </p>
            {detail?.finance && (
              <div className="mt-2">
                <PresencePill presence={presenceOf(detail.finance)} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg border border-bg/12 p-1.5 text-bg/50 hover:border-gold/40 hover:text-gold"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {error ? (
            <p className="py-8 text-center text-sm text-red-300">{error}</p>
          ) : !detail ? (
            <p className="flex items-center justify-center gap-2 py-12 text-sm text-bg/50">
              <Loader2 size={15} className="animate-spin" /> Reading their app account…
            </p>
          ) : !app ? (
            <div className="rounded-lg border border-bg/10 bg-bg/[0.02] p-6 text-center">
              <p className="text-[14px] text-bg/70">
                No Klario app account for this email.
              </p>
              <p className="mt-1 text-[13px] text-bg/45">
                They&apos;re on our contact list
                {row.status ? ` (audience status: ${row.status})` : ""}, but have never
                signed up in the app — or signed up with a different address.
              </p>
              {row.deleted && (
                <p className="mt-3 text-[13px] text-amber-200/85">
                  They previously deleted an app account
                  {row.deleted.last_deleted_at
                    ? `, last on ${fmtDate(row.deleted.last_deleted_at)}`
                    : ""}
                  .
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Profile */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
                  <Smartphone size={12} /> App performance
                </p>
                <div className="grid gap-4 rounded-lg border border-gold/15 bg-gold/[0.04] p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Mini label="Klario ID" value={app.klario_id || "—"} mono />
                  <Mini
                    label="Kairo score"
                    value={app.kairo_score != null ? `${app.kairo_score} / 100` : "—"}
                  />
                  <Mini
                    label="Streak"
                    value={
                      app.streak != null
                        ? `${app.streak} day${app.streak === 1 ? "" : "s"}`
                        : "—"
                    }
                  />
                  <Mini label="Plan" value={planLabel(app.plan)} />
                  <Mini label="Spending type" value={titleCase(app.personality)} />
                  <Mini label="Verification" value={verifyLabel(app.kyc_status)} />
                  <Mini label="Account type" value={titleCase(app.account_type)} />
                  <Mini label="Active days" value={String(app.activeDays)} />
                  <Mini
                    label="On app since"
                    value={app.created_at ? fmtDate(app.created_at) : "—"}
                  />
                </div>
              </div>

              {/* Money */}
              {detail.finance && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
                    <Wallet size={12} /> Money in the app
                  </p>
                  <MoneyPanel f={detail.finance} />
                </div>
              )}

              {/* Tasks */}
              {detail.tasks && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
                    <ListChecks size={12} /> Klario tasks
                  </p>
                  <TaskChecklist tasks={detail.tasks} />
                </div>
              )}

              {/* Activity counts */}
              {detail.activity && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
                    <Activity size={12} /> Activity in the app
                  </p>
                  <div className="grid gap-4 rounded-lg border border-bg/10 bg-bg/[0.03] p-4 sm:grid-cols-3 lg:grid-cols-6">
                    <Mini label="Savings goals" value={String(detail.activity.savingsGoals)} />
                    <Mini label="Debts tracked" value={String(detail.activity.debts)} />
                    <Mini label="Bills paid" value={String(detail.activity.billsPaid)} />
                    <Mini label="Banks linked" value={String(detail.activity.linkedBanks)} />
                    <Mini label="Transactions" value={String(detail.activity.transactions)} />
                    <Mini label="Scheduled" value={String(detail.activity.scheduledTransfers)} />
                  </div>
                </div>
              )}

              {/* Banks */}
              {detail.banks && detail.banks.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
                    <Landmark size={12} /> Linked banks ({detail.banks.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {detail.banks.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-lg border border-bg/10 bg-bg/[0.03] px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[13.5px] font-medium text-bg">
                            {b.bankName}
                          </span>
                          <span className="font-mono text-[12px] text-bg/50">
                            {b.maskedAccount}
                          </span>
                          {b.isPrimary && (
                            <span className="rounded-full border border-gold/30 bg-gold/[0.08] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-gold">
                              Primary
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[12.5px] text-bg/70">
                          ₦{Math.round(b.balance).toLocaleString("en-NG")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

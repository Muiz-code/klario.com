import { Send, MailOpen, MousePointerClick, CircleCheck } from "lucide-react";
import type { FunnelStage } from "@/lib/db/analytics";

const ICONS: Record<string, typeof Send> = {
  sent: Send,
  opened: MailOpen,
  clicked: MousePointerClick,
  converted: CircleCheck,
};

/**
 * Email funnel: one full-width row per stage. Each stage's percentage is a
 * step-conversion vs the stage above it (Sent is vs the whole list), so every
 * value is 0–100% and the gold bar width mirrors that percentage. The `hint`
 * spells out the denominator (e.g. "of 55 sent").
 */
export function Funnel({ stages }: { stages: FunnelStage[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {stages.map((s) => {
        const Icon = ICONS[s.key] ?? Send;
        const known = s.value !== null;
        const width = s.pct === null ? 0 : Math.max(2, Math.round(s.pct * 100));
        return (
          <div
            key={s.key}
            className="rounded-xl border border-bg/8 bg-bg/4 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2.5 text-[13px] text-bg/75">
                <span
                  className={
                    "flex h-7 w-7 items-center justify-center rounded-lg " +
                    (known ? "bg-gold/15 text-gold" : "bg-bg/8 text-bg/40")
                  }
                >
                  <Icon size={14} strokeWidth={1.9} />
                </span>
                {s.label}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-display text-lg text-bg">
                  {known ? s.value!.toLocaleString() : "-"}
                </span>
                {s.pct !== null && (
                  <span className="text-[12px] font-medium text-gold">
                    {Math.round(s.pct * 100)}%
                  </span>
                )}
              </span>
            </div>
            {s.hint && (
              <p className="mt-1 text-[11px] text-bg/40">{s.hint}</p>
            )}
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-bg/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  background:
                    "linear-gradient(90deg, #b98a3a 0%, #d4a853 60%, #e6c069 100%)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  RefreshCw,
  Moon,
  Play,
  Check,
  type LucideIcon,
} from "lucide-react";
import type { Automation, AutomationKey } from "@/lib/db/automations";

const META: Record<
  AutomationKey,
  { icon: LucideIcon; unit: "hours" | "days"; trigger: (n: number) => string; editableBody: boolean }
> = {
  welcome: {
    icon: Send,
    unit: "hours",
    trigger: (n) =>
      n === 0
        ? "Sends the welcome email as soon as someone joins."
        : `Sends the welcome email ${n} hour${n === 1 ? "" : "s"} after someone joins.`,
    editableBody: false,
  },
  reengage: {
    icon: RefreshCw,
    unit: "days",
    trigger: (n) =>
      `Nudges subscribers still inactive ${n} day${n === 1 ? "" : "s"} after being invited.`,
    editableBody: true,
  },
  winback: {
    icon: Moon,
    unit: "days",
    trigger: (n) =>
      `Wins back subscribers with no opens or clicks for ${n} day${n === 1 ? "" : "s"}.`,
    editableBody: true,
  },
};

export function AutomationsView({ automations }: { automations: Automation[] }) {
  return (
    <div className="flex flex-col gap-4">
      {automations.map((a) => (
        <AutomationCard key={a.id} automation={a} />
      ))}
    </div>
  );
}

function AutomationCard({ automation }: { automation: Automation }) {
  const router = useRouter();
  const meta = META[automation.key];
  const factor = meta.unit === "days" ? 24 : 1;

  const [enabled, setEnabled] = useState(automation.enabled);
  const [delay, setDelay] = useState(automation.delay_hours / factor);
  const [subject, setSubject] = useState(automation.subject);
  const [body, setBody] = useState(automation.body);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const dirty =
    delay !== automation.delay_hours / factor ||
    subject !== automation.subject ||
    body !== automation.body;

  const patch = async (payload: Record<string, unknown>, msg?: string) => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/automations/${automation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data.error || "Update failed.");
        return false;
      }
      if (msg) setNotice(msg);
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  };

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    const ok = await patch({ enabled: next }, next ? "Automation enabled." : "Automation paused.");
    if (!ok) setEnabled(!next); // revert on failure
  };

  const save = () =>
    patch(
      { delay_hours: Math.round(delay * factor), subject, body },
      "Saved."
    );

  const runNow = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/automations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: automation.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data.error || "Run failed.");
      } else {
        const r = data.result;
        setNotice(
          r.attempted === 0
            ? "Ran - no eligible subscribers right now."
            : `Ran - sent ${r.sent}, failed ${r.failed}.`
        );
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const Icon = meta.icon;

  return (
    <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/12 text-gold">
            <Icon size={18} strokeWidth={1.9} />
          </span>
          <div>
            <p className="font-display text-lg text-bg">{automation.name}</p>
            <p className="mt-0.5 text-[13px] text-bg/55">
              {meta.trigger(delay)}
            </p>
          </div>
        </div>
        <Toggle on={enabled} disabled={busy} onClick={toggle} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr]">
        <Field label={`Delay (${meta.unit})`}>
          <input
            type="number"
            min={0}
            value={delay}
            onChange={(e) => setDelay(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg focus:border-gold/50 focus:outline-none"
          />
        </Field>
        <Field label="Subject">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg focus:border-gold/50 focus:outline-none"
          />
        </Field>
      </div>

      {meta.editableBody ? (
        <Field label="Message" className="mt-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write the email body. Leave a blank line between paragraphs."
            className="w-full resize-y rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
          />
        </Field>
      ) : (
        <p className="mt-4 rounded-lg border border-bg/10 bg-bg/3 px-3 py-2 text-[12px] text-bg/50">
          Uses the branded beta welcome template. Edit its content and CTA under{" "}
          <span className="text-bg/70">Beta invite</span>.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy || !dirty}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-[13px] font-medium text-ink transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
        >
          <Check size={14} /> Save changes
        </button>
        <button
          type="button"
          onClick={runNow}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-4 py-2 text-[13px] text-bg/75 hover:border-gold/40 hover:text-bg disabled:opacity-40"
        >
          <Play size={13} /> Run now
        </button>

        <div className="ml-auto flex items-center gap-4 text-[12px] text-bg/45">
          <span>
            Sent <span className="text-bg/80">{automation.sent_count.toLocaleString()}</span>
          </span>
          <span>
            Last run{" "}
            <span className="text-bg/80">
              {automation.last_run_at
                ? new Date(automation.last_run_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "never"}
            </span>
          </span>
        </div>
      </div>

      {notice && (
        <div className="mt-3 rounded-lg border border-bg/12 bg-bg/4 px-3 py-2 text-[12px] text-bg/75">
          {notice}
        </div>
      )}
    </div>
  );
}

function Toggle({
  on,
  disabled,
  onClick,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors disabled:opacity-50 " +
        (on ? "bg-gold" : "bg-bg/20")
      }
    >
      <span
        className={
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 " +
          (on ? "translate-x-5" : "translate-x-0")
        }
      />
    </button>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={"flex flex-col gap-1.5 " + (className ?? "")}>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
        {label}
      </span>
      {children}
    </label>
  );
}

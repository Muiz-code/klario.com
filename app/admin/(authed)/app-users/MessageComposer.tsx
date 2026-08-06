"use client";

import { useEffect, useState } from "react";
import { X, Send, Loader2, Sparkles, Bell } from "lucide-react";
import {
  MESSAGE_CATEGORIES,
  type MessageCategory,
} from "@/lib/db/appMessages";
import type { Suggestion } from "@/lib/appMessageSuggestions";

const MAX_TITLE = 120;
const MAX_BODY = 1000;

export type Recipient = { email: string; name: string | null; onApp: boolean };

/**
 * Compose and send an in-app message. Shows exactly what will land on the
 * user's phone, and offers suggestions curated from what they've actually done
 * in the app — each labelled with the signal it fired on, so a nudge is never
 * a mystery.
 */
export function MessageComposer({
  recipients,
  suggestions,
  audienceLabel,
  onClose,
  onSent,
}: {
  recipients: Recipient[];
  suggestions: (Suggestion & { matches?: number; total?: number })[];
  audienceLabel: string;
  onClose: () => void;
  onSent: (summary: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<MessageCategory>("update");
  const [used, setUsed] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, sending]);

  const onAppRecipients = recipients.filter((r) => r.onApp);
  const notOnApp = recipients.length - onAppRecipients.length;

  // {name} is filled per-person at delivery; preview it with the first one.
  const previewName = onAppRecipients[0]?.name?.split(" ")[0] ?? "there";
  const preview = (t: string) => t.replace(/\{name\}/g, previewName);

  const apply = (s: Suggestion) => {
    setTitle(s.title);
    setBody(s.body);
    setCategory(s.category);
    setUsed(s.id);
  };

  const send = async () => {
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("A title and a message are both required.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/app-users/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: onAppRecipients.map((r) => r.email),
          title: title.trim(),
          body: body.trim(),
          category,
          audience: audienceLabel,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setSending(false);
      if (!res.ok) {
        setError(data.error || "Could not send. Please try again.");
        return;
      }
      const parts = [`Delivered to ${data.delivered}`];
      if (data.skipped) parts.push(`${data.skipped} had announcements off`);
      if (data.failed) parts.push(`${data.failed} failed`);
      onSent(`${parts.join(" · ")}.`);
    } catch {
      setSending(false);
      setError("Could not send. Please try again.");
    }
  };

  const field =
    "w-full rounded-lg border border-bg/15 bg-bg/[0.03] px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Send an in-app message"
        className="my-8 w-full max-w-2xl rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-bg/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Bell size={16} />
            </span>
            <div>
              <p className="text-[15px] font-medium text-bg">Send an in-app message</p>
              <p className="text-[12px] text-bg/50">
                {onAppRecipients.length.toLocaleString()}{" "}
                {onAppRecipients.length === 1 ? "person" : "people"} · {audienceLabel}
                {notOnApp > 0 && (
                  <span className="text-bg/35"> · {notOnApp} not on the app, skipped</span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            className="shrink-0 rounded-lg border border-bg/12 p-1.5 text-bg/50 hover:border-gold/40 hover:text-gold disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-gold/70">
                <Sparkles size={12} /> Suggested from their activity
              </p>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => apply(s)}
                    className={
                      "rounded-lg border p-3 text-left transition-colors " +
                      (used === s.id
                        ? "border-gold/50 bg-gold/[0.06]"
                        : "border-bg/10 bg-bg/[0.02] hover:border-bg/25")
                    }
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13.5px] text-bg">{s.title}</span>
                      <span className="shrink-0 text-[11px] text-bg/40">
                        {s.matches !== undefined && s.total !== undefined
                          ? `${s.matches} of ${s.total}`
                          : s.signal}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] text-bg/50">
                      {preview(s.body)}
                    </p>
                    {s.matches !== undefined && (
                      <p className="mt-1 text-[11px] text-bg/35">{s.signal}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compose */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.12em] text-bg/45">
                  Title
                </span>
                <span className="text-[11px] text-bg/30">
                  {title.length}/{MAX_TITLE}
                </span>
              </div>
              <input
                className={field}
                value={title}
                maxLength={MAX_TITLE}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your money missed you"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.12em] text-bg/45">
                  Message
                </span>
                <span className="text-[11px] text-bg/30">
                  {body.length}/{MAX_BODY}
                </span>
              </div>
              <textarea
                className={field + " min-h-[110px] resize-y leading-relaxed"}
                value={body}
                maxLength={MAX_BODY}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the message… use {name} for their first name."
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  title={c.hint}
                  onClick={() => setCategory(c.key)}
                  className={
                    "rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors " +
                    (category === c.key
                      ? "border-gold/50 bg-gold/[0.08] text-gold"
                      : "border-bg/12 text-bg/60 hover:text-bg")
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview — what actually lands on the phone */}
          {(title || body) && (
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-bg/45">
                On their phone
              </p>
              <div className="rounded-xl border border-bg/12 bg-bg/[0.04] p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-[13px] text-gold">
                    K
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-bg">
                      {preview(title) || "Title"}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-bg/60">
                      {preview(body) || "Message body"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-bg/35">
                Goes to their Klario notifications, and as a push if they have the app
                installed with announcements on.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[13px] text-red-200">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-bg/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-xl border border-bg/15 px-4 py-2 text-sm text-bg/80 hover:border-bg/30 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={send}
            disabled={sending || onAppRecipients.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-medium text-ink transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send to {onAppRecipients.length.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

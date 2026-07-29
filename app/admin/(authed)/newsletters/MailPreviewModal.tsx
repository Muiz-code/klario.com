"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Paperclip, Users, Clock } from "lucide-react";
import type { Newsletter } from "@/lib/db/newsletters";

/** Merge tags aren't filled in on a preview — show them as a reader would see. */
function previewHtml(html: string): string {
  return html
    .replace(/\{\{\s*first_name\s*\}\}/g, "there")
    .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, "#");
}

/**
 * Read-only view of a composed mail — exactly what went out (or what a draft
 * would send), rendered in an isolated iframe so the email's own CSS can't
 * bleed into the admin. Body is fetched on open.
 */
export function MailPreviewModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [mail, setMail] = useState<Newsletter | null>(null);
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
        const res = await fetch(`/api/admin/newsletters/${id}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) setError(data.error || "Could not load this mail.");
        else setMail(data.newsletter as Newsletter);
      } catch {
        if (!cancelled) setError("Could not load this mail.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-ink/70 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mail?.subject ?? "Mail preview"}
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-bg/10 px-6 py-4">
          <div className="min-w-0">
            <p className="truncate text-[16px] font-medium text-bg">
              {mail?.subject ?? (error ? "Mail" : "Loading…")}
            </p>
            {mail && (
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-bg/50">
                <span className="capitalize text-bg/70">{mail.status}</span>
                {(mail.status === "sent" || mail.status === "sending") && (
                  <span className="inline-flex items-center gap-1">
                    <Users size={11} /> {mail.sent_count} / {mail.recipient_count} recipients
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} />
                  {mail.sent_at
                    ? `Sent ${new Date(mail.sent_at).toLocaleString()}`
                    : `Created ${new Date(mail.created_at).toLocaleString()}`}
                </span>
              </p>
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
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          {error ? (
            <p className="p-8 text-center text-sm text-red-500">{error}</p>
          ) : !mail ? (
            <p className="flex items-center justify-center gap-2 p-12 text-sm text-black/50">
              <Loader2 size={15} className="animate-spin" /> Loading the mail…
            </p>
          ) : (
            <iframe
              title={`${mail.subject} preview`}
              srcDoc={previewHtml(mail.html)}
              sandbox=""
              className="h-[70vh] w-full border-0"
            />
          )}
        </div>

        {/* Attachments */}
        {mail && mail.attachments?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-bg/10 px-6 py-3">
            <span className="text-[11px] uppercase tracking-[0.12em] text-bg/40">Attached</span>
            {mail.attachments.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-bg/15 px-2.5 py-1 text-[12px] text-bg/75 hover:border-gold/40 hover:text-gold"
              >
                <Paperclip size={12} /> {a.filename}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

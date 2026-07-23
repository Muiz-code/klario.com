"use client";

import { useState } from "react";
import { X, Send, Mail, Plus, Trash2 } from "lucide-react";
import { APP_LINKS } from "@/lib/constants";

export type Recipient = { id: string; name: string; email: string };

type LinkButton = { label: string; url: string; variant: "primary" | "outline" };

const STORE_LINKS: LinkButton[] = [
  { label: "Download on iOS", url: APP_LINKS.ios, variant: "primary" },
  { label: "Get on Android", url: APP_LINKS.android, variant: "outline" },
];
const WHATSAPP_LINK: LinkButton = {
  label: "Join the WhatsApp group",
  url: APP_LINKS.whatsapp,
  variant: "outline",
};

// Quick-add presets shown as chips.
const PRESETS: { key: string; link: LinkButton }[] = [
  { key: "iOS", link: STORE_LINKS[0] },
  { key: "Android", link: STORE_LINKS[1] },
  { key: "WhatsApp", link: WHATSAPP_LINK },
];

// Editable starting points. Pick one to prefill, then tweak before sending.
const TEMPLATES: {
  name: string;
  subject: string;
  heading: string;
  body: string;
  links: LinkButton[];
}[] = [
  {
    name: "You're in — welcome",
    subject: "You're in the Klario Anchor Club",
    heading: "Welcome to the Anchor Club.",
    body: "We loved your application and we'd like you in the founding cohort.\n\nThe Anchor Club is about building real things together — you'll get product experience, mentorship, and first access to the Klario beta.\n\nDownload the app to get started, and join the cohort WhatsApp group below.",
    links: [...STORE_LINKS, WHATSAPP_LINK],
  },
  {
    name: "Get the app + next steps",
    subject: "Your next step for the Anchor Club",
    heading: "One quick step.",
    body: "Thanks for applying to the Anchor Club.\n\nTo take part, download the Klario app and create your account with this same email — that's how we link your Anchor profile to your progress.",
    links: [...STORE_LINKS],
  },
  {
    name: "Blank",
    subject: "",
    heading: "",
    body: "",
    links: [],
  },
];

export function SendEmailPanel({
  recipients,
  onClose,
  onSent,
}: {
  recipients: Recipient[];
  onClose: () => void;
  onSent: (sent: number, failed: number) => void;
}) {
  const [templateIdx, setTemplateIdx] = useState(0);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [heading, setHeading] = useState(TEMPLATES[0].heading);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [links, setLinks] = useState<LinkButton[]>(TEMPLATES[0].links);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyTemplate = (i: number) => {
    const t = TEMPLATES[i];
    setTemplateIdx(i);
    setSubject(t.subject);
    setHeading(t.heading);
    setBody(t.body);
    setLinks(t.links.map((l) => ({ ...l })));
  };

  const addLink = (preset?: LinkButton) =>
    setLinks((prev) => [...prev, preset ? { ...preset } : { label: "", url: "", variant: "primary" }]);
  const updateLink = (i: number, patch: Partial<LinkButton>) =>
    setLinks((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const removeLink = (i: number) => setLinks((prev) => prev.filter((_, j) => j !== i));

  const send = async () => {
    setError(null);
    if (!subject.trim()) return setError("Add a subject.");
    if (!body.trim()) return setError("Write a message.");
    setSending(true);
    try {
      const res = await fetch("/api/admin/anchor/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: recipients.map((r) => r.email),
          subject,
          heading,
          body,
          buttons: links,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Send failed. Please try again.");
        return;
      }
      onSent(data.sent ?? 0, data.failed ?? 0);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const field =
    "w-full rounded-lg border border-bg/15 bg-bg/[0.03] px-3 py-2 text-sm text-bg placeholder:text-bg/40 focus:border-gold/50 focus:outline-none";
  const label = "mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-bg/45";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Mail size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-bg">Email selected anchors</p>
              <p className="text-[12px] text-bg/50">
                {recipients.length} recipient{recipients.length === 1 ? "" : "s"} · Klario brand template
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-bg/50 transition-colors hover:bg-bg/5 hover:text-bg"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Recipients */}
          <div className="flex flex-wrap gap-1.5">
            {recipients.slice(0, 12).map((r) => (
              <span
                key={r.id}
                className="rounded-full border border-bg/12 bg-bg/[0.03] px-2.5 py-1 text-[12px] text-bg/70"
                title={r.email}
              >
                {r.name}
              </span>
            ))}
            {recipients.length > 12 && (
              <span className="rounded-full px-2.5 py-1 text-[12px] text-bg/45">
                +{recipients.length - 12} more
              </span>
            )}
          </div>

          {/* Template picker */}
          <div>
            <span className={label}>Start from a template</span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => applyTemplate(i)}
                  className={
                    "rounded-lg border px-3 py-1.5 text-[13px] transition-colors " +
                    (templateIdx === i
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-bg/15 text-bg/70 hover:border-gold/30")
                  }
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={label}>Subject</span>
            <input
              className={field}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="You're in the Klario Anchor Club"
            />
          </div>

          <div>
            <span className={label}>Heading (optional)</span>
            <input
              className={field}
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Welcome to the Anchor Club."
            />
          </div>

          <div>
            <span className={label}>Message</span>
            <textarea
              className={field + " min-h-[150px] resize-y leading-relaxed"}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message… (blank lines start new paragraphs)"
            />
          </div>

          {/* Link buttons */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className={label + " mb-0"}>Link buttons</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => addLink(p.link)}
                    className="rounded-md border border-bg/15 px-2 py-1 text-[12px] text-bg/70 hover:border-gold/40 hover:text-gold"
                  >
                    + {p.key}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addLink()}
                  className="inline-flex items-center gap-1 rounded-md border border-bg/15 px-2 py-1 text-[12px] text-bg/70 hover:border-gold/40 hover:text-gold"
                >
                  <Plus size={12} /> Custom
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {links.length === 0 && (
                <p className="text-[12px] text-bg/40">
                  No buttons. Add iOS, Android, a WhatsApp group, or a custom link.
                </p>
              )}
              {links.map((l, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    className={field + " min-w-[140px] flex-1"}
                    value={l.label}
                    onChange={(e) => updateLink(i, { label: e.target.value })}
                    placeholder="Button label"
                  />
                  <input
                    className={field + " min-w-[180px] flex-[1.4]"}
                    value={l.url}
                    onChange={(e) => updateLink(i, { url: e.target.value })}
                    placeholder="https://…"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateLink(i, { variant: l.variant === "primary" ? "outline" : "primary" })
                    }
                    className={
                      "rounded-md border px-2.5 py-2 text-[12px] " +
                      (l.variant === "primary"
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-bg/20 text-bg/60")
                    }
                    title="Toggle button style"
                  >
                    {l.variant === "primary" ? "Gold" : "Outline"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="rounded-md p-2 text-bg/45 hover:bg-red-400/10 hover:text-red-300"
                    aria-label="Remove link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[13px] text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-bg/10 px-6 py-4">
          <span className="text-[12px] text-bg/45">
            Logo header + Raavon footer · logged in the audit trail
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-bg/15 px-3.5 py-2 text-sm text-bg/70 hover:text-bg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <Send size={15} />
              {sending ? "Sending…" : `Send to ${recipients.length}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

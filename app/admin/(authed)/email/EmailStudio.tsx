"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const INPUT =
  "w-full rounded-xl border border-bg/15 bg-bg/4 px-3.5 py-2.5 text-sm text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none";

export function EmailStudio({
  template,
  initialSubject,
  initialCtaUrl,
  initialDeliverability,
  configured,
}: {
  template: string;
  initialSubject: string;
  initialCtaUrl: string;
  initialDeliverability: boolean;
  configured: boolean;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [ctaUrl, setCtaUrl] = useState(initialCtaUrl);
  const [deliverability, setDeliverability] = useState(initialDeliverability);
  const [firstName, setFirstName] = useState("Tomiwa");
  const [testEmail, setTestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const preview = useMemo(() => {
    return template
      .replace(/\{\{\s*first_name\s*\}\}/g, escapeHtml(firstName || "there"))
      .replace(/\{\{\s*cta_url\s*\}\}/g, ctaUrl || "#")
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, "#preview");
  }, [template, firstName, ctaUrl]);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          welcome_subject: subject,
          welcome_cta_url: ctaUrl,
          deliverability_confirmed: deliverability,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setNotice(res.ok ? "Saved." : data.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!testEmail.trim()) return;
    setTesting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim(), firstName }),
      });
      const data = await res.json().catch(() => ({}));
      setNotice(res.ok ? `Test sent to ${testEmail}.` : data.error || "Send failed.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Controls */}
      <div className="flex flex-col gap-5">
        <DeliverabilityPanel
          confirmed={deliverability}
          onToggle={setDeliverability}
        />

        <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
          <h2 className="font-display text-lg text-bg">Content</h2>
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Subject line">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="CTA button URL">
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://..."
                className={INPUT}
              />
            </Field>
            <Field label="Preview first name">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={INPUT}
              />
            </Field>
            <button
              type="button"
              onClick={save}
              disabled={saving || !configured}
              className="rounded-xl bg-gold px-4 py-2.5 text-sm font-medium text-ink transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
          <h2 className="font-display text-lg text-bg">Send a test</h2>
          <p className="mt-1 text-[12px] text-bg/55">
            Sends one copy of this email to the address below.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              className={INPUT}
            />
            <button
              type="button"
              onClick={sendTest}
              disabled={testing || !testEmail.trim() || !configured}
              className="rounded-xl border border-bg/20 px-4 py-2.5 text-sm text-bg hover:border-gold/50 disabled:opacity-50"
            >
              {testing ? "Sending..." : "Send test email"}
            </button>
          </div>
        </div>

        {notice && (
          <div className="rounded-xl border border-bg/15 bg-bg/4 px-4 py-2.5 text-[13px] text-bg/80">
            {notice}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-bg/45">
          Live preview
        </p>
        <div className="overflow-hidden rounded-2xl border border-bg/10 bg-white">
          <iframe
            title="Email preview"
            srcDoc={preview}
            className="h-[760px] w-full"
            sandbox=""
          />
        </div>
      </div>
    </div>
  );
}

function DeliverabilityPanel({
  confirmed,
  onToggle,
}: {
  confirmed: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-5 " +
        (confirmed
          ? "border-emerald-400/30 bg-emerald-400/5"
          : "border-amber-400/30 bg-amber-400/5")
      }
    >
      <div className="flex items-center gap-2">
        {confirmed ? (
          <CheckCircle2 size={18} className="text-emerald-300" />
        ) : (
          <AlertTriangle size={18} className="text-amber-300" />
        )}
        <h2 className="font-display text-lg text-bg">Deliverability</h2>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-bg/70">
        Before sending to real people, confirm in{" "}
        <a
          href="https://resend.com/domains"
          target="_blank"
          rel="noreferrer"
          className="text-gold underline"
        >
          Resend
        </a>{" "}
        that:
      </p>
      <ul className="mt-2 flex flex-col gap-1.5 text-[13px] text-bg/70">
        <li>• klario.finance is added and verified</li>
        <li>• SPF, DKIM, and DMARC records are published</li>
        <li>• You send from hello@klario.finance on that domain</li>
      </ul>
      <label className="mt-3 flex items-center gap-2 text-[13px] text-bg/85">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-emerald-400"
        />
        Domain verified, safe to send for real
      </label>
      {!confirmed && (
        <p className="mt-2 text-[12px] text-amber-200/90">
          Until you confirm, stick to test sends to avoid bouncing into spam.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
        {label}
      </span>
      {children}
    </label>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

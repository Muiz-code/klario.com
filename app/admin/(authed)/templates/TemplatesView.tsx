"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ArrowRight, X, Plus, Trash2, Pencil, Code } from "lucide-react";
import type { GalleryTemplate } from "@/lib/email/gallery";
import { buildRichEmail } from "@/lib/email/compose-html";
import { ConfirmModal, type ConfirmState } from "../_components/Modal";
import { RichEmailEditor } from "../newsletters/new/RichEmailEditor";

export type TemplateItem = GalleryTemplate & { custom: boolean };

const STARTER_HTML = `<div style="background:#0A0B0D;padding:32px 0;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#16181D;border:1px solid #272B33;border-radius:18px;">
    <tr><td style="padding:40px;">
      <h1 style="margin:0 0 16px;font-size:26px;color:#FFFFFF;">Hi {{first_name}},</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#C2C7CF;">Write your message here.</p>
      <p style="margin:24px 0 0;font-size:12px;color:#7E8794;">
        <a href="{{unsubscribe_url}}" style="color:#7E8794;">Unsubscribe</a>
      </p>
    </td></tr>
  </table>
</div>`;

/** Fill merge tags with harmless sample values for preview. */
function previewHtml(html: string): string {
  return html
    .replace(/\{\{\s*first_name\s*\}\}/g, "there")
    .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, "#");
}

export function TemplatesView({
  builtins,
  custom,
  configured,
}: {
  builtins: TemplateItem[];
  custom: TemplateItem[];
  configured: boolean;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<TemplateItem | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const use = (t: TemplateItem) =>
    router.push(`/p@ss1/newsletters/new?template=${encodeURIComponent(t.id)}`);

  const requestDelete = (t: TemplateItem) =>
    setConfirmState({
      title: "Delete this template?",
      message: `"${t.name}" will be removed. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => runDelete(t.id),
    });

  const runDelete = async (id: string) => {
    setDeleting(true);
    const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    setDeleting(false);
    setConfirmState(null);
    if (res.ok) router.refresh();
    else setNotice("Could not delete template.");
  };

  return (
    <div className="flex flex-col gap-8">
      {notice && (
        <div className="rounded-xl border border-bg/15 bg-bg/4 px-4 py-2.5 text-[13px] text-bg/80">
          {notice}
        </div>
      )}

      {/* Your templates */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-bg">Your templates</h2>
          <button
            type="button"
            onClick={() => setBuilderOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[12px] font-medium text-ink transition-transform hover:scale-[1.02]"
          >
            <Plus size={14} /> New template
          </button>
        </div>
        {custom.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-bg/12 bg-bg/3 px-5 py-8 text-center text-[13px] text-bg/45">
            No saved templates yet. Create one from scratch or start from a starter
            below.
          </div>
        ) : (
          <Grid>
            {custom.map((t) => (
              <TemplateCard
                key={t.id}
                t={t}
                onPreview={() => setPreview(t)}
                onUse={() => use(t)}
                onDelete={() => requestDelete(t)}
              />
            ))}
          </Grid>
        )}
      </section>

      {/* Starter templates */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-bg">Starter templates</h2>
        <Grid>
          {builtins.map((t) => (
            <TemplateCard
              key={t.id}
              t={t}
              onPreview={() => setPreview(t)}
              onUse={() => use(t)}
            />
          ))}
        </Grid>
      </section>

      {preview && (
        <PreviewModal
          template={preview}
          onClose={() => setPreview(null)}
          onUse={() => use(preview)}
        />
      )}
      {builderOpen && (
        <TemplateBuilder
          configured={configured}
          onClose={() => setBuilderOpen(false)}
          onSaved={() => {
            setBuilderOpen(false);
            router.refresh();
          }}
        />
      )}
      <ConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
        loading={deleting}
      />
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function TemplateCard({
  t,
  onPreview,
  onUse,
  onDelete,
}: {
  t: TemplateItem;
  onPreview: () => void;
  onUse: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-bg/10 bg-bg/4">
      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${t.name}`}
        className="group relative h-44 overflow-hidden border-b border-bg/10 bg-white"
      >
        <iframe
          title={`${t.name} preview`}
          srcDoc={previewHtml(t.html)}
          tabIndex={-1}
          scrolling="no"
          className="pointer-events-none absolute left-0 top-0 h-[1100px] w-[600px] origin-top-left scale-[0.5]"
        />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-ink/40 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg/90 px-3 py-1.5 text-[12px] font-medium text-ink">
            <Eye size={13} /> Preview
          </span>
        </span>
        {t.custom && (
          <span className="absolute left-2 top-2 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-medium text-ink">
            Custom
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-bg">{t.name}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-bg/55">
              {t.description || "—"}
            </p>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete template"
              className="shrink-0 rounded-md p-1 text-bg/40 hover:bg-red-400/10 hover:text-red-300"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        {t.subject && (
          <p className="truncate text-[11px] text-bg/40">
            Subject: <span className="text-bg/60">{t.subject}</span>
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-3 py-1.5 text-[12px] text-bg/75 hover:border-gold/40 hover:text-bg"
          >
            <Eye size={13} /> Preview
          </button>
          <button
            type="button"
            onClick={onUse}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[12px] font-medium text-ink transition-transform hover:scale-[1.02]"
          >
            Use template <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({
  template,
  onClose,
  onUse,
}: {
  template: TemplateItem;
  onClose: () => void;
  onUse: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-ink/70 backdrop-blur-sm" aria-hidden />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-bg/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg text-bg">{template.name}</h2>
            <p className="truncate text-[12px] text-bg/50">
              {template.description || "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onUse}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[12px] font-medium text-ink transition-transform hover:scale-[1.02]"
            >
              Use template <ArrowRight size={13} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-bg/55 hover:text-bg"
            >
              <X size={18} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-white">
          <iframe
            title={`${template.name} full preview`}
            srcDoc={previewHtml(template.html)}
            className="h-[80vh] w-full"
          />
        </div>
      </div>
    </div>
  );
}

type BuilderMode = "write" | "html";

function TemplateBuilder({
  configured,
  onClose,
  onSaved,
}: {
  configured: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<BuilderMode>("write");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");

  // Write mode: rich body + optional button. HTML mode: raw markup.
  const [bodyHtml, setBodyHtml] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [rawHtml, setRawHtml] = useState(STARTER_HTML);

  const [imageBusy, setImageBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The final HTML that gets saved + previewed.
  const finalHtml = useMemo(
    () =>
      mode === "write"
        ? buildRichEmail({ bodyHtml, subject, ctaLabel, ctaHref })
        : rawHtml,
    [mode, bodyHtml, subject, ctaLabel, ctaHref, rawHtml]
  );
  const preview = useMemo(() => previewHtml(finalHtml), [finalHtml]);

  const uploadImage = async (file: File): Promise<string | null> => {
    setImageBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Image upload failed.");
        return null;
      }
      return data.url as string;
    } finally {
      setImageBusy(false);
    }
  };

  const switchToHtml = () => {
    // Seed the raw editor from the rich content the first time.
    if (!rawHtml.trim() || rawHtml === STARTER_HTML) {
      setRawHtml(buildRichEmail({ bodyHtml, subject, ctaLabel, ctaHref }));
    }
    setMode("html");
  };

  const hasContent =
    mode === "write"
      ? bodyHtml.replace(/<[^>]*>/g, "").trim().length > 0
      : rawHtml.trim().length > 0;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, subject, html: finalHtml }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-ink/70 backdrop-blur-sm" aria-hidden />
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-bg/12 bg-[#0d0e12] shadow-2xl">
        <header className="flex items-center justify-between border-b border-bg/10 px-5 py-4">
          <h2 className="font-display text-lg text-bg">New template</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-bg/55 hover:text-bg">
            <X size={18} />
          </button>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-2">
          {/* Editor */}
          <div className="flex flex-col gap-3 overflow-y-auto border-b border-bg/10 p-5 md:border-b-0 md:border-r">
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Product update"
                className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
              />
            </Field>
            <Field label="Description">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short note about when to use it"
                className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
              />
            </Field>
            <Field label="Default subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
                className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
              />
            </Field>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-bg/12 bg-bg/4 p-1">
              <ModeTab active={mode === "write"} onClick={() => setMode("write")} icon={Pencil}>
                Write
              </ModeTab>
              <ModeTab active={mode === "html"} onClick={switchToHtml} icon={Code}>
                HTML
              </ModeTab>
            </div>

            {mode === "write" ? (
              <div className="flex flex-col gap-3">
                <RichEmailEditor
                  value={bodyHtml}
                  onChange={setBodyHtml}
                  uploadImage={uploadImage}
                  uploading={imageBusy}
                  configured={configured}
                />
                <details className="rounded-xl border border-bg/10 bg-bg/4 px-4 py-3">
                  <summary className="cursor-pointer text-[12px] font-medium uppercase tracking-[0.14em] text-bg/45">
                    Add a button (optional)
                  </summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      placeholder="Button text (e.g. Read more)"
                      className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
                    />
                    <input
                      value={ctaHref}
                      onChange={(e) => setCtaHref(e.target.value)}
                      placeholder="https://klario.finance"
                      className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
                    />
                  </div>
                </details>
              </div>
            ) : (
              <Field label="HTML">
                <textarea
                  value={rawHtml}
                  onChange={(e) => setRawHtml(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full resize-y rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 font-mono text-[12px] text-bg focus:border-gold/50 focus:outline-none"
                />
              </Field>
            )}

            <p className="text-[11px] text-bg/40">
              Merge tags <span className="text-bg/60">{"{{first_name}}"}</span> and{" "}
              <span className="text-bg/60">{"{{unsubscribe_url}}"}</span> are
              filled per recipient when sent.
            </p>
          </div>

          {/* Live preview */}
          <div className="flex flex-col overflow-hidden bg-white">
            <iframe title="Template preview" srcDoc={preview} className="h-full min-h-[300px] w-full" />
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-bg/10 px-5 py-4">
          <span className="text-[12px] text-red-300">{error}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-bg/15 px-4 py-2 text-[13px] text-bg/70 hover:text-bg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy || !name.trim() || !hasContent}
              className="rounded-full bg-gold px-4 py-2 text-[13px] font-medium text-ink transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
            >
              {busy ? "Saving..." : "Save template"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Pencil;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors " +
        (active ? "bg-gold text-ink" : "text-bg/60 hover:text-bg")
      }
    >
      <Icon size={13} /> {children}
    </button>
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

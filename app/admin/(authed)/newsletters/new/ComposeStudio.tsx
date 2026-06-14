"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Send, Save, Pencil, Code } from "lucide-react";
import type { GalleryTemplate } from "@/lib/email/gallery";
import { buildEmailHtml } from "@/lib/email/compose-html";
import { EditablePreview } from "./EditablePreview";
import { EditableHtmlFrame } from "./EditableHtmlFrame";
import {
  ConfirmModal,
  InfoModal,
  type ConfirmState,
} from "../../_components/Modal";

const INPUT =
  "w-full rounded-xl border border-bg/15 bg-bg/4 px-3.5 py-2.5 text-sm text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none";

type Mode = "write" | "html";
type Segment = "all" | "new" | "existing" | "choose";
type Counts = { all: number; new: number; existing: number };
type Person = { email: string; name: string; status: string };

const SEGMENTS: { id: Segment; label: string; hint: string }[] = [
  { id: "all", label: "All subscribers", hint: "Everyone except unsubscribed" },
  { id: "new", label: "New subscribers", hint: "Signed up, not yet emailed" },
  { id: "existing", label: "Existing subscribers", hint: "Already invited or active" },
  { id: "choose", label: "Choose people", hint: "Pick specific recipients" },
];

export function ComposeStudio({
  templates,
  counts,
  people,
  configured,
}: {
  templates: GalleryTemplate[];
  counts: Counts;
  people: Person[];
  configured: boolean;
}) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("write");
  const [subject, setSubject] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [pickerQuery, setPickerQuery] = useState("");

  // Write-mode fields
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // HTML-mode source
  const [rawHtml, setRawHtml] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);

  const [busy, setBusy] = useState<null | "save" | "send" | "image">(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [info, setInfo] = useState<{ title: string; message: string; ok?: boolean } | null>(null);

  // The HTML that will actually be sent (and previewed).
  const html = useMemo(() => {
    if (mode === "write") {
      return buildEmailHtml({ heading, body, ctaLabel, ctaHref, images });
    }
    return rawHtml;
  }, [mode, heading, body, ctaLabel, ctaHref, images, rawHtml]);

  const chosenList = people.filter((p) => chosen.has(p.email));
  const audienceCount =
    segment === "choose" ? chosen.size : counts[segment];

  const filteredPeople = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.email.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
  }, [people, pickerQuery]);

  const togglePerson = (email: string) => {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const pickTemplate = (t: GalleryTemplate) => {
    setTemplateId(t.id);
    setSubject((s) => s || t.subject);
    setRawHtml(t.html);
  };

  // Uploads an image and returns its public URL (or null on failure). Each
  // editor decides what to do with the URL.
  const uploadImage = async (file: File): Promise<string | null> => {
    setBusy("image");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInfo({ title: "Image upload failed", message: data.error || "Try again.", ok: false });
        return null;
      }
      return data.url as string;
    } finally {
      setBusy(null);
    }
  };

  const validate = (): string | null => {
    if (!subject.trim()) return "Add a subject line.";
    if (mode === "write" && !body.trim()) return "Write a message.";
    if (mode === "html" && !rawHtml.trim()) return "Add some HTML content.";
    return null;
  };

  const doSubmit = async (which: "save" | "send") => {
    setBusy(which);
    try {
      const create = await fetch("/api/admin/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), html }),
      });
      const cData = await create.json().catch(() => ({}));
      if (!create.ok) {
        setConfirm(null);
        setInfo({ title: "Could not save", message: cData.error || "Try again.", ok: false });
        return;
      }
      if (which === "save") {
        router.push("/p@ss1/newsletters");
        router.refresh();
        return;
      }
      const sendRes = await fetch(`/api/admin/newsletters/${cData.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          segment === "choose"
            ? { emails: [...chosen] }
            : { segment }
        ),
      });
      const sData = await sendRes.json().catch(() => ({}));
      setConfirm(null);
      if (!sendRes.ok) {
        setInfo({ title: "Sending failed", message: sData.error || "Saved as draft, but not sent.", ok: false });
        return;
      }
      setInfo({
        title: "Sent",
        message: `Delivered to ${sData.sent} of ${sData.attempted}. ${sData.failed ? sData.failed + " failed." : ""}`,
        ok: true,
      });
    } finally {
      setBusy(null);
    }
  };

  const onSendClick = () => {
    const err = validate();
    if (err) {
      setInfo({ title: "Almost there", message: err, ok: false });
      return;
    }
    if (segment === "choose" && chosen.size === 0) {
      setInfo({ title: "No recipients", message: "Pick at least one person to send to.", ok: false });
      return;
    }
    const seg = SEGMENTS.find((s) => s.id === segment)!;
    setConfirm({
      title: "Review recipients",
      confirmLabel: `Send to ${audienceCount}`,
      message: (
        <div className="flex flex-col gap-3">
          <p>
            This email will be sent to{" "}
            <span className="font-semibold text-bg">{audienceCount}</span>{" "}
            recipient{audienceCount === 1 ? "" : "s"}
            {segment === "choose" ? "" : ` (${seg.label.toLowerCase()})`}. This
            cannot be undone.
          </p>
          {segment === "choose" ? (
            <div className="max-h-52 overflow-y-auto rounded-lg border border-bg/12 bg-bg/4 p-2">
              {chosenList.map((p) => (
                <div
                  key={p.email}
                  className="flex items-center justify-between gap-3 px-2 py-1.5 text-[13px]"
                >
                  <span className="truncate text-bg/85">{p.name || p.email}</span>
                  {p.name && (
                    <span className="shrink-0 truncate text-bg/45">{p.email}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-bg/50">
              Recipients are everyone in the &quot;{seg.label}&quot; audience,
              except anyone who has unsubscribed.
            </p>
          )}
        </div>
      ),
      onConfirm: () => doSubmit("send"),
    });
  };

  const onSaveClick = () => {
    const err = validate();
    if (err) {
      setInfo({ title: "Almost there", message: err, ok: false });
      return;
    }
    doSubmit("save");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <ModeButton active={mode === "write"} onClick={() => setMode("write")} icon={Pencil}>
          Write
        </ModeButton>
        <ModeButton
          active={mode === "html"}
          onClick={() => {
            // Carry the written content (and images) into the HTML editor so
            // nothing is lost when switching, unless they were already editing
            // raw HTML.
            if (mode === "write" && !rawHtml.trim()) {
              setRawHtml(buildEmailHtml({ heading, body, ctaLabel, ctaHref, images }));
            }
            setMode("html");
          }}
          icon={Code}
        >
          HTML
        </ModeButton>
        <span className="ml-1 text-[12px] text-bg/45">
          {mode === "write"
            ? "Just type your message, no code needed."
            : "Full control. Edit raw HTML or start from a template."}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Editor column */}
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
              Subject line
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A note from Klario"
              className={INPUT}
            />
          </label>

          {mode === "write" ? (
            <WriteEditor
              ctaLabel={ctaLabel}
              setCtaLabel={setCtaLabel}
              ctaHref={ctaHref}
              setCtaHref={setCtaHref}
              images={images}
              setImages={setImages}
              uploadImage={uploadImage}
              uploading={busy === "image"}
              configured={configured}
            />
          ) : (
            <HtmlEditor
              templates={templates}
              templateId={templateId}
              pickTemplate={pickTemplate}
              rawHtml={rawHtml}
              setRawHtml={setRawHtml}
              uploadImage={uploadImage}
              uploading={busy === "image"}
              configured={configured}
            />
          )}

          {/* Audience */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
              Send to
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {SEGMENTS.map((s) => {
                const active = segment === s.id;
                const count = s.id === "choose" ? chosen.size : counts[s.id];
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSegment(s.id)}
                    className={
                      "rounded-xl border p-3 text-left transition-colors " +
                      (active
                        ? "border-gold/60 bg-gold/5"
                        : "border-bg/10 bg-bg/4 hover:border-bg/25")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-bg">{s.label}</span>
                      <span className="rounded-full bg-bg/10 px-1.5 text-[11px] text-bg/70">
                        {count}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-bg/50">
                      {s.hint}
                    </p>
                  </button>
                );
              })}
            </div>

            {segment === "choose" && (
              <PeoplePicker
                people={filteredPeople}
                total={people.length}
                chosen={chosen}
                query={pickerQuery}
                setQuery={setPickerQuery}
                toggle={togglePerson}
                selectAll={() => setChosen(new Set(filteredPeople.map((p) => p.email)))}
                clearAll={() => setChosen(new Set())}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSendClick}
              disabled={busy !== null || !configured}
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-medium text-ink transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <Send size={14} />
              Send to {audienceCount} {audienceCount === 1 ? "subscriber" : "subscribers"}
            </button>
            <button
              type="button"
              onClick={onSaveClick}
              disabled={busy !== null || !configured}
              className="inline-flex items-center gap-2 rounded-xl border border-bg/15 px-4 py-2.5 text-sm text-bg/85 hover:border-gold/40 hover:text-bg disabled:opacity-50"
            >
              <Save size={14} />
              {busy === "save" ? "Saving..." : "Save as draft"}
            </button>
          </div>

          {!configured && (
            <p className="text-[12px] text-amber-200/90">
              Supabase is not configured, so saving and sending are disabled.
            </p>
          )}
        </div>

        {/* Preview column */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-bg/45">
            Preview (click to edit)
          </p>
          <div className="h-[620px] overflow-hidden rounded-2xl border border-bg/10 bg-white">
            {mode === "write" ? (
              <div className="h-full overflow-y-auto">
                <EditablePreview
                  heading={heading}
                  body={body}
                  ctaLabel={ctaLabel}
                  ctaHref={ctaHref}
                  images={images}
                  setHeading={setHeading}
                  setBody={setBody}
                />
              </div>
            ) : (
              <EditableHtmlFrame
                html={rawHtml}
                onChange={setRawHtml}
                className="h-full w-full bg-white"
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        state={confirm}
        onClose={() => setConfirm(null)}
        loading={busy === "send"}
      />
      <InfoModal state={info} onClose={() => setInfo(null)} />
    </div>
  );
}

function ModeButton({
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
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition-colors " +
        (active ? "bg-gold text-ink" : "border border-bg/15 text-bg/70 hover:text-bg")
      }
    >
      <Icon size={13} />
      {children}
    </button>
  );
}

function WriteEditor(props: {
  ctaLabel: string;
  setCtaLabel: (v: string) => void;
  ctaHref: string;
  setCtaHref: (v: string) => void;
  images: string[];
  setImages: (v: string[]) => void;
  uploadImage: (file: File) => Promise<string | null>;
  uploading: boolean;
  configured: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          for (const f of files) {
            const url = await props.uploadImage(f);
            if (url) props.setImages([...props.images, url]);
          }
          if (fileRef.current) fileRef.current.value = "";
        }}
      />
      <div className="rounded-xl border border-bg/10 bg-bg/4 px-4 py-3 text-[13px] leading-relaxed text-bg/70">
        Click the heading and body in the preview on the right to write your
        message. Use <span className="text-bg/85">{"{{first_name}}"}</span> to
        greet each person by name.
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
            Images (optional)
          </span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={props.uploading || !props.configured}
            className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-2.5 py-1 text-[11px] text-bg/80 hover:border-gold/50 hover:text-bg disabled:opacity-40"
          >
            <ImageIcon size={12} />
            {props.uploading ? "Uploading..." : "Add image"}
          </button>
        </div>
        {props.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {props.images.map((url, i) => (
              <div
                key={url + i}
                className="group relative h-16 w-16 overflow-hidden rounded-lg border border-bg/15"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    props.setImages(props.images.filter((_, j) => j !== i))
                  }
                  aria-label="Remove image"
                  className="absolute right-0.5 top-0.5 rounded bg-ink/70 px-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
            Button text (optional)
          </span>
          <input
            value={props.ctaLabel}
            onChange={(e) => props.setCtaLabel(e.target.value)}
            placeholder="Read more"
            className={INPUT}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
            Button link (optional)
          </span>
          <input
            value={props.ctaHref}
            onChange={(e) => props.setCtaHref(e.target.value)}
            placeholder="https://klario.finance"
            className={INPUT}
          />
        </label>
      </div>
    </div>
  );
}

function HtmlEditor(props: {
  templates: GalleryTemplate[];
  templateId: string | null;
  pickTemplate: (t: GalleryTemplate) => void;
  rawHtml: string;
  setRawHtml: (v: string) => void;
  uploadImage: (file: File) => Promise<string | null>;
  uploading: boolean;
  configured: boolean;
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const url = await props.uploadImage(file);
    if (url) {
      const tag = `\n<img src="${url}" alt="" style="display:block;max-width:100%;height:auto;border-radius:12px;margin:16px auto;" />\n`;
      const el = textRef.current;
      const start = el?.selectionStart ?? props.rawHtml.length;
      props.setRawHtml(
        props.rawHtml.slice(0, start) + tag + props.rawHtml.slice(start)
      );
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-bg/45">
          Start from a template
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {props.templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => props.pickTemplate(t)}
              className={
                "rounded-xl border p-3 text-left transition-colors " +
                (props.templateId === t.id
                  ? "border-gold/60 bg-gold/5"
                  : "border-bg/10 bg-bg/4 hover:border-bg/25")
              }
            >
              <p className="text-sm font-medium text-bg">{t.name}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-bg/55">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
            HTML content
          </span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={props.uploading || !props.configured}
            className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-2.5 py-1 text-[11px] text-bg/75 hover:border-gold/50 hover:text-bg disabled:opacity-40"
          >
            <ImageIcon size={12} />
            {props.uploading ? "Uploading..." : "Insert image"}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <textarea
          ref={textRef}
          value={props.rawHtml}
          onChange={(e) => props.setRawHtml(e.target.value)}
          spellCheck={false}
          placeholder="Pick a template above, or paste your own HTML here."
          className="h-[360px] w-full resize-none rounded-xl border border-bg/15 bg-bg/4 px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none"
        />
        <p className="text-[11px] text-bg/45">
          Merge tags: <span className="text-bg/70">{"{{first_name}}"}</span> and{" "}
          <span className="text-bg/70">{"{{unsubscribe_url}}"}</span> are filled per recipient.
        </p>
      </div>
    </div>
  );
}

function PeoplePicker({
  people,
  total,
  chosen,
  query,
  setQuery,
  toggle,
  selectAll,
  clearAll,
}: {
  people: Person[];
  total: number;
  chosen: Set<string>;
  query: string;
  setQuery: (v: string) => void;
  toggle: (email: string) => void;
  selectAll: () => void;
  clearAll: () => void;
}) {
  return (
    <div className="mt-1 rounded-xl border border-bg/12 bg-bg/4 p-3">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${total} subscribers`}
          className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-[13px] text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={selectAll}
          className="shrink-0 rounded-lg border border-bg/15 px-2.5 py-2 text-[11px] text-bg/75 hover:border-gold/50 hover:text-bg"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="shrink-0 rounded-lg border border-bg/15 px-2.5 py-2 text-[11px] text-bg/75 hover:border-bg/30 hover:text-bg"
        >
          Clear
        </button>
      </div>
      <p className="mt-2 px-1 text-[11px] text-bg/45">{chosen.size} selected</p>
      <div className="mt-1 max-h-60 overflow-y-auto">
        {people.length === 0 ? (
          <p className="px-2 py-6 text-center text-[13px] text-bg/45">
            No one matches that search.
          </p>
        ) : (
          people.map((p) => {
            const on = chosen.has(p.email);
            return (
              <label
                key={p.email}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[13px] hover:bg-bg/5"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(p.email)}
                  className="accent-gold"
                />
                <span className="min-w-0 flex-1 truncate text-bg/85">
                  {p.name || p.email}
                </span>
                {p.name && (
                  <span className="shrink-0 truncate text-[11px] text-bg/45">
                    {p.email}
                  </span>
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

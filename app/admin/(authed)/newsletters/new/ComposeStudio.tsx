"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Send,
  Save,
  Pencil,
  Code,
  X,
  Video,
  FileText,
  ChevronDown,
} from "lucide-react";
import { SendProgressModal } from "./SendProgressModal";

// Email-safe button-style link (video / PDF). Rendered inline into the HTML.
function mediaButtonHtml(url: string, label: string): string {
  const u = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const l = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `\n<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px auto;"><tr><td align="center" style="border-radius:999px;background:#B98D3E;"><a href="${u}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#17130A;text-decoration:none;border-radius:999px;">${l}</a></td></tr></table>\n`;
}
import type { GalleryTemplate } from "@/lib/email/gallery";
import { buildRichEmail } from "@/lib/email/compose-html";
import { RichEmailEditor } from "./RichEmailEditor";
import { EditableHtmlFrame } from "./EditableHtmlFrame";
import {
  ConfirmModal,
  InfoModal,
  type ConfirmState,
} from "../../_components/Modal";

const INPUT =
  "w-full rounded-xl border border-bg/15 bg-bg/4 px-3.5 py-2.5 text-sm text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none";

/** Strips tags to check whether the rich body actually has content. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** True if the body has text OR embedded media — an image, link, button,
 *  video, or divider all count as content, not just typed words. */
function hasBodyContent(html: string): boolean {
  if (plainText(html)) return true;
  return /<(img|a|video|iframe|table|hr)\b/i.test(html);
}

type Mode = "write" | "html";
type Segment =
  | "all"
  | "new"
  | "existing"
  | "failed"
  | "sent_today"
  | "not_today"
  | "choose";
type Counts = {
  all: number;
  new: number;
  existing: number;
  failed: number;
  sent_today: number;
  not_today: number;
};
type Person = {
  email: string;
  name: string;
  status: string;
  mailed: boolean;
  mailedToday: boolean;
  failed: boolean;
};

const SEGMENTS: { id: Segment; label: string; hint: string }[] = [
  { id: "all", label: "All subscribers", hint: "Everyone except unsubscribed" },
  { id: "not_today", label: "Not sent today", hint: "Haven't been emailed today" },
  { id: "sent_today", label: "Sent today", hint: "Already emailed today" },
  { id: "new", label: "New subscribers", hint: "Signed up, not yet emailed" },
  { id: "existing", label: "Existing subscribers", hint: "Already invited or active" },
  { id: "failed", label: "Failed / bounced", hint: "Last delivery failed or bounced" },
  { id: "choose", label: "Choose people", hint: "Pick specific recipients" },
];

type Audiences = { anchor: string[]; beta: string[]; newsletter: string[] };

export function ComposeStudio({
  templates,
  counts,
  people,
  audiences,
  configured,
}: {
  templates: GalleryTemplate[];
  counts: Counts;
  people: Person[];
  audiences?: Audiences;
  configured: boolean;
}) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("write");
  const [subject, setSubject] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [pickerQuery, setPickerQuery] = useState("");
  const [selectCount, setSelectCount] = useState(100);
  const [batchSize, setBatchSize] = useState(50);
  const [allowResend, setAllowResend] = useState(false);
  const [sendToOpen, setSendToOpen] = useState(true);
  const [manual, setManual] = useState("");

  // Write-mode fields
  const [bodyHtml, setBodyHtml] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [videoText, setVideoText] = useState("▶ Watch the video");
  const [videoHref, setVideoHref] = useState("");

  // HTML-mode source
  const [rawHtml, setRawHtml] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);

  // The live preview is built with DOM APIs (inlineEmailStyles) that only run
  // client-side, so we render it after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard for the client-only preview
  useEffect(() => setMounted(true), []);

  // Recipients handed off from the Segments page ("Send campaign"): preselect
  // them as a "choose" audience so the composed email targets that segment.
  // A post-mount effect (not a lazy initializer) avoids an SSR hydration
  // mismatch, since sessionStorage is only available on the client.
  const [segmentTarget, setSegmentTarget] = useState<string | null>(null);
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem("klario_segment_target");
    } catch {
      return;
    }
    if (!raw) return;
    sessionStorage.removeItem("klario_segment_target");
    let emails: string[] = [];
    let label = "segment";
    try {
      const parsed = JSON.parse(raw) as { label?: string; emails?: string[] };
      emails = (parsed.emails ?? []).filter((e) => typeof e === "string");
      label = parsed.label ?? "segment";
    } catch {
      return;
    }
    if (emails.length === 0) return;
    /* eslint-disable react-hooks/set-state-in-effect -- syncing one-time storage handoff */
    setSegment("choose");
    setChosen(new Set(emails.map((e) => e.toLowerCase())));
    setSegmentTarget(label);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Preselect a template handed off from the Templates page (?template=<id>).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("template");
    if (!id) return;
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    /* eslint-disable react-hooks/set-state-in-effect -- applying URL template once */
    setMode("html");
    setTemplateId(t.id);
    setSubject((s) => s || t.subject);
    setRawHtml(t.html);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [templates]);

  const [busy, setBusy] = useState<null | "save" | "send" | "image" | "pdf">(null);
  const [attachments, setAttachments] = useState<{ filename: string; url: string }[]>([]);
  const pdfRef = useRef<HTMLInputElement>(null);
  const writeVideoRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [info, setInfo] = useState<{ title: string; message: string; ok?: boolean } | null>(null);
  const [progress, setProgress] = useState<{ id: string; total: number } | null>(null);

  // The HTML that will actually be sent (and previewed).
  const html = useMemo(() => {
    if (mode === "write") {
      return buildRichEmail({
        bodyHtml,
        subject,
        ctaLabel,
        ctaHref,
        videoLabel: videoText,
        videoHref,
      });
    }
    return rawHtml;
  }, [mode, bodyHtml, subject, ctaLabel, ctaHref, videoText, videoHref, rawHtml]);

  const chosenList = people.filter((p) => chosen.has(p.email));

  // Emails typed in by hand that aren't existing subscribers.
  const knownEmails = useMemo(
    () => new Set(people.map((p) => p.email)),
    [people]
  );
  const manualEmails = useMemo(
    () => [...chosen].filter((e) => !knownEmails.has(e)),
    [chosen, knownEmails]
  );
  // Combined recipient list for the review modal (selected + typed-in).
  const chosenAll = [
    ...chosenList.map((p) => ({ email: p.email, name: p.name })),
    ...manualEmails.map((e) => ({ email: e, name: "" })),
  ];

  const addManual = () => {
    const valid = manual
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (valid.length === 0) return;
    setChosen((prev) => {
      const next = new Set(prev);
      valid.forEach((e) => next.add(e));
      return next;
    });
    setManual("");
  };

  const removeChosen = (email: string) =>
    setChosen((prev) => {
      const next = new Set(prev);
      next.delete(email);
      return next;
    });

  // The people in the currently selected segment.
  const segmentPeople = useMemo(() => {
    if (segment === "new") return people.filter((p) => !p.mailed);
    if (segment === "existing") return people.filter((p) => p.mailed);
    if (segment === "failed") return people.filter((p) => p.failed);
    if (segment === "sent_today") return people.filter((p) => p.mailedToday);
    if (segment === "not_today") return people.filter((p) => !p.mailedToday);
    return people; // all / choose
  }, [people, segment]);

  // Whole-segment size (server-authoritative for all/new/existing).
  const segmentTotal = segment === "choose" ? people.length : counts[segment];
  // What actually sends: a refined selection if any, else the whole segment
  // (choose always requires an explicit selection).
  const audienceCount =
    chosen.size > 0 ? chosen.size : segment === "choose" ? 0 : segmentTotal;

  const filteredPeople = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return segmentPeople;
    return segmentPeople.filter(
      (p) =>
        p.email.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
  }, [segmentPeople, pickerQuery]);

  const togglePerson = (email: string) => {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  // Quick-select N of the segment: first, last, or random.
  const clampN = () =>
    Math.max(1, Math.min(selectCount || 0, segmentPeople.length));
  const selectFirst = () =>
    setChosen(new Set(segmentPeople.slice(0, clampN()).map((p) => p.email)));
  const selectLast = () =>
    setChosen(new Set(segmentPeople.slice(-clampN()).map((p) => p.email)));
  const selectRandom = () => {
    const pool = [...segmentPeople];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setChosen(new Set(pool.slice(0, clampN()).map((p) => p.email)));
  };
  const changeSegment = (s: Segment) => {
    setSegment(s);
    setChosen(new Set());
    setPickerQuery("");
    setSegmentTarget(null);
  };

  // Extra audiences (Anchor Club / Beta / Newsletter) send to an explicit email
  // list via the "choose" path.
  const audienceOptions = [
    { id: "anchor", label: "Anchor Club", hint: "Anchor Club registrants", emails: audiences?.anchor ?? [] },
    { id: "beta", label: "Beta testers", hint: "Beta responders", emails: audiences?.beta ?? [] },
    { id: "newsletter", label: "Newsletter", hint: "Newsletter sign-ups", emails: audiences?.newsletter ?? [] },
  ].filter((a) => a.emails.length > 0);

  const selectAudience = (opt: { label: string; emails: string[] }) => {
    setSegment("choose");
    setChosen(new Set(opt.emails));
    setPickerQuery("");
    setSegmentTarget(opt.label);
  };

  const pickTemplate = (t: GalleryTemplate) => {
    setTemplateId(t.id);
    setSubject((s) => s || t.subject);
    setRawHtml(t.html);
  };

  // Vercel's edge DDoS/bot firewall can answer with an HTML "Security
  // Checkpoint" challenge instead of our JSON API response, and a fetch() can't
  // solve it. Any non-JSON reply from these JSON-only APIs means we were
  // intercepted at the edge; tell the user to reload (a full page load clears
  // the challenge) rather than showing a bare failure.
  const isSecurityCheckpoint = (res: Response) =>
    !(res.headers.get("content-type") || "").includes("application/json");
  const checkpointInfo = {
    title: "Security check interrupted",
    message:
      "Vercel’s firewall briefly challenged this request — usually a short traffic spike. Reload this page, then try again; a full page load clears the check.",
    ok: false,
  };

  // Uploads an image and returns its public URL (or null on failure). Each
  // editor decides what to do with the URL.
  const uploadImage = async (file: File): Promise<string | null> => {
    setBusy("image");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      if (isSecurityCheckpoint(res)) {
        setInfo(checkpointInfo);
        return null;
      }
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

  // Uploads a PDF and adds it to the email's attachments.
  const attachPdf = async (file: File) => {
    setBusy("pdf");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      if (isSecurityCheckpoint(res)) {
        setInfo(checkpointInfo);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInfo({ title: "PDF upload failed", message: data.error || "Try again.", ok: false });
        return;
      }
      setAttachments((a) => [...a, { filename: file.name, url: data.url as string }].slice(0, 5));
    } finally {
      setBusy(null);
      if (pdfRef.current) pdfRef.current.value = "";
    }
  };

  // Upload a video for Write mode → its hosted URL becomes the button link.
  const handleWriteVideo = async (file: File) => {
    const url = await uploadImage(file);
    if (url) setVideoHref(url);
    if (writeVideoRef.current) writeVideoRef.current.value = "";
  };

  const validate = (): string | null => {
    if (!subject.trim()) return "Add a subject line.";
    if (mode === "write" && !hasBodyContent(bodyHtml)) return "Add a message or an image.";
    if (mode === "html" && !rawHtml.trim()) return "Add some HTML content.";
    return null;
  };

  const doSubmit = async (which: "save" | "send") => {
    setBusy(which);
    try {
      const create = await fetch("/api/admin/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), html, attachments }),
      });
      // Edge firewall challenge: bail with a clear message before trying to
      // read JSON that isn't there.
      if (isSecurityCheckpoint(create)) {
        setConfirm(null);
        setInfo(checkpointInfo);
        return;
      }
      const cData = await create.json().catch(() => ({}));
      if (!create.ok) {
        setConfirm(null);
        setInfo({ title: "Could not save", message: cData.error || "Try again.", ok: false });
        return;
      }
      if (which === "save") {
        router.push("/marketing/newsletters");
        router.refresh();
        return;
      }
      const sendRes = await fetch(`/api/admin/newsletters/${cData.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(chosen.size > 0 ? { emails: [...chosen] } : { segment }),
          allowResend,
        }),
      });
      // Draft is already saved at this point; only the send got challenged.
      if (isSecurityCheckpoint(sendRes)) {
        setConfirm(null);
        setInfo({
          ...checkpointInfo,
          message:
            "The draft was saved, but Vercel’s firewall challenged the send. Reload this page, then send it from the newsletters list.",
        });
        return;
      }
      const sData = await sendRes.json().catch(() => ({}));
      setConfirm(null);
      if (!sendRes.ok) {
        setInfo({ title: "Sending failed", message: sData.error || "Saved as draft, but not sent.", ok: false });
        return;
      }
      // Nothing new queued (everyone was already sent) — no fake progress modal.
      if (sData.noop || (sData.queued ?? 0) === 0) {
        setInfo({
          title: "Nothing new to send",
          message: sData.message || "Everyone in this audience was already sent this newsletter.",
          ok: true,
        });
        return;
      }
      // Open the live progress modal, which drives the send batch by batch.
      setProgress({ id: cData.id as string, total: sData.queued ?? 0 });
    } catch {
      // Network drop, aborted request, or other unexpected failure.
      setConfirm(null);
      setInfo({
        title: "Something went wrong",
        message: "Check your connection and try again.",
        ok: false,
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
            {segment === "choose"
              ? ""
              : chosen.size > 0
              ? ` (a selection from ${seg.label.toLowerCase()})`
              : ` (${seg.label.toLowerCase()})`}
            . This cannot be undone.
          </p>
          {chosen.size > 0 ? (
            <div className="max-h-52 overflow-y-auto rounded-lg border border-bg/12 bg-bg/4 p-2">
              {chosenAll.map((p) => (
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
              setRawHtml(buildRichEmail({ bodyHtml, subject, ctaLabel, ctaHref }));
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
            <div className="flex flex-col gap-4">
              <RichEmailEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                uploadImage={uploadImage}
                uploading={busy === "image"}
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
                    className={INPUT}
                  />
                  <input
                    value={ctaHref}
                    onChange={(e) => setCtaHref(e.target.value)}
                    placeholder="https://klario.finance"
                    className={INPUT}
                  />
                </div>
              </details>

              <details className="rounded-xl border border-bg/10 bg-bg/4 px-4 py-3">
                <summary className="cursor-pointer text-[12px] font-medium uppercase tracking-[0.14em] text-bg/45">
                  Add a video button (optional)
                </summary>
                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => writeVideoRef.current?.click()}
                      disabled={busy === "image" || !configured}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-bg/15 px-3 py-1.5 text-[12px] text-bg/80 hover:border-gold/50 hover:text-bg disabled:opacity-40"
                    >
                      <Video size={12} />
                      {busy === "image" ? "Uploading…" : "Upload a video"}
                    </button>
                    <span className="text-[11px] text-bg/45">
                      or paste a YouTube / video link
                    </span>
                  </div>
                  <input
                    ref={writeVideoRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleWriteVideo(f);
                    }}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={videoText}
                      onChange={(e) => setVideoText(e.target.value)}
                      placeholder="Button text (▶ Watch the video)"
                      className={INPUT}
                    />
                    <input
                      value={videoHref}
                      onChange={(e) => setVideoHref(e.target.value)}
                      placeholder="https://youtu.be/… or hosted video URL"
                      className={INPUT}
                    />
                  </div>
                </div>
              </details>
            </div>
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

          {/* PDF attachments */}
          <div className="flex flex-col gap-2 rounded-xl border border-bg/12 bg-bg/4 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
                Attachments (PDF)
              </span>
              <button
                type="button"
                onClick={() => pdfRef.current?.click()}
                disabled={busy === "pdf" || !configured || attachments.length >= 5}
                className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-2.5 py-1 text-[11px] text-bg/75 hover:border-gold/50 hover:text-bg disabled:opacity-40"
              >
                <FileText size={12} />
                {busy === "pdf" ? "Uploading..." : "Attach PDF"}
              </button>
            </div>
            <input
              ref={pdfRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) attachPdf(f);
              }}
            />
            {attachments.length === 0 ? (
              <span className="text-[12px] text-bg/45">
                Attach a PDF to send with the email (max 5, 15&nbsp;MB each).
              </span>
            ) : (
              <div className="flex flex-col gap-1.5">
                {attachments.map((a, i) => (
                  <div
                    key={a.url}
                    className="flex items-center justify-between gap-2 rounded-lg border border-bg/10 bg-bg/[0.03] px-3 py-2"
                  >
                    <span className="flex items-center gap-2 truncate text-[13px] text-bg/85">
                      <FileText size={13} className="shrink-0 text-gold" />
                      <span className="truncate">{a.filename}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                      aria-label={`Remove ${a.filename}`}
                      className="shrink-0 text-bg/50 hover:text-red-300"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audience */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setSendToOpen((v) => !v)}
              className="flex items-center justify-between gap-2 text-left"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
                Send to
                {!sendToOpen && (
                  <span className="ml-1.5 normal-case tracking-normal text-bg/70">
                    · {SEGMENTS.find((s) => s.id === segment)?.label ?? "All"} ({audienceCount})
                  </span>
                )}
              </span>
              <ChevronDown
                size={15}
                className={"shrink-0 text-bg/40 transition-transform " + (sendToOpen ? "" : "-rotate-90")}
              />
            </button>
            {sendToOpen && (
              <>
            {segmentTarget && (
              <div className="rounded-xl border border-gold/30 bg-gold/8 px-3 py-2 text-[12px] text-gold">
                Targeting segment{" "}
                <span className="font-semibold">{segmentTarget}</span> ·{" "}
                {chosen.size} recipient{chosen.size === 1 ? "" : "s"} preselected.
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {SEGMENTS.map((s) => {
                const active = segment === s.id;
                const count = s.id === "choose" ? chosen.size : counts[s.id];
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => changeSegment(s.id)}
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

            {audienceOptions.length > 0 && (
              <div className="mt-1 flex flex-col gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-bg/35">
                  Or a group
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {audienceOptions.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => selectAudience(a)}
                      className={
                        "rounded-xl border p-3 text-left transition-colors " +
                        (segmentTarget === a.label
                          ? "border-gold/60 bg-gold/5"
                          : "border-bg/10 bg-bg/4 hover:border-bg/25")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-bg">{a.label}</span>
                        <span className="rounded-full bg-bg/10 px-1.5 text-[11px] text-bg/70">
                          {a.emails.length}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-bg/50">{a.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-bg/45">
              {chosen.size > 0
                ? `Sending to a selection of ${chosen.size} of ${segmentTotal}.`
                : segment === "choose"
                ? "Pick recipients below, or use First / Last / Random."
                : `Sending to all ${segmentTotal}. Refine below if you want a subset.`}
            </p>

            {/* Pacing: send the whole audience in sequential batches (first N,
                then the next N…) rather than all at once — gentler on
                deliverability and easy to watch. */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-bg/12 bg-bg/4 px-3 py-2.5 text-[12px] text-bg/60">
              <span>Send in batches of</span>
              <input
                type="number"
                min={1}
                max={500}
                value={batchSize}
                onChange={(e) =>
                  setBatchSize(
                    Math.max(1, Math.min(500, Number(e.target.value) || 1))
                  )
                }
                className="w-16 rounded-lg border border-bg/15 bg-bg/4 px-2 py-1 text-center text-[13px] text-bg focus:border-gold/50 focus:outline-none"
              />
              <span>
                at a time, in order, until everyone is sent
                {(() => {
                  const n = chosen.size > 0 ? chosen.size : segmentTotal;
                  const batches = batchSize > 0 ? Math.ceil(n / batchSize) : 1;
                  return n > 0 && batches > 1 ? ` (~${batches} batches).` : ".";
                })()}
              </span>
            </div>

            {/* Dedup guard: by default we skip anyone who already got THIS
                campaign (any past send), read from Resend — no more 5× repeats. */}
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-bg/12 bg-bg/4 px-3 py-2.5 text-[12px] text-bg/60">
              <input
                type="checkbox"
                checked={allowResend}
                onChange={(e) => setAllowResend(e.target.checked)}
                className="mt-0.5 accent-gold"
              />
              <span>
                <span className="text-bg/80">Send again to people who already got this campaign.</span>{" "}
                Off by default — we skip anyone already sent this subject (checked
                against Resend) so nobody gets it twice. Tick only to re-send on
                purpose.
              </span>
            </label>
            <PeoplePicker
              people={filteredPeople}
              total={segmentPeople.length}
              chosen={chosen}
              query={pickerQuery}
              setQuery={setPickerQuery}
              toggle={togglePerson}
              selectAll={() => setChosen(new Set(filteredPeople.map((p) => p.email)))}
              clearAll={() => setChosen(new Set())}
              count={selectCount}
              setCount={setSelectCount}
              onFirst={selectFirst}
              onLast={selectLast}
              onRandom={selectRandom}
            />

            {/* Type in extra recipients (even if not on the list). */}
            <div className="mt-1 flex flex-col gap-2 rounded-xl border border-bg/12 bg-bg/4 p-3">
              <span className="text-[11px] text-bg/50">
                Or add emails manually (anyone, even if not on the list)
              </span>
              <div className="flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addManual();
                    }
                  }}
                  placeholder="name@example.com, another@example.com"
                  className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-[13px] text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addManual}
                  className="shrink-0 rounded-lg border border-bg/15 px-3 py-2 text-[12px] text-bg/80 hover:border-gold/50 hover:text-bg"
                >
                  Add
                </button>
              </div>
              {manualEmails.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {manualEmails.map((e) => (
                    <span
                      key={e}
                      className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-1 text-[11px] text-bg/85"
                    >
                      {e}
                      <button
                        type="button"
                        onClick={() => removeChosen(e)}
                        aria-label={`Remove ${e}`}
                        className="text-bg/50 hover:text-bg"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
              </>
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

        {/* Preview column — sticks in view while the settings on the left scroll. */}
        <div className="flex flex-col gap-2 lg:sticky lg:top-6 lg:self-start">
          <p className="text-[11px] uppercase tracking-[0.18em] text-bg/45">
            {mode === "write" ? "Live preview" : "Preview (click to edit)"}
          </p>
          <div className="h-[620px] overflow-hidden rounded-2xl border border-bg/10 bg-[#0A0B0D] lg:h-[calc(100vh-8rem)]">
            {mode === "write" ? (
              mounted ? (
                <iframe
                  title="Email preview"
                  srcDoc={html.replace(/\{\{\s*first_name\s*\}\}/g, "Tomiwa")}
                  className="h-full w-full"
                  sandbox=""
                />
              ) : (
                <div className="h-full w-full" />
              )
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
      {progress && (
        <SendProgressModal
          newsletterId={progress.id}
          total={progress.total}
          batchSize={batchSize}
          onClose={() => {
            setProgress(null);
            router.push("/marketing/newsletters");
            router.refresh();
          }}
        />
      )}
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
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLabel, setVideoLabel] = useState("▶ Watch the video");
  const [imgLinkOpen, setImgLinkOpen] = useState(false);
  const [pendingImgUrl, setPendingImgUrl] = useState("");
  const [imgHref, setImgHref] = useState("");

  const insertAtCursor = (tag: string) => {
    const el = textRef.current;
    const start = el?.selectionStart ?? props.rawHtml.length;
    props.setRawHtml(props.rawHtml.slice(0, start) + tag + props.rawHtml.slice(start));
  };

  const insertVideo = () => {
    const url = videoUrl.trim();
    if (!/^https?:\/\//i.test(url)) return;
    insertAtCursor(mediaButtonHtml(url, videoLabel.trim() || "Watch the video"));
    setVideoOpen(false);
    setVideoUrl("");
  };

  // Upload a video file — we host it and use the returned URL as the link.
  const handleVideoUpload = async (file: File) => {
    const url = await props.uploadImage(file);
    if (url) setVideoUrl(url);
    if (videoFileRef.current) videoFileRef.current.value = "";
  };

  // Match the poster template's placeholder image (a placehold.co <img>),
  // optionally wrapped in a link.
  const PLACEHOLDER_ANCHOR = /<a\b[^>]*>\s*<img\b[^>]*placehold\.co[^>]*>\s*<\/a>/i;
  const PLACEHOLDER_IMG = /<img\b[^>]*placehold\.co[^>]*>/i;

  // Upload, then let the user optionally make the image a clickable link.
  const handleFile = async (file: File) => {
    const url = await props.uploadImage(file);
    if (url) {
      setPendingImgUrl(url);
      // Prefill the link from the placeholder's existing href, if any.
      const m = props.rawHtml.match(
        /<a\b[^>]*href=["']([^"']+)["'][^>]*>\s*<img\b[^>]*placehold/i
      );
      setImgHref(m ? m[1] : "");
      setImgLinkOpen(true);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const insertImage = () => {
    const href = imgHref.trim();
    const link = href
      ? /^(https?:|mailto:|\{\{)/i.test(href)
        ? href
        : `https://${href}`
      : "";
    const raw = props.rawHtml;

    // If the poster placeholder is present, REPLACE it in place (full-width,
    // no rounding) instead of inserting a second image.
    if (PLACEHOLDER_ANCHOR.test(raw) || PLACEHOLDER_IMG.test(raw)) {
      const full = `<img src="${pendingImgUrl}" alt="" width="600" style="display:block;width:100%;max-width:100%;height:auto;border:0;" />`;
      const wrapped = link
        ? `<a href="${link}" target="_blank" style="display:block;text-decoration:none;">${full}</a>`
        : full;
      const next = PLACEHOLDER_ANCHOR.test(raw)
        ? raw.replace(PLACEHOLDER_ANCHOR, wrapped)
        : raw.replace(PLACEHOLDER_IMG, wrapped);
      props.setRawHtml(next);
    } else {
      // No placeholder — insert a normal rounded image at the cursor.
      const img = `<img src="${pendingImgUrl}" alt="" style="display:block;max-width:100%;height:auto;border-radius:12px;margin:16px auto;" />`;
      insertAtCursor(link ? `\n<a href="${link}" target="_blank">${img}</a>\n` : `\n${img}\n`);
    }
    setImgLinkOpen(false);
    setPendingImgUrl("");
    setImgHref("");
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">
            HTML content
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={props.uploading || !props.configured}
              className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-2.5 py-1 text-[11px] text-bg/75 hover:border-gold/50 hover:text-bg disabled:opacity-40"
            >
              <ImageIcon size={12} />
              {props.uploading ? "Uploading..." : "Insert image"}
            </button>
            <button
              type="button"
              onClick={() => setVideoOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-bg/15 px-2.5 py-1 text-[11px] text-bg/75 hover:border-gold/50 hover:text-bg"
            >
              <Video size={12} />
              Insert video
            </button>
          </div>
        </div>
        {videoOpen && (
          <div className="flex flex-col gap-2 rounded-xl border border-gold/25 bg-gold/[0.05] p-3">
            <span className="text-[12px] text-bg/70">
              Inserts a button that opens the video. Upload a file (we host it and
              link it) or paste a YouTube / video link.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => videoFileRef.current?.click()}
                disabled={props.uploading || !props.configured}
                className="inline-flex items-center gap-1.5 rounded-lg border border-bg/15 px-3 py-1.5 text-[12px] text-bg/80 hover:border-gold/50 hover:text-bg disabled:opacity-40"
              >
                <Video size={12} />
                {props.uploading ? "Uploading…" : "Upload a video"}
              </button>
              <span className="text-[11px] text-bg/45">or paste a link below</span>
            </div>
            <input
              ref={videoFileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleVideoUpload(f);
              }}
            />
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/… or a hosted video URL"
              className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-[13px] text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none"
            />
            <input
              value={videoLabel}
              onChange={(e) => setVideoLabel(e.target.value)}
              placeholder="Button label"
              className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-[13px] text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={insertVideo}
                disabled={!/^https?:\/\//i.test(videoUrl.trim())}
                className="rounded-lg bg-gold px-3 py-1.5 text-[12px] font-semibold text-ink disabled:opacity-40"
              >
                Insert button
              </button>
              <button
                type="button"
                onClick={() => setVideoOpen(false)}
                className="rounded-lg border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:text-bg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {imgLinkOpen && (
          <div className="flex flex-col gap-2 rounded-xl border border-gold/25 bg-gold/[0.05] p-3">
            <span className="text-[12px] text-bg/70">
              Make this image clickable? Add a link (optional) — leave blank for a
              plain image.
            </span>
            {pendingImgUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pendingImgUrl}
                alt=""
                className="max-h-28 w-auto self-start rounded-lg border border-bg/10"
              />
            )}
            <input
              value={imgHref}
              onChange={(e) => setImgHref(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && insertImage()}
              placeholder="https://…  (where the image should link to)"
              className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-[13px] text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={insertImage}
                className="rounded-lg bg-gold px-3 py-1.5 text-[12px] font-semibold text-ink"
              >
                {imgHref.trim() ? "Insert linked image" : "Insert image"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setImgLinkOpen(false);
                  setPendingImgUrl("");
                }}
                className="rounded-lg border border-bg/15 px-3 py-1.5 text-[12px] text-bg/70 hover:text-bg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
          <span className="text-bg/70">{"{{unsubscribe_url}}"}</span> are filled per
          recipient. When we have no name, {"{{first_name}}"} becomes{" "}
          <span className="text-bg/70">from Klario</span> (so &quot;Hello{" "}
          {"{{first_name}}"},&quot; reads &quot;Hello from Klario,&quot;).
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
  count,
  setCount,
  onFirst,
  onLast,
  onRandom,
}: {
  people: Person[];
  total: number;
  chosen: Set<string>;
  query: string;
  setQuery: (v: string) => void;
  toggle: (email: string) => void;
  selectAll: () => void;
  clearAll: () => void;
  count: number;
  setCount: (n: number) => void;
  onFirst: () => void;
  onLast: () => void;
  onRandom: () => void;
}) {
  const quickBtn =
    "shrink-0 rounded-lg border border-bg/15 px-2.5 py-1.5 text-[11px] text-bg/75 hover:border-gold/50 hover:text-bg disabled:opacity-40";
  return (
    <div className="mt-1 rounded-xl border border-bg/12 bg-bg/4 p-3">
      {/* Quick select */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-bg/50">Select</span>
        <input
          type="number"
          min={1}
          max={total || 1}
          value={count}
          onChange={(e) => setCount(Math.max(0, Number(e.target.value) || 0))}
          className="w-20 rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-[12px] text-bg focus:border-gold/60 focus:outline-none"
          aria-label="How many to select"
        />
        <button type="button" onClick={onFirst} disabled={total === 0} className={quickBtn}>
          First
        </button>
        <button type="button" onClick={onLast} disabled={total === 0} className={quickBtn}>
          Last
        </button>
        <button type="button" onClick={onRandom} disabled={total === 0} className={quickBtn}>
          Random
        </button>
      </div>
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

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  Smile,
  SquarePlus,
  Loader2,
} from "lucide-react";

const FONTS = [
  { label: "Sans (default)", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Courier", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Verdana, sans-serif" },
];

// execCommand fontSize uses a 1..7 scale; with styleWithCSS on, browsers emit
// keyword font-sizes that render in email.
const SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Medium", value: "4" },
  { label: "Large", value: "5" },
  { label: "X-Large", value: "6" },
  { label: "Huge", value: "7" },
];

// Brand-first palette: Raavon gold + charcoal, Klario green, plus neutrals.
const COLORS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Body grey", value: "#C2C7CF" },
  { label: "Raavon gold", value: "#D4A853" },
  { label: "Klario green", value: "#19C37D" },
  { label: "Ink", value: "#0E1116" },
];

const ICONS = [
  "✅","⭐","🔥","💡","🎯","💳","🧠","📈","📊","🔒","🚀","🎉",
  "👋","💬","📥","📌","⚡","💰","🏦","📱","✨","👀","➡️","✔️",
];

export function RichEmailEditor({
  value,
  onChange,
  uploadImage,
  uploading,
  configured,
}: {
  value: string;
  onChange: (html: string) => void;
  uploadImage: (file: File) => Promise<string | null>;
  uploading: boolean;
  configured: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const selImgRef = useRef<HTMLImageElement | null>(null);
  const [hasSelImg, setHasSelImg] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Seed initial content once; never re-sync from `value` to keep the caret.
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = value || "<p>Write your message...</p>";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0);
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (cmd: string, val?: string) => {
    ref.current?.focus();
    restoreSelection();
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      // older browsers
    }
    document.execCommand(cmd, false, val);
    sync();
  };

  const insertHtmlAtCaret = (htmlStr: string) => {
    ref.current?.focus();
    restoreSelection();
    document.execCommand("insertHTML", false, htmlStr);
    sync();
  };

  const onPickImage = async (file: File) => {
    const url = await uploadImage(file);
    if (url) {
      insertHtmlAtCaret(
        `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:12px;margin:8px 0;" />`
      );
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const styleSelectedImage = (style: Partial<CSSStyleDeclaration>) => {
    const img = selImgRef.current;
    if (!img) return;
    Object.assign(img.style, style);
    sync();
  };

  const sizeSelectedImage = (pct: string) => {
    const img = selImgRef.current;
    if (!img) return;
    img.style.width = pct;
    img.style.height = "auto";
    sync();
  };

  const clearImageSelection = () => {
    ref.current?.querySelectorAll("img.rte-sel").forEach((im) => im.classList.remove("rte-sel"));
    selImgRef.current = null;
    setHasSelImg(false);
  };

  const insertButton = () => {
    // A button is a styled link in its own centered block (own line), so you
    // can place as many as you like and align each one independently.
    insertHtmlAtCaret(
      `<div style="text-align:center;margin:20px 0;"><a href="https://klario.finance" style="display:inline-block;padding:13px 28px;background:#D4A853;color:#0E1116;font-weight:700;text-decoration:none;border-radius:999px;font-family:Helvetica,Arial,sans-serif;">Button text</a></div><p><br/></p>`
    );
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    const label = linkText.trim();
    setLinkOpen(false);
    setLinkUrl("");
    setLinkText("");
    if (!url) return;
    const href = /^(https?:|mailto:|\{\{)/i.test(url) ? url : `https://${url}`;
    if (label) {
      // Tag a labelled link, no need to select text first.
      const escaped = label.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      insertHtmlAtCaret(`<a href="${href}">${escaped}</a>`);
    } else {
      exec("createLink", href);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-bg/15 bg-bg/4 p-1.5">
        <select
          aria-label="Text style"
          onMouseDown={saveSelection}
          onChange={(e) => exec("formatBlock", e.target.value)}
          className="rounded-md border border-bg/15 bg-[#0d0e12] px-2 py-1.5 text-[12px] text-bg"
          defaultValue="p"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          aria-label="Font"
          onMouseDown={saveSelection}
          onChange={(e) => exec("fontName", e.target.value)}
          className="rounded-md border border-bg/15 bg-[#0d0e12] px-2 py-1.5 text-[12px] text-bg"
          defaultValue=""
        >
          <option value="" disabled>
            Font
          </option>
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Size"
          onMouseDown={saveSelection}
          onChange={(e) => exec("fontSize", e.target.value)}
          className="rounded-md border border-bg/15 bg-[#0d0e12] px-2 py-1.5 text-[12px] text-bg"
          defaultValue="3"
        >
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <Divider />
        <TBtn label="Bold" onClick={() => exec("bold")} onDown={saveSelection}>
          <Bold size={15} />
        </TBtn>
        <TBtn label="Italic" onClick={() => exec("italic")} onDown={saveSelection}>
          <Italic size={15} />
        </TBtn>
        <TBtn label="Underline" onClick={() => exec("underline")} onDown={saveSelection}>
          <Underline size={15} />
        </TBtn>

        <Divider />
        {/* Color swatches */}
        <div className="flex items-center gap-1" onMouseDown={saveSelection}>
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              aria-label={c.label}
              onClick={() => exec("foreColor", c.value)}
              className="h-5 w-5 rounded-full border border-bg/20"
              style={{ background: c.value }}
            />
          ))}
        </div>

        <Divider />
        <TBtn label="Align left" onClick={() => exec("justifyLeft")} onDown={saveSelection}>
          <AlignLeft size={15} />
        </TBtn>
        <TBtn label="Align center" onClick={() => exec("justifyCenter")} onDown={saveSelection}>
          <AlignCenter size={15} />
        </TBtn>
        <TBtn label="Align right" onClick={() => exec("justifyRight")} onDown={saveSelection}>
          <AlignRight size={15} />
        </TBtn>

        <Divider />
        <TBtn label="Bulleted list" onClick={() => exec("insertUnorderedList")} onDown={saveSelection}>
          <List size={15} />
        </TBtn>
        <TBtn label="Numbered list" onClick={() => exec("insertOrderedList")} onDown={saveSelection}>
          <ListOrdered size={15} />
        </TBtn>

        <Divider />
        <TBtn
          label="Link"
          onClick={() => {
            saveSelection();
            setLinkOpen((v) => !v);
          }}
          onDown={saveSelection}
        >
          <Link2 size={15} />
        </TBtn>
        <TBtn
          label="Insert image"
          disabled={uploading || !configured}
          onClick={() => {
            saveSelection();
            fileRef.current?.click();
          }}
          onDown={saveSelection}
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
        </TBtn>
        <TBtn
          label="Insert button"
          onClick={insertButton}
          onDown={saveSelection}
        >
          <SquarePlus size={15} />
        </TBtn>
        <div className="relative">
          <TBtn
            label="Insert icon"
            onClick={() => {
              saveSelection();
              setShowIcons((v) => !v);
            }}
            onDown={saveSelection}
          >
            <Smile size={15} />
          </TBtn>
          {showIcons && (
            <div className="absolute right-0 top-9 z-20 grid w-56 grid-cols-8 gap-1 rounded-xl border border-bg/15 bg-[#0d0e12] p-2 shadow-2xl">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => {
                    insertHtmlAtCaret(ic);
                    setShowIcons(false);
                  }}
                  className="rounded-md p-1 text-lg hover:bg-bg/10"
                >
                  {ic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-bg/15 bg-bg/4 p-2">
          <input
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
            placeholder="Link text (or select text first)"
            className="min-w-[140px] flex-1 rounded-lg border border-bg/15 bg-[#0d0e12] px-3 py-1.5 text-[13px] text-bg placeholder:text-bg/40 focus:outline-none"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
            placeholder="https://example.com"
            className="min-w-[160px] flex-1 rounded-lg border border-bg/15 bg-[#0d0e12] px-3 py-1.5 text-[13px] text-bg placeholder:text-bg/40 focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-lg bg-gold px-3 py-1.5 text-[13px] font-medium text-ink"
          >
            Apply
          </button>
        </div>
      )}

      {/* Image controls (appear when an image is clicked) */}
      {hasSelImg && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gold/40 bg-gold/5 p-2 text-[12px] text-bg/80">
          <span className="font-medium text-bg">Selected image:</span>
          <Pill onClick={() => styleSelectedImage({ display: "block", float: "none", margin: "12px 0" })}>
            Block
          </Pill>
          <Pill onClick={() => styleSelectedImage({ display: "block", float: "none", margin: "12px auto" })}>
            Center
          </Pill>
          <Pill onClick={() => styleSelectedImage({ float: "left", margin: "4px 16px 8px 0" })}>
            Wrap left
          </Pill>
          <Pill onClick={() => styleSelectedImage({ float: "right", margin: "4px 0 8px 16px" })}>
            Wrap right
          </Pill>
          <Pill onClick={() => styleSelectedImage({ display: "inline", float: "none", verticalAlign: "middle", margin: "0 4px" })}>
            Inline
          </Pill>
          <span className="ml-1 text-bg/45">Size:</span>
          <Pill onClick={() => sizeSelectedImage("25%")}>25%</Pill>
          <Pill onClick={() => sizeSelectedImage("50%")}>50%</Pill>
          <Pill onClick={() => sizeSelectedImage("100%")}>Full</Pill>
          <Pill onClick={clearImageSelection}>Done</Pill>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPickImage(f);
        }}
      />

      {/* The editable surface, styled like the email body. */}
      <style>{`
        .rte:empty:before{ content:"Write your message..."; color:#6F757F; }
        .rte:focus{ outline:none; }
        .rte h1{ font-size:28px;line-height:1.2;font-weight:800;color:#fff;margin:0 0 16px; }
        .rte h2{ font-size:21px;line-height:1.3;font-weight:700;color:#fff;margin:0 0 12px; }
        .rte h3{ font-size:17px;font-weight:700;color:#fff;margin:0 0 10px; }
        .rte p{ margin:0 0 16px; }
        .rte ul,.rte ol{ margin:0 0 16px;padding-left:22px; }
        .rte a{ color:#D4A853;text-decoration:underline; }
        .rte img{ max-width:100%;height:auto;border-radius:12px;cursor:pointer; }
        .rte img.rte-sel{ outline:2px solid #D4A853;outline-offset:2px; }
      `}</style>
      <div
        ref={ref}
        className="rte min-h-[360px] rounded-xl border border-bg/15 bg-[#16181D] px-5 py-4 text-[16px] leading-relaxed text-[#C2C7CF] focus:border-gold/50"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={saveSelection}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onClick={(e) => {
          const t = e.target as HTMLElement;
          ref.current?.querySelectorAll("img.rte-sel").forEach((im) => im.classList.remove("rte-sel"));
          if (t.tagName === "IMG") {
            t.classList.add("rte-sel");
            selImgRef.current = t as HTMLImageElement;
            setHasSelImg(true);
          } else {
            selImgRef.current = null;
            setHasSelImg(false);
          }
        }}
      />
      <p className="text-[11px] text-bg/45">
        Tip: use <span className="text-bg/70">{"{{first_name}}"}</span> anywhere to
        greet each person by name. Click an image to position or resize it.
      </p>
    </div>
  );
}

function TBtn({
  children,
  label,
  onClick,
  onDown,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  onDown?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onDown?.();
      }}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-bg/75 hover:bg-bg/10 hover:text-bg disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Pill({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-bg/20 px-2.5 py-1 text-[12px] text-bg/80 hover:border-gold/50 hover:text-bg"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-bg/15" />;
}

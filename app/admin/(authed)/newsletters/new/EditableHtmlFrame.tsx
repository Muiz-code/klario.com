"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Link2,
  Unlink,
  SquarePlus,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

/**
 * A visual, click-to-edit preview of raw email HTML, synced two-way with the
 * code textarea in the parent. The iframe is put in designMode so the whole
 * document is editable. A small toolbar lets you add links / buttons by
 * selecting text in the preview (no need to hand-edit the HTML). Merge tags
 * ({{first_name}}, {{unsubscribe_url}}) are shown literally so editing
 * round-trips cleanly back to the source.
 */
export function EditableHtmlFrame({
  html,
  onChange,
  className,
}: {
  html: string;
  onChange: (html: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const fromIframe = useRef(false);
  const savedRange = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  useEffect(() => {
    if (fromIframe.current) {
      fromIframe.current = false;
      return;
    }
    const doc = ref.current?.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(html || "<!DOCTYPE html><html><body></body></html>");
    doc.close();
    try {
      doc.designMode = "on";
    } catch {
      // some browsers need the doc parsed first
    }

    const serialize = () => {
      fromIframe.current = true;
      onChange("<!DOCTYPE html>\n" + doc.documentElement.outerHTML);
    };
    const saveSel = () => {
      const sel = doc.getSelection();
      if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0);
    };

    doc.addEventListener("input", serialize);
    doc.addEventListener("mouseup", saveSel);
    doc.addEventListener("keyup", saveSel);
    return () => {
      doc.removeEventListener("input", serialize);
      doc.removeEventListener("mouseup", saveSel);
      doc.removeEventListener("keyup", saveSel);
    };
  }, [html, onChange]);

  const doc = () => ref.current?.contentDocument ?? null;

  const restore = (d: Document) => {
    // Focus the iframe first, otherwise execCommand/insertHTML ignore the
    // caret and fall back to the document start/end (the "always at the
    // bottom" bug). Then re-apply the caret position we saved on last edit.
    ref.current?.contentWindow?.focus();
    if (!savedRange.current) return;
    const sel = d.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange.current);
  };

  const serializeNow = () => {
    const d = doc();
    if (!d) return;
    fromIframe.current = true;
    onChange("<!DOCTYPE html>\n" + d.documentElement.outerHTML);
  };

  const exec = (cmd: string, val?: string) => {
    const d = doc();
    if (!d) return;
    restore(d);
    try {
      d.execCommand("styleWithCSS", false, "true");
    } catch {
      // older browsers
    }
    d.execCommand(cmd, false, val);
    serializeNow();
  };

  // Sets a URL on the current selection: edits an existing link/button if the
  // caret is inside one, otherwise links the selected text.
  const applyLink = () => {
    const raw = linkUrl.trim();
    const label = linkText.trim();
    setLinkOpen(false);
    setLinkUrl("");
    setLinkText("");
    const d = doc();
    if (!d || !raw) return;
    const href = /^(https?:|mailto:|\{\{)/i.test(raw) ? raw : `https://${raw}`;
    const escaped = label.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    restore(d);
    const sel = d.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.getRangeAt(0).startContainer;
    let anchor: HTMLAnchorElement | null = null;
    while (node && node !== d.body) {
      if ((node as HTMLElement).tagName === "A") {
        anchor = node as HTMLAnchorElement;
        break;
      }
      node = node.parentNode;
    }
    if (anchor) {
      // Editing an existing link / button: update its URL (and label if given).
      anchor.setAttribute("href", href);
      if (label) anchor.textContent = label;
    } else if (label) {
      // Insert a labelled link, so you tag text instead of pasting a raw URL.
      d.execCommand("insertHTML", false, `<a href="${href}">${escaped}</a>`);
    } else if (!sel.isCollapsed) {
      // Link the text the user selected.
      d.execCommand("createLink", false, href);
    } else {
      d.execCommand("insertHTML", false, `<a href="${href}">${href}</a>`);
    }
    serializeNow();
  };

  const insertButton = () => {
    const d = doc();
    if (!d) return;
    restore(d);
    // Insert the button in its own centered block (own line), so it can be
    // aligned independently of the surrounding text. A trailing paragraph
    // gives you somewhere to keep typing below it.
    d.execCommand(
      "insertHTML",
      false,
      `<div style="text-align:center;margin:20px 0;"><a href="https://klario.finance" style="display:inline-block;padding:14px 30px;background:#D4A853;color:#0E1116;font-weight:700;text-decoration:none;border-radius:999px;font-family:Helvetica,Arial,sans-serif;">Button text</a></div><p><br/></p>`
    );
    serializeNow();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 bg-[#f3f2ee] p-1.5">
        <FBtn label="Bold" onClick={() => exec("bold")}>
          <Bold size={14} />
        </FBtn>
        <FBtn label="Italic" onClick={() => exec("italic")}>
          <Italic size={14} />
        </FBtn>
        <FBtn label="Add or edit link" onClick={() => setLinkOpen((v) => !v)}>
          <Link2 size={14} />
        </FBtn>
        <FBtn label="Remove link" onClick={() => exec("unlink")}>
          <Unlink size={14} />
        </FBtn>
        <FBtn label="Insert button" onClick={insertButton}>
          <SquarePlus size={14} />
          <span className="ml-1 text-[12px]">Button</span>
        </FBtn>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <FBtn label="Align left" onClick={() => exec("justifyLeft")}>
          <AlignLeft size={14} />
        </FBtn>
        <FBtn label="Align center" onClick={() => exec("justifyCenter")}>
          <AlignCenter size={14} />
        </FBtn>
        <FBtn label="Align right" onClick={() => exec("justifyRight")}>
          <AlignRight size={14} />
        </FBtn>
        <span className="ml-auto pr-1 text-[11px] text-ink/40">
          Tag a link or click a button, then align it.
        </span>
      </div>

      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 bg-[#f3f2ee] p-2">
          <input
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
            placeholder="Link text (e.g. Read more)"
            className="min-w-[140px] flex-1 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-[13px] text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
            placeholder="https://klario.finance"
            autoFocus
            className="min-w-[160px] flex-1 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-[13px] text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyLink}
            className="rounded-lg bg-ink px-3 py-1.5 text-[13px] font-medium text-white"
          >
            Apply
          </button>
        </div>
      )}

      <iframe
        ref={ref}
        title="Editable email preview"
        className={"flex-1 " + (className ?? "")}
      />
    </div>
  );
}

function FBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()} // keep the iframe selection
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md px-2 py-1.5 text-ink/70 hover:bg-ink/10 hover:text-ink"
    >
      {children}
    </button>
  );
}

"use client";

import { useEffect, useRef } from "react";

/**
 * A visual, click-to-edit preview of raw email HTML, synced two-way with the
 * code textarea in the parent. The iframe is put in designMode so the whole
 * document is editable without polluting the markup with contenteditable
 * attributes. Merge tags ({{first_name}}, {{unsubscribe_url}}) are shown
 * literally so editing round-trips cleanly back to the source.
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
  // True when the most recent change came from inside the iframe, so the sync
  // effect skips rewriting the document and the caret is preserved.
  const fromIframe = useRef(false);

  useEffect(() => {
    if (fromIframe.current) {
      fromIframe.current = false;
      return;
    }
    const iframe = ref.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(html || "<!DOCTYPE html><html><body></body></html>");
    doc.close();

    try {
      doc.designMode = "on";
    } catch {
      // ignore: some browsers need the doc fully parsed first
    }

    const handleInput = () => {
      fromIframe.current = true;
      onChange("<!DOCTYPE html>\n" + doc.documentElement.outerHTML);
    };
    doc.addEventListener("input", handleInput);
    return () => doc.removeEventListener("input", handleInput);
  }, [html, onChange]);

  return (
    <iframe
      ref={ref}
      title="Editable email preview"
      className={className}
    />
  );
}

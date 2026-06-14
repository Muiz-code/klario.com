"use client";

import { useEffect, useRef } from "react";

/**
 * A WYSIWYG preview of the branded email for "Write" mode. The heading and body
 * are edited in place (contentEditable) and synced back to state, which is what
 * buildEmailHtml() turns into the sent HTML. The image, button, header, and
 * footer mirror the real email so the admin sees exactly what recipients get.
 */
export function EditablePreview({
  heading,
  body,
  ctaLabel,
  ctaHref,
  images,
  setHeading,
  setBody,
}: {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  images: string[];
  setHeading: (v: string) => void;
  setBody: (v: string) => void;
}) {
  return (
    <div style={{ background: "#ECEAE3", padding: "24px 12px", overflowY: "auto" }}>
      <style>{`
        .klario-edit:empty:before{ content: attr(data-ph); color:#9AA0A8; }
        .klario-edit:focus{ outline: 2px solid rgba(25,195,125,0.5); outline-offset: 2px; border-radius: 4px; }
        .klario-edit{ cursor: text; }
      `}</style>
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(14,17,22,0.10)",
          fontFamily: "'Segoe UI',Helvetica,Arial,sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ background: "#0E1116", padding: "22px 40px" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
            Klario<span style={{ color: "#19C37D" }}>.</span>
          </span>
        </div>

        {images.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url + i}
            src={url}
            alt=""
            style={{
              display: "block",
              width: "calc(100% - 80px)",
              margin: "0 40px 12px",
              height: "auto",
              borderRadius: 14,
            }}
          />
        ))}

        {/* Body */}
        <div style={{ padding: 40 }}>
          <Editable
            tag="h1"
            value={heading}
            onChange={setHeading}
            placeholder="Add a heading (optional)"
            style={{
              margin: "0 0 16px",
              fontSize: 28,
              lineHeight: "34px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#0E1116",
            }}
          />
          <Editable
            tag="div"
            value={body}
            onChange={setBody}
            multiline
            placeholder="Click here and write your message. Press Enter for new lines."
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: "26px",
              color: "#4A5159",
              whiteSpace: "pre-wrap",
            }}
          />
          {ctaLabel && ctaHref ? (
            <div style={{ marginTop: 20 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "14px 30px",
                  background: "#19C37D",
                  color: "#0E1116",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 12,
                }}
              >
                {ctaLabel} →
              </span>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            background: "#0E1116",
            padding: "20px 40px",
            fontSize: 12,
            lineHeight: "18px",
            color: "#7E8794",
          }}
        >
          Klario by Raavon Limited (RC 9537604), Lagos, Nigeria.
          <br />
          <span style={{ color: "#19C37D", textDecoration: "underline" }}>
            Unsubscribe
          </span>
        </div>
      </div>
    </div>
  );
}

function Editable({
  tag,
  value,
  onChange,
  placeholder,
  style,
  multiline = false,
}: {
  tag: "h1" | "div";
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  style: React.CSSProperties;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  // Set the initial text once. We intentionally do not re-sync from `value`
  // on every render, which would reset the caret while typing.
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Tag = tag;
  return (
    <Tag
      // @ts-expect-error ref type varies by tag
      ref={ref}
      className="klario-edit"
      contentEditable
      suppressContentEditableWarning
      data-ph={placeholder}
      style={style}
      onInput={(e: React.FormEvent<HTMLElement>) =>
        onChange((e.currentTarget as HTMLElement).innerText)
      }
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!multiline && e.key === "Enter") e.preventDefault();
      }}
    />
  );
}

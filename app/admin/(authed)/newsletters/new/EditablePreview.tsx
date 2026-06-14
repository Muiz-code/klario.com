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
    <div style={{ background: "#0A0B0D", padding: "24px 12px", overflowY: "auto" }}>
      <style>{`
        .klario-edit:empty:before{ content: attr(data-ph); color:#6F757F; }
        .klario-edit:focus{ outline: 2px solid rgba(212,168,83,0.6); outline-offset: 2px; border-radius: 4px; }
        .klario-edit{ cursor: text; }
      `}</style>
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "#16181D",
          border: "1px solid #272B33",
          borderRadius: 18,
          overflow: "hidden",
          fontFamily: "Helvetica,Arial,sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ background: "#FFFFFF", padding: "24px 32px", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/klarioLogoDark.png"
            alt="Klario"
            style={{ height: 27, width: "auto", display: "inline-block" }}
          />
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
              color: "#FFFFFF",
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
              color: "#C2C7CF",
              whiteSpace: "pre-wrap",
            }}
          />
          {ctaLabel && ctaHref ? (
            <div style={{ marginTop: 20 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "14px 30px",
                  background: "#D4A853",
                  color: "#0E1116",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              >
                {ctaLabel} →
              </span>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ padding: "0 40px" }}>
          <div style={{ height: 1, background: "#272B33" }} />
        </div>
        <div
          style={{
            background: "#16181D",
            padding: "26px 40px 32px",
            textAlign: "center",
            fontSize: 12,
            lineHeight: "20px",
            color: "#7E8794",
          }}
        >
          <p style={{ margin: "0 0 8px" }}>
            <strong style={{ color: "#C2C7CF" }}>Klario Finance</strong> &middot;
            Powered by{" "}
            <span style={{ color: "#D4A853" }}>Raavon Limited</span> &middot;
            RC-9537604
          </p>
          <p style={{ margin: "0 0 14px" }}>
            Klario is not a bank. We are a financial intelligence platform.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            <span style={{ color: "#D4A853", fontWeight: 600 }}>klario.finance</span>
          </p>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>
            <span style={{ textDecoration: "underline" }}>Unsubscribe</span>{" "}
            &middot; <span style={{ textDecoration: "underline" }}>Privacy</span>{" "}
            &middot; <span style={{ textDecoration: "underline" }}>Terms</span>
          </p>
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

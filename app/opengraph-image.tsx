import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(ellipse at top right, rgba(212,168,83,0.18), transparent 60%), #0d0d0e",
          color: "#f0ede6",
          fontFamily: "ui-sans-serif, system-ui, -apple-system",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#00ff87",
              boxShadow: "0 0 16px rgba(0,255,135,0.7)",
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(212,168,83,0.85)",
              display: "flex",
            }}
          >
            AI Personal Finance · Nigeria
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 200,
              fontWeight: 800,
              letterSpacing: -6,
              lineHeight: 0.95,
              display: "flex",
            }}
          >
            <span style={{ color: "#f0ede6" }}>Kla</span>
            <span style={{ color: "#d4a853" }}>rio</span>
            <span style={{ color: "rgba(212,168,83,0.5)" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              fontSize: 44,
              fontWeight: 500,
              color: "rgba(240,237,230,0.85)",
              letterSpacing: -1,
              maxWidth: 1000,
              lineHeight: 1.2,
            }}
          >
            <span>Your money,&nbsp;</span>
            <span style={{ color: "#d4a853", fontStyle: "italic" }}>finally</span>
            <span>&nbsp;in your control.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "rgba(240,237,230,0.55)",
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          <div style={{ display: "flex" }}>
            Connect every bank · Track every naira · Pay every bill
          </div>
          <div style={{ display: "flex", color: "rgba(212,168,83,0.85)" }}>
            klario.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

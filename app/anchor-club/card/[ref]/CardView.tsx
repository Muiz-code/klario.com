"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cardSVGMarkup } from "../../engraving";
import styles from "../../anchor.module.css";

const SUB_LOGO = "/klario-submark.png";
function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function CardView({
  name,
  area,
  institution,
  level,
  cardNo,
  allowDownload,
}: {
  name: string;
  area: string;
  institution: string;
  level: string;
  cardNo: string;
  allowDownload: boolean;
}) {
  const [markHref, setMarkHref] = useState<string | undefined>(undefined);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(SUB_LOGO);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = () => {
          if (alive) setMarkHref(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch {
        /* fall back to vector mark */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPlayed(true);
      return;
    }
    const r = requestAnimationFrame(() => setPlayed(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const data = { name, area, institution, level, cardNo, markHref };

  const download = async () => {
    try {
      const blob = await cardBlob(data);
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "klario-anchor-card.png";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      /* screenshot fallback */
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.wrap}>
        <section className={cx(styles.cardscreen, styles.screen)}>
          <div className={cx(styles.eyebrow, styles.eyebrowCard)}>
            KLARIO ANCHOR CLUB
          </div>
          <div
            className={cx(styles.cardStage, played && styles.play)}
            dangerouslySetInnerHTML={{ __html: cardSVGMarkup(data) }}
          />
          {allowDownload ? (
            <div className={styles.cardActions}>
              <button type="button" className={styles.cta} onClick={download}>
                Download card
              </button>
            </div>
          ) : (
            <p className={styles.refLine}>
              Reference: <strong>{cardNo}</strong>
            </p>
          )}
          <p className={styles.next}>
            {allowDownload
              ? "You're in the founding cohort — download your member card above."
              : "This is your Anchor Club card. If you're selected for the founding cohort, we'll email you a download link."}
          </p>
          <p className={styles.closer}>Build with us, not for us.</p>
          <Link href="/" className={styles.homeLink}>
            Back to Klario
          </Link>
        </section>
      </div>
    </div>
  );
}

// SVG → canvas → PNG. Waits for fonts so the engraved text rasterises correctly.
async function cardBlob(d: {
  name: string;
  area: string;
  institution: string;
  level: string;
  cardNo: string;
  markHref?: string;
}): Promise<Blob | null> {
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  const svg = cardSVGMarkup({ ...d, forExport: true });
  const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = url;
  });
  const scale = 2;
  const W = 1040;
  const H = 640;
  const cv = document.createElement("canvas");
  cv.width = W * scale;
  cv.height = H * scale;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, W, H);
  return await new Promise<Blob | null>((res) => cv.toBlob(res, "image/png"));
}

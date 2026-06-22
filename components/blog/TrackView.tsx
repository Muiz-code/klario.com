"use client";

import { useEffect, useRef } from "react";

/**
 * Records one view for a blog post when it is opened. Fires once per mount and
 * uses sessionStorage to avoid double-counting a refresh within the session.
 * No-ops for posts that aren't admin-authored (the API only counts those).
 */
export function TrackView({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const key = `klario-viewed-${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable; still record the view
    }

    const url = `/api/blog/${encodeURIComponent(slug)}/view`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      fetch(url, { method: "POST", keepalive: true }).catch(() => {});
    }
  }, [slug]);

  return null;
}

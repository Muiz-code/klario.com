"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getSession(): string {
  try {
    let s = localStorage.getItem("klario-sid");
    if (!s) {
      s = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("klario-sid", s);
    }
    return s;
  } catch {
    return "anon";
  }
}

function isAdmin(path: string): boolean {
  return path.startsWith("/p@ss1") || path.startsWith("/admin");
}

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch("/api/track", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // ignore
  }
}

/**
 * First-party analytics: logs a pageview on every route change and a click
 * event for links/buttons. Admin traffic is never tracked.
 */
export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || isAdmin(pathname)) return;
    send({
      type: "pageview",
      path: pathname,
      referrer: document.referrer || null,
      session: getSession(),
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.("a, button");
      if (!el) return;
      if (isAdmin(location.pathname)) return;
      const label = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
      const href = el instanceof HTMLAnchorElement ? el.href : null;
      if (!label && !href) return;
      send({
        type: "click",
        path: location.pathname,
        label: label || null,
        href,
        session: getSession(),
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

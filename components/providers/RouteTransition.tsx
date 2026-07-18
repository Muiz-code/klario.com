"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/Loader";

// Friendly names for the "Opening ..." message.
const NAMES: Record<string, string> = {
  investors: "Investors",
  blog: "Blog",
  beta: "the Beta",
  privacy: "Privacy",
  terms: "Terms",
  cookies: "Cookies",
  "delete-account": "Account Deletion",
  "data-protection": "Data Protection",
  "anti-fraud": "Anti-Fraud",
  compliance: "Compliance",
};

function pageName(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  if (NAMES[seg]) return NAMES[seg];
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Global page-transition overlay. On first load and on every client navigation
 * it plays the reveal with a contextual line:
 *   - landing reload  -> "Welcome to Klario"
 *   - going to a page -> "Opening <Page>"
 *   - back to home    -> "Going home"
 * Admin routes are skipped. The overlay is rendered whenever the current path
 * differs from the last-revealed one, so it covers the new page in the same
 * commit as the navigation (no flash).
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [hasRevealedOnce, setHasRevealedOnce] = useState(false);

  const isAdmin = pathname.startsWith("/admin");
  const needsOverlay = !isAdmin && revealed !== pathname;

  const isInitial = !hasRevealedOnce;
  const home = pathname === "/";
  const intro = home && isInitial ? "Connect · Track · Understand" : undefined;
  const message = home
    ? isInitial
      ? "Welcome to Klario"
      : "Going home"
    : `Opening ${pageName(pathname)}`;
  // Full splash only for the landing page's first load; everything else is quick.
  const quick = !(home && isInitial);

  useEffect(() => {
    document.documentElement.style.overflow = needsOverlay ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [needsOverlay]);

  const handleFinished = () => {
    setRevealed(pathname);
    setHasRevealedOnce(true);
  };

  return (
    <>
      {children}
      {needsOverlay && (
        <Loader
          key={pathname}
          intro={intro}
          message={message}
          logo={home && isInitial}
          quick={quick}
          onFinished={handleFinished}
        />
      )}
    </>
  );
}

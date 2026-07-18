"use client";

import { useEffect } from "react";
import { NewsletterPopup } from "@/components/ui/NewsletterPopup";

// The page-load / route reveal is handled globally by RouteTransition (in the
// root layout). AppShell just restores scroll on the landing page and mounts
// the newsletter popup.
export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      {children}
      <NewsletterPopup />
    </>
  );
}

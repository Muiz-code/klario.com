"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { exportInvestorDeck } from "@/lib/investors/investorDeck";

/**
 * Downloads the investor brief as a branded PowerPoint (.pptx), generated in the
 * browser from the same INVESTORS data the page renders. Styled like Button and
 * hidden from the page's own print-to-PDF output via .no-print.
 */
export function DownloadDeckButton({
  children,
  variant = "outline",
  size,
  className,
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("no-print", className)}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await exportInvestorDeck();
        } catch (err) {
          console.error("[investor-deck] export failed", err);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Preparing..." : children}
    </Button>
  );
}

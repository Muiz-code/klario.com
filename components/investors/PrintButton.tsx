"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Renders the whole current page as a PDF via the browser's print dialog
 * ("Save as PDF"). Styled exactly like Button; hidden from the printed output
 * itself via .no-print.
 */
export function PrintButton({
  children,
  variant,
  size,
  className,
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("no-print", className)}
      onClick={() => window.print()}
    >
      {children}
    </Button>
  );
}

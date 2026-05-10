import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Klario home"
      className={cn(
        "font-display inline-flex items-baseline text-xl tracking-tight md:text-2xl",
        className
      )}
    >
      <span className={onDark ? "text-bg" : "text-ink"}>Kla</span>
      <span className="text-gold">rio</span>
      <span className="text-gold/40">.</span>
    </Link>
  );
}

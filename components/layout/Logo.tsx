import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import wordmark from "@/public/Klario-primary-and-secondary-Logo.png";

export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  // Single engraved-bronze wordmark reads on both light and dark surfaces;
  // onDark is kept for API compatibility with existing callers.
  void onDark;
  return (
    <Link
      href="/"
      aria-label="Klario home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src={wordmark}
        alt="Klario"
        priority
        sizes="(min-width: 768px) 128px, 104px"
        className="h-6 w-auto md:h-7"
      />
    </Link>
  );
}

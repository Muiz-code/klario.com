import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import logoDark from "@/public/brand/logo-dark.png";
import logoLight from "@/public/brand/logo-light.png";

export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  // The new logo (Oct 2026) has fixed ink: cream on dark sections,
  // mahogany on the site's light pages.
  const wordmark = onDark ? logoDark : logoLight;
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

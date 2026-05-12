import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import lightWordmark from "@/public/klarioLogoLight.png";
import darkWordmark from "@/public/klarioLogoDark.png";

export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const src = onDark ? lightWordmark : darkWordmark;
  return (
    <Link
      href="/"
      aria-label="Klario home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src={src}
        alt="Klario"
        priority
        sizes="(min-width: 768px) 140px, 112px"
        className="h-7 w-auto md:h-8"
      />
    </Link>
  );
}

import { cn } from "@/lib/utils";

/**
 * The split-coin "o" from the Klario wordmark: a disc halved and pushed
 * apart, drawn to the logo's proportions. Takes its colour from `fill-*`
 * (gold-hi by default) and its size from the width you give it.
 */
export function CoinMark({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 375 344" aria-hidden className={cn("h-auto fill-gold-hi", className)} {...rest}>
      <path d="M172 0 A172 172 0 0 0 172 344 Z" />
      <path d="M203 0 A172 172 0 0 1 203 344 Z" />
    </svg>
  );
}

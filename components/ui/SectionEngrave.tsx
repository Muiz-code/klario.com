import { GuillocheRosette } from "./Engraving";
import { cn } from "@/lib/utils";

type Corner = "tr" | "bl" | "br" | "tl";
type Size = "sm" | "md" | "lg" | "xl";

const CORNERS: Record<Corner, string> = {
  tr: "right-[-6%] top-[-8%]",
  bl: "left-[-7%] bottom-[-8%]",
  br: "right-[-7%] bottom-[-8%]",
  tl: "left-[-6%] top-[-8%]",
};

const SIZES: Record<Size, string> = {
  sm: "h-[46vh]",
  md: "h-[62vh]",
  lg: "h-[80vh]",
  xl: "h-[96vh]",
};

/**
 * A slow-rotating guilloche rosette pinned behind a section. It stays FIXED in
 * the viewport for the whole length of the section, which matters for the tall
 * scroll-stack sections: an absolutely-placed rosette there sits at the top or
 * bottom of the giant section and scrolls away with the cards. The `sticky h-0`
 * wrapper pins it without taking layout space; the inner clip box self-clips, so
 * it never causes page overflow and never breaks sticky/stacked descendants.
 * Render as the FIRST child of a `relative` section; keep content at z-10.
 */
export function SectionEngrave({
  tone = "light",
  position = "tr",
  size = "md",
  reverse = false,
  className,
}: {
  tone?: "light" | "dark";
  position?: Corner;
  size?: Size;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden className="pointer-events-none sticky top-0 z-0 h-0">
      <div className="absolute left-0 top-0 h-screen w-full overflow-hidden">
        <GuillocheRosette
          reverse={reverse}
          className={cn(
            "absolute w-auto",
            CORNERS[position],
            SIZES[size],
            tone === "dark" ? "opacity-[0.11]" : "opacity-[0.08]",
            className
          )}
        />
      </div>
    </div>
  );
}

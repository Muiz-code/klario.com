import {
  Wallet,
  Lightbulb,
  Cpu,
  ShieldCheck,
  PiggyBank,
  PieChart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CoverImage } from "@/components/blog/CoverImage";

// Each category gets a brand accent + an icon, so covers are distinct but on-brand.
const STYLES: Record<string, { accent: string; Icon: LucideIcon }> = {
  "Personal Finance": { accent: "#d4a853", Icon: Wallet },
  "Money Tips": { accent: "#00b86b", Icon: Lightbulb },
  Technology: { accent: "#2b7fd6", Icon: Cpu },
  Security: { accent: "#00b86b", Icon: ShieldCheck },
  Savings: { accent: "#d4a853", Icon: PiggyBank },
  Budgeting: { accent: "#ff6b35", Icon: PieChart },
};
const FALLBACK = { accent: "#d4a853", Icon: TrendingUp };

/**
 * Branded cover art for a blog post. Renders a real photo when `image` is set,
 * otherwise a noir + accent-glow graphic keyed to the post's category. Pass
 * `children` to overlay content (used by the post hero).
 */
export function BlogCover({
  category,
  image,
  title,
  className,
  children,
}: {
  category: string;
  image?: string;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { accent, Icon } = STYLES[category] ?? FALLBACK;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#0B0B0E]",
        className
      )}
    >
      {/* Branded graphic base - always rendered, so it shows while a photo
          loads and remains as the fallback if the photo link ever fails. */}
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute right-[-15%] top-[-40%] h-[150%] w-[70%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}55, transparent 60%)`,
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-[-40%] left-[-10%] h-[130%] w-[55%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}22, transparent 60%)`,
            filter: "blur(50px)",
          }}
        />
        <Icon
          strokeWidth={1}
          className="pointer-events-none absolute -bottom-10 -right-8 h-[78%] w-auto text-white/6"
        />
        <div className="absolute right-[14%] top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border border-white/6" />
        <div className="absolute right-[14%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-white/[0.035]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      </div>

      {image && <CoverImage src={image} alt={title ?? ""} />}

      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  );
}

import { cn } from "@/lib/utils";

type Color = "gold" | "blue" | "green";

const colors: Record<Color, string> = {
  gold: "bg-[radial-gradient(circle_at_center,rgba(212,168,83,0.55),transparent_60%)]",
  blue: "bg-[radial-gradient(circle_at_center,rgba(79,172,254,0.45),transparent_60%)]",
  green: "bg-[radial-gradient(circle_at_center,rgba(0,255,135,0.35),transparent_60%)]",
};

export function GlowOrb({
  color = "gold",
  size = 480,
  className,
  drift = true,
}: {
  color?: Color;
  size?: number;
  className?: string;
  drift?: boolean;
}) {
  return (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl opacity-60",
        colors[color],
        drift && "drift",
        className
      )}
    />
  );
}

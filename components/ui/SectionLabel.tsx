import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gold/80",
        className
      )}
    >
      <span className="h-px w-6 bg-gold/40" />
      {children}
    </span>
  );
}

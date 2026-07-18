import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconCard({
  icon: Icon,
  title,
  body,
  stat,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  stat?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "glass-card-dark relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl p-7 transition-shadow duration-500",
        className
      )}
    >
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-dim text-gold">
        <Icon size={20} strokeWidth={1.75} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl text-ink md:text-[22px]">{title}</h3>
        <p className="text-[15px] leading-relaxed text-body/75">{body}</p>
      </div>

      {stat && (
        <div className="mt-auto pt-4">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-gold/85">
            {stat}
          </span>
        </div>
      )}
    </article>
  );
}

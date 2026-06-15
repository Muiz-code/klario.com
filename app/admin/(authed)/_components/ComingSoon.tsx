import type { LucideIcon } from "lucide-react";

/**
 * Themed placeholder for admin sections that are in the nav but not built yet.
 */
export function ComingSoon({
  title,
  description,
  icon: Icon,
  bullets,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  bullets?: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-bg">{title}</h1>
        <p className="mt-1 text-sm text-bg/55">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-bg/12 bg-bg/3 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/12 text-gold">
          <Icon size={26} strokeWidth={1.6} />
        </span>
        <div>
          <p className="font-display text-xl text-bg">Coming soon</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-bg/55">
            This section is on the roadmap. {description}
          </p>
        </div>

        {bullets && bullets.length > 0 && (
          <ul className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {bullets.map((b) => (
              <li
                key={b}
                className="rounded-full border border-bg/12 bg-bg/4 px-3 py-1 text-[12px] text-bg/60"
              >
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

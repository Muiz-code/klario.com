"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export type TemplateEntry = {
  mode: "fast" | "advanced";
  /** Who it is for. Missing means a business (the first templates predate the field). */
  audience?: "business" | "personal";
  id: string;
  name: string;
  description: string;
  file: string;
  version: string;
  sheets: string[];
};

type Mode = "fast" | "advanced";

const MODES: { key: Mode; title: string; strap: string; points: string[] }[] = [
  {
    key: "fast",
    title: "Fast budget",
    strap: "One page. Big rows. Pictures next to every line.",
    points: [
      "Three columns only: Plan, What really happened, Difference.",
      "You type in the yellow boxes. Money left is worked out for you.",
      "A big green or red message tells you if you made money this month.",
      "Same budget every month? Say yes and the whole year fills itself.",
    ],
  },
  {
    key: "advanced",
    title: "Advanced budget",
    strap: "The full picture, month by month, for a year.",
    points: [
      "Setup, Budget, Actuals and Variance sheets, with a chart.",
      "Plan the same every month or fill each month yourself.",
      "Every line item can be renamed to fit you.",
      "Burn and runway for startups, a per-event sheet for event managers.",
    ],
  },
];

/**
 * The templates page. A mode switch at the top, then one card per business
 * type with the download for the chosen mode. Both modes stay one click
 * away on every card, so nobody has to go back up to switch.
 */
export function TemplatesLanding({ catalogue }: { catalogue: TemplateEntry[] }) {
  const [mode, setMode] = useState<Mode>("fast");

  // One card per type, holding both files, split into who it is for.
  const groups = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; description: string; audience: "business" | "personal"; fast?: TemplateEntry; advanced?: TemplateEntry }>();
    for (const t of catalogue) {
      const row = byId.get(t.id) ?? { id: t.id, name: t.name, description: t.description, audience: t.audience ?? "business" };
      row[t.mode] = t;
      byId.set(t.id, row);
    }
    // General first: it is the one most people want.
    const all = [...byId.values()].sort((a, b) => (a.id === "general" ? -1 : b.id === "general" ? 1 : a.name.localeCompare(b.name)));
    return [
      { key: "personal", title: "For yourself", intro: "Students, staff and anyone paid monthly.", types: all.filter((t) => t.audience === "personal") },
      { key: "business", title: "For your business", intro: "Eleven kinds of business, from a food vendor to a startup.", types: all.filter((t) => t.audience === "business") },
    ].filter((g) => g.types.length > 0);
  }, [catalogue]);

  const current = MODES.find((m) => m.key === mode)!;

  return (
    <main className="min-h-dvh bg-bg">
      <Container className="pt-32 pb-20 md:pt-40 md:pb-28">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gold/80">
            <span className="h-px w-6 bg-gold/40" />
            Free resources · Budget templates
          </span>
          <h1 className="mt-4 font-[family-name:var(--font-jakarta)] text-4xl font-semibold tracking-tight text-mahogany md:text-5xl">
            A budget for your business, or just for you
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-body">
            For a business, a student, or anyone paid monthly. Download the Excel file, fill it in, and upload it to Klario
            when you are ready. Klario reads it, tracks it against your bank, and tells you how the month is going. Free,
            no sign-in needed.
          </p>
        </header>

        {/* Mode switch */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {MODES.map((m) => {
            const on = m.key === mode;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                aria-pressed={on}
                className={cn(
                  "rounded-3xl border p-6 text-left transition-all duration-300",
                  on
                    ? "border-gold bg-surface shadow-[0_24px_60px_-30px_rgba(78,44,32,0.35)]"
                    : "border-border-gold/40 bg-surface/60 hover:border-gold/60",
                )}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-mahogany">{m.title}</h2>
                  <span className={cn("h-3 w-3 rounded-full border", on ? "border-gold bg-gold" : "border-ink/30")} aria-hidden />
                </div>
                <p className="mt-1 text-[15px] text-body">{m.strap}</p>
                <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-muted">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <p className="mt-10 text-[15px] text-muted">
          Every file opens in Excel, Google Sheets or Numbers. Each has a short "How to use" sheet at the front.
        </p>

        {/* One card per type, grouped by who it is for */}
        {groups.map((g) => (
        <section key={g.key} className="mt-10" aria-label={`${current.title} downloads, ${g.title.toLowerCase()}`}>
          <h2 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold tracking-tight text-mahogany">
            {g.title}
          </h2>
          <p className="mt-2 text-[15px] text-muted">{g.intro}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.types.map((t) => {
              const chosen = t[mode];
              const other = t[mode === "fast" ? "advanced" : "fast"];
              return (
                <article key={t.id} className="flex flex-col rounded-3xl border border-border-gold bg-surface p-6">
                  <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-semibold text-mahogany">{t.name}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-body">{t.description}</p>
                  <div className="mt-5 flex flex-col gap-2">
                    {chosen ? (
                      <Button href={`/templates/${chosen.file}`} size="md" className="w-full">
                        Download {current.title.toLowerCase()}
                      </Button>
                    ) : null}
                    {other ? (
                      <Button href={`/templates/${other.file}`} variant="outline" size="md" className="w-full">
                        {mode === "fast" ? "Advanced version" : "Fast version"}
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    Sheets: {chosen?.sheets.filter((s) => s !== "How to use").join(" · ")}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
        ))}

        <section className="mt-14 max-w-3xl rounded-3xl border border-border-gold bg-surface p-6 md:p-8">
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-mahogany">What happens next</h2>
          <ol className="mt-4 space-y-3 text-[15px] leading-relaxed text-body">
            <li><strong className="text-mahogany">1.</strong> Fill the file in. Only the yellow boxes need typing.</li>
            <li><strong className="text-mahogany">2.</strong> In Klario, open your business, go to Budgets and upload the file. Klario recognises which template it is.</li>
            <li><strong className="text-mahogany">3.</strong> Klario tracks every line against what actually leaves and enters your bank, and Kai explains the month in plain words.</li>
            <li><strong className="text-mahogany">4.</strong> Download it again any time, filled in with what really happened.</li>
          </ol>
          <p className="mt-5 text-sm text-muted">
            Your own spreadsheet, in any layout, works too. Upload it and Kai sorts it into a budget for you to confirm.
          </p>
        </section>

      </Container>
    </main>
  );
}

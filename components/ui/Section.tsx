import { Container } from "./Container";
import { SectionLabel } from "./SectionLabel";
import { ScrollReveal } from "./ScrollReveal";
import { SectionEngrave } from "./SectionEngrave";
import { cn } from "@/lib/utils";

type Layout = "stacked" | "split";
type TitleSide = "left" | "right";
type Tone = "light" | "dark";

type Props = {
  id?: string;
  layout?: Layout;
  titleSide?: TitleSide;
  tone?: Tone;
  label?: string;
  heading?: string;
  emphasis?: string;
  intro?: string;
  /** Optional subtitle rendered directly under the label (split layout). */
  sub?: { lead: string; emphasis?: string };
  children: React.ReactNode;
  className?: string;
  /** Render the slow-rotating rosette engraving behind the section (default true). */
  engrave?: boolean;
};

export function Section({
  id,
  layout = "stacked",
  titleSide = "left",
  tone = "light",
  label,
  heading,
  emphasis,
  intro,
  sub,
  children,
  className,
  engrave = true,
}: Props) {
  const split = layout === "split";
  const titleRight = split && titleSide === "right";
  const dark = tone === "dark";

  // Deterministic per-section corner + spin direction, so the rotating rosette
  // varies down the page without choosing one by hand for each section.
  const seed = (id ?? label ?? "section")
    .split("")
    .reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const engraveCorner = (["tr", "bl", "br", "tl"] as const)[seed % 4];
  const engraveSize = (["md", "lg", "sm"] as const)[seed % 3];
  const engraveReverse = seed % 2 === 0;

  const headingColor = dark ? "text-bg" : "text-ink";
  const subHeadingColor = dark ? "text-bg/85" : "text-ink/85";
  const introColor = dark ? "text-bg/65" : "text-body/75";

  return (
    <section
      id={id}
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" }}
      className={cn(
        "relative py-24 md:py-32",
        dark && "bg-ink text-bg",
        className
      )}
    >
      {engrave && (
        <SectionEngrave
          tone={tone}
          position={engraveCorner}
          size={engraveSize}
          reverse={engraveReverse}
        />
      )}
      <Container className="relative z-10">
        {split ? (
          <div
            className={cn(
              "grid gap-12 lg:gap-20",
              titleRight
                ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
                : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
            )}
          >
            <ScrollReveal
              className={cn(
                "lg:sticky lg:top-28 lg:self-start",
                titleRight && "lg:order-2"
              )}
            >
              {label && (
                <h2
                  className={cn(
                    "font-display relative inline-block text-balance text-5xl leading-[0.95] capitalize sm:text-6xl lg:text-[5rem] xl:text-[5.5rem]",
                    headingColor
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-[-6%] bottom-[8%] h-[32%] -skew-x-12 bg-gold/35"
                  />
                  <span className="relative">{label}</span>
                </h2>
              )}
              {sub && (
                <p
                  className={cn(
                    "mt-7 max-w-md text-balance text-lg leading-relaxed md:text-xl",
                    subHeadingColor
                  )}
                >
                  {sub.lead}
                  {sub.emphasis && (
                    <>
                      {" "}
                      <span className="italic text-gold">{sub.emphasis}</span>
                    </>
                  )}
                </p>
              )}
            </ScrollReveal>

            <ScrollReveal
              className={cn(
                "flex flex-col gap-10",
                titleRight && "lg:order-1"
              )}
            >
              {heading && (
                <h3
                  className={cn(
                    "font-display text-balance text-2xl leading-[1.15] capitalize md:text-3xl",
                    subHeadingColor
                  )}
                >
                  {heading}
                  {emphasis && (
                    <>
                      {" "}
                      <span className="italic text-gold">{emphasis}</span>
                    </>
                  )}
                </h3>
              )}
              {intro && (
                <p className={cn("max-w-2xl text-base leading-relaxed md:text-[17px]", introColor)}>
                  {intro}
                </p>
              )}
              {children}
            </ScrollReveal>
          </div>
        ) : (
          <>
            {(label || heading) && (
              <ScrollReveal className="mb-14 flex flex-col gap-5 md:mb-20">
                {label && <SectionLabel>{label}</SectionLabel>}
                {heading && (
                  <h2
                    className={cn(
                      "font-display text-balance text-3xl leading-[1.05] capitalize sm:text-4xl md:text-5xl lg:text-[3.5rem]",
                      headingColor
                    )}
                  >
                    {heading}
                    {emphasis && (
                      <>
                        {" "}
                        <span className="italic text-gold">{emphasis}</span>
                      </>
                    )}
                  </h2>
                )}
                {intro && (
                  <p className={cn("max-w-2xl text-base leading-relaxed md:text-[17px]", introColor)}>
                    {intro}
                  </p>
                )}
              </ScrollReveal>
            )}
            {children}
          </>
        )}
      </Container>
    </section>
  );
}

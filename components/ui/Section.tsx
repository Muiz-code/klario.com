import { Container } from "./Container";
import { SectionLabel } from "./SectionLabel";
import { ScrollReveal } from "./ScrollReveal";
import { cn } from "@/lib/utils";

type Layout = "stacked" | "split";

type Props = {
  id?: string;
  layout?: Layout;
  label?: string;
  heading?: string;
  emphasis?: string;
  intro?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({
  id,
  layout = "stacked",
  label,
  heading,
  emphasis,
  intro,
  children,
  className,
}: Props) {
  const split = layout === "split";

  return (
    <section
      id={id}
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" }}
      className={cn("relative py-24 md:py-32", className)}
    >
      <Container>
        {split ? (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <ScrollReveal className="lg:sticky lg:top-28 lg:self-start">
              {label && (
                <h2 className="font-display relative inline-block text-balance text-5xl leading-[0.95] capitalize text-ink sm:text-6xl lg:text-[5rem] xl:text-[5.5rem]">
                  <span
                    aria-hidden
                    className="absolute inset-x-[-6%] bottom-[8%] h-[32%] -skew-x-12 bg-gold/35"
                  />
                  <span className="relative">{label}</span>
                </h2>
              )}
            </ScrollReveal>

            <ScrollReveal className="flex flex-col gap-10">
              {heading && (
                <h3 className="font-display text-balance text-2xl leading-[1.15] capitalize text-ink/85 md:text-3xl">
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
                <p className="max-w-2xl text-base leading-relaxed text-body/75 md:text-[17px]">
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
                  <h2 className="font-display text-balance text-3xl leading-[1.05] capitalize text-ink sm:text-4xl md:text-5xl lg:text-[3.5rem]">
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
                  <p className="max-w-2xl text-base leading-relaxed text-body/75 md:text-[17px]">
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

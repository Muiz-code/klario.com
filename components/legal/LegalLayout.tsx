import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { legalBreadcrumbJsonLd } from "@/lib/jsonld";
import type { LegalPage, Block } from "@/lib/legal";

function BlockRenderer({ block }: { block: Block }) {
  if (block.type === "p") {
    return (
      <p className="text-[15px] leading-relaxed text-body/85 md:text-base">
        {block.text}
      </p>
    );
  }
  if (block.type === "list") {
    return (
      <ul className="flex flex-col gap-2.5 pl-1">
        {block.items.map((item) => (
          <li
            key={item}
            className="relative pl-5 text-[15px] leading-relaxed text-body/85 before:absolute before:left-0 before:top-[0.65em] before:h-1 before:w-1 before:rounded-full before:bg-gold md:text-base"
          >
            {item}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "olist") {
    return (
      <ol className="flex flex-col gap-2.5">
        {block.items.map((item, i) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-relaxed text-body/85 md:text-base"
          >
            <span className="font-mono text-sm font-medium text-gold">
              {i + 1}.
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    );
  }
  if (block.type === "link") {
    return (
      <p className="text-[15px] leading-relaxed text-body/85 md:text-base">
        {block.prefix}
        <a
          href={block.href}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-gold underline-offset-4 hover:underline"
        >
          {block.label}
        </a>
        {block.suffix}
      </p>
    );
  }
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto rounded-xl border border-border-gold/40">
        <table className="w-full min-w-[420px] border-collapse text-left text-[14px] md:text-[15px]">
          <thead>
            <tr className="border-b border-border-gold/40 bg-gold/5">
              {block.head.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-display text-[13px] font-semibold text-ink"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr
                key={r}
                className="border-b border-border-gold/25 last:border-0 align-top"
              >
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={
                      "px-4 py-3 leading-relaxed text-body/85 " +
                      (c === 0 ? "font-medium text-ink/90" : "")
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <h3 className="font-display text-base text-ink md:text-lg">{block.text}</h3>
  );
}

export function LegalLayout({ page }: { page: LegalPage }) {
  const breadcrumb = legalBreadcrumbJsonLd(page.slug, page.title);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Navbar theme="light" />
      <main className="bg-bg pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto w-full max-w-[800px] px-6 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-body/60 transition-colors hover:text-gold"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>

          <header className="mt-8 flex flex-col gap-3 border-b border-border-gold/40 pb-10">
            <h1 className="font-display text-balance text-4xl leading-[1.05] text-ink md:text-5xl lg:text-[3.5rem]">
              {page.title}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-medium uppercase tracking-[0.18em] text-gold">
              <span>Effective · {page.effectiveDate}</span>
              <span className="text-body/45">
                Updated · {page.lastUpdated}
              </span>
            </div>
          </header>

          {page.preamble.length > 0 && (
            <section className="mt-10 flex flex-col gap-4 border-b border-border-gold/30 pb-10">
              <h2 className="font-display text-xl text-ink md:text-2xl">
                Introduction
              </h2>
              {page.preamble.map((block, i) => (
                <BlockRenderer key={i} block={block} />
              ))}
            </section>
          )}

          <article className="mt-10 flex flex-col gap-12">
            {page.sections.map((section, i) => (
              <section key={section.title} className="flex flex-col gap-4">
                <h2 className="font-display text-xl text-ink md:text-2xl">
                  <span className="mr-3 font-mono text-sm text-gold/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <div className="flex flex-col gap-4">
                  {section.blocks.map((block, j) => (
                    <BlockRenderer key={j} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

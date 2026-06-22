import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogCover } from "@/components/blog/BlogCover";
import { TrackView } from "@/components/blog/TrackView";
import { blogBreadcrumbJsonLd, blogArticleJsonLd } from "@/lib/jsonld";
import type { Block } from "@/lib/legal";
import type { BlogPost } from "@/lib/blog";

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
      </p>
    );
  }
  return (
    <h3 className="font-display text-base text-ink md:text-lg">{block.text}</h3>
  );
}

export function BlogPostLayout({ post }: { post: BlogPost }) {
  const breadcrumb = blogBreadcrumbJsonLd(post.slug, post.title);
  const article = blogArticleJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <TrackView slug={post.slug} />
      <Navbar theme="light" />
      <main className="bg-bg pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto w-full max-w-[800px] px-6 md:px-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-body/60 transition-colors hover:text-gold"
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>

          <BlogCover
            category={post.category}
            image={post.image}
            title={post.title}
            className="mt-6 flex min-h-[360px] flex-col rounded-3xl md:min-h-[440px]"
          >
            <header className="flex h-full flex-col justify-end gap-4 p-8 md:p-12">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                {post.category}
              </span>
              <h1 className="font-display text-balance text-3xl leading-[1.08] text-white md:text-5xl lg:text-[3.25rem]">
                {post.title}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-[17px]">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-white">
                    {post.author.name}
                  </span>
                  <span className="text-xs text-white/50">
                    {post.author.role}
                  </span>
                </div>
                <span className="hidden h-8 w-px bg-white/20 sm:block" />
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium uppercase tracking-[0.18em] text-gold">
                  <span>{post.publishedAt}</span>
                  <span className="text-white/45">{post.readTime}</span>
                </div>
              </div>
            </header>
          </BlogCover>

          <article className="mt-10 flex flex-col gap-12">
            {post.sections.map((section, i) => (
              <section key={i} className="flex flex-col gap-4">
                {section.title && (
                  <h2 className="font-display text-xl text-ink md:text-2xl">
                    {section.title}
                  </h2>
                )}
                <div className="flex flex-col gap-4">
                  {section.blocks.map((block, j) => (
                    <BlockRenderer key={j} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </article>

          <footer className="mt-16 border-t border-border-gold/40 pt-10">
            <Link
              href="/beta"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.02]"
            >
              Join the Klario beta
            </Link>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}

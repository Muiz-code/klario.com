"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlogCover } from "@/components/blog/BlogCover";
import type { BlogPost } from "@/lib/blog";

const ease = [0.16, 1, 0.3, 1] as const;

export function BlogCard({
  post,
  featured = false,
  className,
}: {
  post: BlogPost;
  featured?: boolean;
  className?: string;
}) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
      }}
      className={cn(className)}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="glass-card-dark group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:border-gold hover:shadow-[0_24px_60px_-30px_rgba(212,168,83,0.45)]"
      >
        <BlogCover
          category={post.category}
          image={post.image}
          title={post.title}
          className={cn(
            "w-full shrink-0",
            featured ? "aspect-16/8 md:aspect-16/6" : "aspect-video"
          )}
        />

        <div
          className={cn(
            "flex flex-1 flex-col gap-5",
            featured ? "p-8 md:p-10 lg:p-12" : "p-7"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold/85">
              {post.category}
            </span>
            <ArrowUpRight
              size={18}
              className="shrink-0 text-body/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2
              className={cn(
                "font-display text-balance text-ink transition-colors group-hover:text-gold",
                featured
                  ? "text-2xl md:text-3xl lg:text-4xl"
                  : "text-xl md:text-[22px]"
              )}
            >
              {post.title}
            </h2>
            <p
              className={cn(
                "leading-relaxed text-body/75",
                featured ? "text-base md:text-[17px]" : "text-[15px]"
              )}
            >
              {post.excerpt}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-body/45">
            <span>{post.publishedAt}</span>
            <span className="text-gold/60">·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

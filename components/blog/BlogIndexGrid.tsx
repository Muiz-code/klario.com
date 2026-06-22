"use client";

import { motion } from "framer-motion";
import { BlogCard } from "@/components/blog/BlogCard";
import { staggerContainer } from "@/components/ui/ScrollReveal";
import type { BlogPost } from "@/lib/blog";

export function BlogIndexGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="grid gap-5 md:grid-cols-2"
    >
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </motion.div>
  );
}

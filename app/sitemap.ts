import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getBlogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const sections = [
    "features",
    "how-it-works",
    "security",
    "pricing",
    "download",
    "ambassadors",
    "contact",
  ];

  const legal = ["privacy", "terms", "cookies"];

  return [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...sections.map((s) => ({
      url: `${SITE.url}/#${s}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...legal.map((s) => ({
      url: `${SITE.url}/${s}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    {
      url: `${SITE.url}/blog`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    ...getBlogPosts().map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAtIso),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}

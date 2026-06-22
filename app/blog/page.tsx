import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogIndexGrid } from "@/components/blog/BlogIndexGrid";
import { NigeriaMoneyStats } from "@/components/blog/NigeriaMoneyStats";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on personal finance, money management, and financial technology for Nigerians, from the Klario team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <Navbar theme="light" />
      <main className="bg-bg">
        <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-3xl"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgba(212,168,83,0.14), transparent 70%)",
            }}
          />
          <Container>
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
              <SectionLabel>Blog</SectionLabel>
              <h1 className="font-display text-balance text-4xl leading-[1.05] text-ink sm:text-5xl md:text-6xl lg:text-[3.5rem]">
                Money insights for{" "}
                <span className="italic text-gold">every Nigerian</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-body/75 md:text-[17px]">
                Practical guides, product updates, and thoughts on building
                better financial habits, from the team behind Klario.
              </p>
            </div>
          </Container>
        </section>

        <NigeriaMoneyStats />

        <section className="pt-16 pb-24 md:pt-20 md:pb-32">
          <Container>
            {featured && (
              <div className="mb-8 md:mb-12">
                <BlogCard post={featured} featured />
              </div>
            )}
            {rest.length > 0 && <BlogIndexGrid posts={rest} />}
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

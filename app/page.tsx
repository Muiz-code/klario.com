import { AppShell } from "@/components/providers/AppShell";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <AppShell>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
      </main>
      <Footer />
    </AppShell>
  );
}

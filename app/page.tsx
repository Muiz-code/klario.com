import { AppShell } from "@/components/providers/AppShell";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <AppShell>
      <Navbar />
      <main>
        <Hero />
      </main>
    </AppShell>
  );
}

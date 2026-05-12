import { AppShell } from "@/components/providers/AppShell";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Security } from "@/components/sections/Security";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { Download } from "@/components/sections/Download";
import { Ambassadors } from "@/components/sections/Ambassadors";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <AppShell>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Security />
        <Pricing />
        <Faq />
        <Download />
        <Contact />
        <Ambassadors />
      </main>
      <Footer />
    </AppShell>
  );
}

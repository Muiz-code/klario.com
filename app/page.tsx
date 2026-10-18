import { AppShell } from "@/components/providers/AppShell";
import { Navbar } from "@/components/layout/Navbar";
import { KlarioHero } from "@/components/sections/KlarioHero";
import { HeroCopyFallback } from "@/components/sections/HeroCopy";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Security } from "@/components/sections/Security";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { Download } from "@/components/sections/Download";
import { AnchorClubCTA } from "@/components/sections/AnchorClubCTA";
import { Team } from "@/components/sections/Team";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <AppShell>
      {/* Engraved guilloche mesh over the whole landing page (globals.css). */}
      <div aria-hidden className="engrave-overlay" />
      <Navbar deferred theme="dark" />
      {/* Ink behind every section, so a sub-pixel seam between two dark
          sections never shows the page's cream background as a hairline. */}
      <main className="bg-ink">
        <KlarioHero />
        <HeroCopyFallback />
        <Problem />
        <Solution />
        <AnchorClubCTA />
        <HowItWorks />
        <Security />
        <Pricing />
        <Faq />
        <Team />
        <Download />
        <Contact />
      </main>
      <Footer />
    </AppShell>
  );
}

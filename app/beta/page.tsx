import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { SITE } from "@/lib/constants";
import { BetaWizard } from "./BetaWizard";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const title = "Join the Klario beta";
const description =
  "Let's talk about your money (gently). Eight quick questions to help shape Klario — your AI money app built for Nigerians.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/beta" },
  openGraph: {
    title,
    description,
    url: `${SITE.url}/beta`,
    siteName: SITE.legalName,
    type: "website",
    locale: "en_NG",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
};

export default function BetaPage() {
  return (
    <div className={`${space.variable} ${manrope.variable}`}>
      <BetaWizard />
    </div>
  );
}

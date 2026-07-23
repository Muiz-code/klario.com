import type { Metadata } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import { SITE } from "@/lib/constants";
import { AnchorWizard } from "./AnchorWizard";

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

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
  display: "swap",
});

const title = "Join the KLARIO Anchor Club";
const description =
  "A club for people who want to actually build something. Real product experience, mentorship, and first access to the Klario beta. Seven quick questions to apply.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/anchor-club" },
  openGraph: {
    title,
    description,
    url: `${SITE.url}/anchor-club`,
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

export default function AnchorClubPage() {
  return (
    <div className={`${space.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <AnchorWizard />
    </div>
  );
}

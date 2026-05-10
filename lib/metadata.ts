import type { Metadata } from "next";
import { SITE } from "./constants";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Klario is an AI-powered personal finance app for Nigerians. Connect all your bank accounts, track spending with AI, automate savings, and pay bills — all in one place.",
  keywords: [
    "Klario",
    "personal finance Nigeria",
    "AI finance app",
    "bank account tracker Nigeria",
    "budgeting app Nigeria",
    "KlarioAI",
  ],
  applicationName: SITE.name,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.subTagline,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.subTagline,
  },
  robots: { index: true, follow: true },
};

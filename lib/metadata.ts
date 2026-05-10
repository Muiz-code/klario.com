import type { Metadata } from "next";
import { SITE } from "./constants";

const title = "Klario — Your Money, Finally Making Sense";
const description =
  "Klario is an AI-powered personal finance app for Nigerians. Connect all your bank accounts, track spending with AI, automate savings, and pay bills — all in one place.";

export const siteMetadata: Metadata = {
  metadataBase: new URL("https://klario.finance"),
  title: {
    default: title,
    template: `%s · ${SITE.name}`,
  },
  description,
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  category: "Finance",
  keywords: [
    "Klario",
    "Klario Finance",
    "personal finance Nigeria",
    "AI finance app Nigeria",
    "bank account tracker Nigeria",
    "budgeting app Nigeria",
    "savings app Nigeria",
    "bill payment app Nigeria",
    "KlarioAI",
    "Naira budgeting",
    "Nigerian fintech",
    "PFM Nigeria",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "https://klario.finance",
    siteName: SITE.legalName,
    type: "website",
    locale: "en_NG",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE.name}: ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
    site: SITE.twitter,
    creator: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

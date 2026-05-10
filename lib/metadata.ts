import type { Metadata } from "next";
import { SITE } from "./constants";

const title = "Klario | AI Personal Finance for Nigeria. Every Bank, One App.";
const description =
  "Klario is an AI-powered personal finance app for Nigerians. Connect every bank account, track every naira, automate savings, and pay bills, all in one place.";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: title,
    template: `%s · ${SITE.name}`,
  },
  description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Finance",
  keywords: [
    "Klario",
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
    url: SITE.url,
    siteName: SITE.name,
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
    creator: "@klario_app",
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

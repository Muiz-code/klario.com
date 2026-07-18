import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteMetadata } from "@/lib/metadata";
import { jsonLd } from "@/lib/jsonld";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { RouteTransition } from "@/components/providers/RouteTransition";
import "./globals.css";

// Brand type system: Space Grotesk for display/headlines, Manrope for body/UI.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500"],
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  themeColor: "#F7F6F2",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrains.variable} ${fraunces.variable}`}
    >
      <body className="bg-bg text-body grain min-h-dvh antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <RouteTransition>{children}</RouteTransition>
        <AnalyticsBeacon />
        <Analytics />
      </body>
    </html>
  );
}

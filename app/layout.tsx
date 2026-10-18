import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { siteMetadata } from "@/lib/metadata";
import { jsonLd } from "@/lib/jsonld";
// Brand type system: Space Grotesk for display/headlines, Manrope for body/UI.
import { spaceGrotesk, manrope, jetbrains, fraunces } from "@/lib/fonts";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { RouteTransition } from "@/components/providers/RouteTransition";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

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
        <SmoothScroll />
        <RouteTransition>{children}</RouteTransition>
        <AnalyticsBeacon />
        <Analytics />
      </body>
    </html>
  );
}

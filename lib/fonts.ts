import localFont from "next/font/local";

/**
 * Brand type, self-hosted from app/assets/fonts.
 *
 * These used to come from next/font/google, which fetches Google Fonts at
 * build time. Turbopack intermittently rejects that response ("next/font/google
 * queries have exactly one entry") and fails the whole build, a different font
 * each time, so production deploys flaked. Local files make the build offline
 * and deterministic.
 *
 * Each file is the official variable font from github.com/google/fonts, cut to
 * Google's latin + latin-ext ranges (latin-ext carries ₦) and to the weights we
 * use. Fraunces is the italic cut with SOFT/WONK pinned at their defaults.
 *
 * The same face is declared under two variable names because the root layout
 * and the standalone beta / Anchor Club pages name them differently.
 */

// Root layout: display, body, mono and the italic serif accent.
export const spaceGrotesk = localFont({
  src: "../app/assets/fonts/space-grotesk.woff2",
  weight: "400 700",
  variable: "--font-jakarta",
  display: "swap",
});

export const manrope = localFont({
  src: "../app/assets/fonts/manrope.woff2",
  weight: "400 700",
  variable: "--font-inter",
  display: "swap",
});

export const jetbrains = localFont({
  src: "../app/assets/fonts/jetbrains-mono.woff2",
  weight: "400 600",
  variable: "--font-jetbrains",
  display: "swap",
});

export const fraunces = localFont({
  src: "../app/assets/fonts/fraunces-italic.woff2",
  weight: "400 500",
  style: "italic",
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

// Beta and Anchor Club pages.
export const spaceStandalone = localFont({
  src: "../app/assets/fonts/space-grotesk.woff2",
  weight: "400 700",
  variable: "--font-space",
  display: "swap",
});

export const manropeStandalone = localFont({
  src: "../app/assets/fonts/manrope.woff2",
  weight: "400 700",
  variable: "--font-manrope",
  display: "swap",
});

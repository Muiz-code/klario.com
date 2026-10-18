import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import { spaceStandalone as space, manropeStandalone as manrope, jetbrains } from "@/lib/fonts";
import { AnchorWizard } from "./AnchorWizard";

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

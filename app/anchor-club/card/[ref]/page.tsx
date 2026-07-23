import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import { getAnchorResponseByRef } from "@/lib/db/anchorClub";
import { CardView } from "./CardView";

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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Anchor Club card",
  robots: { index: false, follow: false },
};

export default async function AnchorCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { ref } = await params;
  const sp = await searchParams;
  const allowDownload = sp?.dl === "1";

  const row = await getAnchorResponseByRef(ref);
  if (!row) notFound();

  const area = row.area || row.notes?.area || "Anchor";
  const level = row.level || row.notes?.level || "";

  return (
    <div className={`${space.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <CardView
        name={row.name || ""}
        area={area}
        institution={row.institution || ""}
        level={level}
        cardNo={row.ref || ""}
        allowDownload={allowDownload}
      />
    </div>
  );
}

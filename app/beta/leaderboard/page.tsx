import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { SITE } from "@/lib/constants";
import { listBetaResponses } from "@/lib/db/betaResponses";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { BetaLeaderboard, type LeaderRow } from "./BetaLeaderboard";

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

export const dynamic = "force-dynamic";

// ₦ per referral, matching the admin reward (₦500 per 10).
const PER_REFERRAL = 50;

const title = "Klario beta referral leaderboard";
const description =
  "See the top student referrers in the Klario beta. Refer 10 friends and earn ₦500 airtime, or cash.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/beta/leaderboard" },
  openGraph: {
    title,
    description,
    url: `${SITE.url}/beta/leaderboard`,
    siteName: SITE.legalName,
    type: "website",
    locale: "en_NG",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
  },
};

export default async function LeaderboardPage() {
  const all = isSupabaseConfigured() ? await listBetaResponses() : [];

  // Count referrals per referrer; only students earn the reward.
  const counts = new Map<string, number>();
  for (const r of all) {
    if (r.referred_by_id) {
      counts.set(r.referred_by_id, (counts.get(r.referred_by_id) ?? 0) + 1);
    }
  }
  const byId = new Map(all.map((r) => [r.id, r]));

  const ranked = [...counts.entries()]
    .map(([id, count]) => ({ row: byId.get(id), count }))
    .filter(
      (e): e is { row: NonNullable<typeof e.row>; count: number } =>
        !!e.row &&
        !!e.row.ref &&
        (e.row.occupation || "").toLowerCase() === "student"
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 100);

  // Only masked, non-identifying fields leave the server: first name + the
  // public referral code (which students already have), the count, the reward.
  const leaders: LeaderRow[] = ranked.map((e, i) => ({
    rank: i + 1,
    ref: e.row.ref as string,
    name: (e.row.name || "").trim().split(/\s+/)[0] || "Anonymous",
    count: e.count,
    amount: e.count * PER_REFERRAL,
  }));

  return (
    <div className={`${space.variable} ${manrope.variable}`}>
      <BetaLeaderboard leaders={leaders} />
    </div>
  );
}

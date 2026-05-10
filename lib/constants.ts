export const SITE = {
  name: "Klario",
  tagline: "Your money, finally making sense.",
  subTagline: "One app. Every account. Full clarity.",
  url: "https://klario.app",
  waitlistHref: "#waitlist",
  poweredBy: { brand: "RaaVon", rc: "RC-XXXXX" },
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
] as const;

export const HERO = {
  badge: "AI-Powered  ·  Nigerian Banks  ·  Coming Soon",
  headlineLead: ["Your money,", "finally"] as const,
  headlineTrail: { prefix: "in your", suffix: "." } as const,
  rotatingWords: ["control", "clarity", "focus", "hands"] as const,
  sub: "Connect every Nigerian bank account. Track every naira. Save automatically. Pay bills without leaving the app. All powered by AI that actually understands you.",
  trust: [
    { icon: "Lock", label: "CBN Compliant" },
    { icon: "Shield", label: "Bank-Grade Security" },
    { icon: "Zap", label: "256-bit Encrypted" },
    { icon: "Check", label: "BVN Protected" },
  ] as const,
} as const;

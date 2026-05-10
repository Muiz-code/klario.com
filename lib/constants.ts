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

export const PROBLEM = {
  label: "The Problem",
  heading: { lead: "Nigerians are financially active, but financially", emphasis: "blind." },
  cards: [
    {
      icon: "Landmark",
      title: "Multiple Banks, Zero Visibility",
      body: "The average Nigerian has accounts across 3-5 banks with no unified view of their actual financial health.",
      stat: "217M+ Nigerians",
    },
    {
      icon: "Bot",
      title: "No Localised Guidance",
      body: "Global finance apps don't understand naira inflation, bank charges, or Nigerian spending patterns.",
      stat: "<4% use any PFM tool",
    },
    {
      icon: "TrendingDown",
      title: "Silent Financial Leakage",
      body: "Without clarity, money disappears: on charges, duplicate subscriptions, things you forgot about.",
      stat: "₦Billions lost monthly",
    },
    {
      icon: "PiggyBank",
      title: "Saving Without a System",
      body: "Wanting to save isn't a plan. Without automation, most save by mood, not by method, and the goal never moves.",
      stat: "Saving by chance, not by plan",
    },
  ],
} as const;

export const SOLUTION = {
  label: "How Klario Helps",
  heading: "One app. Every account.",
  emphasis: "Full clarity.",
  tabs: [
    {
      id: "dashboard",
      icon: "Landmark",
      eyebrow: "Unified Dashboard",
      title: "All your banks. One screen.",
      body: "Connect every Nigerian bank account and see your real net worth, spending, and balances. Live.",
    },
    {
      id: "ai",
      icon: "Sparkles",
      eyebrow: "KlarioAI",
      title: "Your AI financial advisor.",
      body: "Ask anything. \"How much did I spend on food?\" \"Can I afford this?\" Get real answers, not generic tips.",
    },
    {
      id: "savings",
      icon: "PiggyBank",
      eyebrow: "Smart Savings",
      title: "Save without thinking about it.",
      body: "Set a goal. Klario opens a real bank savings account in your name and funds it automatically on schedule.",
    },
    {
      id: "bills",
      icon: "Zap",
      eyebrow: "Bill Payments",
      title: "Airtime. Data. Electricity. One tap.",
      body: "Pay every bill without leaving Klario. No redirects, no third-party screens. Just done.",
    },
    {
      id: "manager",
      icon: "UserRound",
      eyebrow: "Financial Manager",
      title: "A real human in your corner.",
      body: "Financial Executive users get a dedicated human financial manager. Monthly calls. Personal plan.",
    },
  ],
} as const;

export const HERO = {
  badge: "AI-Powered · Nigerian Banks · Coming Soon",
  line1: { lead: "Your money,", emphasis: "finally" } as const,
  line2: { prefix: "in your", suffix: "." } as const,
  rotatingWords: ["control", "clarity", "focus", "hands"] as const,
  sub: "Connect every Nigerian bank account. Track every naira. Save automatically. Pay bills without leaving the app. All powered by AI that actually understands you.",
} as const;

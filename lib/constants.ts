export const SITE = {
  name: "Klario",
  legalName: "Klario Finance",
  tagline: "Your money, finally making sense.",
  subTagline: "One app. Every account. Full clarity.",
  url: "https://klario.finance",
  downloadHref: "#download",
  ambassadorsHref: "#ambassadors",
  emails: {
    hello: "hello@klario.finance",
    privacy: "privacy@klario.finance",
    legal: "legal@klario.finance",
  },
  poweredBy: {
    brand: "Raavon Limited",
    rc: "RC-9537604",
    url: "https://www.raavon.com",
  },
  twitter: "@klariofinance",
} as const;

export const CONTACT = {
  label: "Contact",
  heading: "Questions, partnerships,",
  emphasis: "or just hello.",
  intro:
    "Press, partnerships, support — drop us a line and we'll get back within two business days.",
  email: "hello@klario.finance",
  topics: ["General", "Partnership", "Press", "Support"] as const,
  successTitle: "Message sent.",
  successBody: "We'll be in touch within two business days.",
} as const;

export const NEWSLETTER = {
  eyebrow: "The Klario Letter",
  heading: "Money clarity, monthly.",
  body: "One short email a month: AI-driven money insights, naira tips, and Nigerian fintech moves. No spam.",
  placeholder: "you@example.com",
  cta: "Subscribe",
  successTitle: "You're subscribed.",
  successBody: "Watch your inbox for our next drop.",
  delayMs: 12000,
  storageKey: "klario_newsletter_dismissed_v1",
} as const;

export const FOOTER = {
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Security", href: "#security" },
        { label: "Pricing", href: "#pricing" },
        { label: "Download", href: "#download" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "FAQ", href: "#faq" },
        { label: "Ambassadors", href: "#ambassadors" },
        { label: "Contact", href: "#contact" },
        { label: "Blog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ],
  social: [
    {
      label: "X / Twitter",
      href: "https://x.com/klariofinance",
      icon: "Twitter",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/klariofinance",
      icon: "Instagram",
    },
    {
      label: "LinkedIn",
      href: "https://ng.linkedin.com/in/klario-finance-7b55a140a",
      icon: "Linkedin",
    },
  ],
  disclaimer:
    "Klario is not a bank. We are a financial intelligence platform. klario.finance",
} as const;

export const FAQS = [
  {
    q: "What is Klario?",
    a: "Klario is an AI-powered personal finance app for Nigerians. It connects all your bank accounts in one place, tracks your spending with AI, automates savings, and lets you pay bills without leaving the app.",
  },
  {
    q: "Is Klario a bank?",
    a: "No. Klario is a financial intelligence platform, not a bank. We do not hold or custody your funds. All banking and payment functions run through licensed CBN-regulated partners.",
  },
  {
    q: "How does Klario connect to my bank accounts?",
    a: "Klario uses licensed open banking infrastructure to read your bank data securely. Your bank login credentials never touch Klario's servers. We receive read-only data through cryptographically signed APIs.",
  },
  {
    q: "Is Klario safe to use?",
    a: "Yes. Your data is encrypted with AES-256 at rest and TLS 1.3 in transit. We use biometric authentication, BVN verification, and row-level database security so users cannot access each other's data.",
  },
  {
    q: "How much does Klario cost?",
    a: "Klario has three tiers: Free at ₦0 per month, Money Manager at ₦1,900 per month, and Financial Executive at ₦5,400 per month. Annual billing is 10% cheaper.",
  },
  {
    q: "Who is behind Klario?",
    a: "Klario is a product of Klario Finance, operated by Raavon Limited (RC-9537604, www.raavon.com). The team is based in Nigeria and focuses exclusively on Nigerian financial users.",
  },
  {
    q: "When can I download the Klario app?",
    a: "Klario is currently in pre-launch. Join the waitlist on klario.finance to be notified the moment we go live on iOS and Android.",
  },
] as const;

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  { label: "Ambassadors", href: "#ambassadors" },
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

export const DOWNLOAD = {
  heading: "Take control of your money.",
  emphasis: "Download Klario.",
  sub: "Join thousands of Nigerians already on the waitlist.",
  waitlistPlaceholder: "you@example.com",
  waitlistCta: "Join Waitlist",
  waitlistDisclaimer: "No spam. We only message when we launch.",
} as const;

export const AMBASSADORS = {
  label: "Call for Ambassadors",
  heading: "Rep Klario at your",
  emphasis: "school or workplace.",
  intro:
    "Students and staff across Nigeria: become a Klario ambassador. Earn a stipend, build real product and marketing skills, and help your community take control of their money.",
  perks: [
    { icon: "Wallet", title: "Monthly stipend", body: "Get paid for hosting events, running campaigns, and onboarding users." },
    { icon: "Gift", title: "Klario merch", body: "Hoodies, stickers, swag for you and your community." },
    { icon: "GraduationCap", title: "Resume credit", body: "Real product experience plus a written reference from the team." },
    { icon: "MessageSquare", title: "Direct line to founders", body: "Monthly call with the team. Your voice shapes the product." },
  ],
  form: {
    title: "Apply to be an ambassador",
    note: "We review applications weekly. You'll hear back within 7 days.",
    successTitle: "Application received.",
    successBody: "We'll review and reach out within 7 days. Watch your inbox.",
  },
} as const;

export const PRICING = {
  label: "Simple Pricing",
  heading: "Start free. Upgrade when",
  emphasis: "you're ready.",
  annualDiscount: 0.1,
  tiers: [
    {
      id: "free",
      name: "Free",
      tagline: "A first taste of clarity.",
      monthly: 0,
      cta: "Get Started Free",
      features: [
        "Limited bank connections",
        "5 KlarioAI queries / month",
        "Basic balance dashboard",
        "Budget alerts",
        "₦10 per transaction",
      ],
    },
    {
      id: "money-manager",
      name: "Money Manager",
      tagline: "For everyday active money management.",
      monthly: 1900,
      cta: "Start Money Manager",
      featured: true,
      features: [
        "Multiple bank connections",
        "15 KlarioAI queries / day",
        "Automated budget engine",
        "4-tier debt risk scoring",
        "In-app bill payments",
        "Transaction export (PDF / CSV)",
        "Bank-integrated savings goals",
        "Push notifications",
        "₦10 per transaction",
      ],
    },
    {
      id: "executive",
      name: "Financial Executive",
      tagline: "A real human financial manager in your corner.",
      monthly: 5400,
      cta: "Go Executive",
      features: [
        "Unlimited bank connections",
        "30 KlarioAI queries / day",
        "Everything in Money Manager",
        "Dedicated human financial manager",
        "Monthly 1-on-1 strategy call",
        "Personalised financial plan (quarterly)",
        "Investment partner referrals",
        "Zero transfer fees",
        "Priority support (2hr response)",
      ],
    },
  ],
} as const;

export const SECURITY = {
  label: "Bank-Grade Security",
  heading: "Your data is safer here than",
  emphasis: "anywhere else.",
  intro:
    "We are obsessed with security. Not because we have to be, because your financial data deserves nothing less.",
  cards: [
    {
      icon: "Fingerprint",
      title: "Biometric Authentication",
      body: "Face ID or fingerprint required every session. No one gets in but you.",
    },
    {
      icon: "ShieldCheck",
      title: "256-bit AES Encryption",
      body: "Every piece of your data, encrypted end to end, at rest and in transit. Always.",
    },
    {
      icon: "BadgeCheck",
      title: "BVN Verification",
      body: "Every user verified against their Bank Verification Number. Zero fake accounts.",
    },
    {
      icon: "KeyRound",
      title: "Zero Knowledge Storage",
      body: "Your bank credentials never touch Klario's servers. We read data, we never store passwords.",
    },
    {
      icon: "Webhook",
      title: "HMAC-SHA512 Webhooks",
      body: "Every payment callback cryptographically verified before a single naira moves.",
    },
    {
      icon: "DatabaseZap",
      title: "Row-Level Security",
      body: "Database rules ensure no user can ever access another user's data. Architecturally impossible.",
    },
  ],
  compliance: ["VAPT Audited", "NDPC Compliant", "CBN Framework"],
} as const;

export const HOW_IT_WORKS = {
  label: "Get Started",
  heading: "Three steps to",
  emphasis: "financial clarity.",
  steps: [
    {
      icon: "Smartphone",
      title: "Download Klario",
      body: "Available on iOS and Android. Takes 60 seconds to install.",
    },
    {
      icon: "Link",
      title: "Connect Your Banks",
      body: "Securely link all your Nigerian bank accounts. Your credentials never touch our servers.",
    },
    {
      icon: "Lightbulb",
      title: "Get Clarity",
      body: "Klario analyses your finances and gives you a complete picture, instantly.",
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

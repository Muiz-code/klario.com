export const SITE = {
  name: "Klario",
  legalName: "Klario Finance",
  tagline: "Your money, clear and simple.",
  subTagline: "One app. Every account. Full clarity.",
  url: "https://www.klario.finance",
  downloadHref: "#download",
  ambassadorsHref: "/anchor-club",
  emails: {
    hello: "hello@klario.finance",
    contact: "contact@klario.finance",
    privacy: "privacy@klario.finance",
    legal: "legal@klario.finance",
  },
  poweredBy: {
    brand: "Raavon Limited",
    rc: "RC-9537604",
    url: "https://www.raavon.com",
    email: "contact@raavon.com",
  },
  twitter: "@klariofinance",
} as const;

// App store + community links used in emails (confirmation + admin sends).
// Replace the placeholders with the real store / group URLs once live.
export const APP_LINKS = {
  ios: "https://apps.apple.com/app/klario",
  android: "https://play.google.com/store/apps/details?id=finance.klario",
  whatsapp: "https://chat.whatsapp.com/",
} as const;

export const CONTACT = {
  label: "Contact",
  heading: "Questions, partnerships,",
  emphasis: "or just hello.",
  intro:
    "Press, partnerships, support. Drop us a line and we'll get back within two business days.",
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
  cta: {
    heading: "Connect. Track. Understand.",
    emphasis: "with Klario.",
    primary: "Join Anchor Club",
    primaryHref: "/anchor-club",
    secondary: "Get Started",
    secondaryHref: "/beta",
  },
  getStarted: {
    title: "Get Started",
    links: [
      { label: "Join the beta", action: "beta" as const },
    ],
  },
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
      href: "https://www.linkedin.com/company/klariofinance",
      icon: "Linkedin",
    },
  ],
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Security", href: "#security" },
        { label: "Pricing", href: "#pricing" },
        { label: "How it works", href: "#how-it-works" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Use Cases",
      links: [
        { label: "Unified Dashboard", href: "#features" },
        { label: "KlarioAI Advisor", href: "#features" },
        { label: "Debt Management", href: "#features" },
        { label: "Bill Payments", href: "#features" },
        { label: "Financial Manager", href: "#features" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#problem" },
        { label: "Investors", href: "/investors" },
        { label: "Anchor Club", href: "/anchor-club" },
        { label: "Free resources", href: "/resources" },
        { label: "Budget templates", href: "/templates" },
        { label: "Contact", href: "#contact" },
        { label: "Beta program", action: "beta" as const },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Delete account", href: "/delete-account" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Data Protection", href: "/data-protection" },
        { label: "Anti-Fraud Policy", href: "/anti-fraud" },
        { label: "Compliance", href: "/compliance" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Press", href: `mailto:${"hello@klario.finance"}` },
        { label: "Support", href: "#contact" },
        { label: "Newsletter", href: "#contact" },
      ],
    },
  ],
  disclaimer:
    "Klario is not a bank. We are a financial intelligence platform. klario.finance",
  disclaimerLong: {
    title: "Disclaimer",
    paragraphs: [
      "The information provided on this website is intended for general informational purposes only and does not constitute financial, legal, or professional advice. While we strive to ensure that the content presented is accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.",
      "Our platform is designed to give Nigerians a unified view of their bank accounts, AI-driven insights, and tools to manage their money. Despite our use of bank-grade security protocols to protect sensitive information, we cannot guarantee the absolute security of your data. Users are advised to independently verify the accuracy and completeness of all information obtained through our services before making any financial decisions.",
      "Klario is operated by Raavon Limited (RC-9537604) and is not a bank. All banking and payment functions are powered by licensed CBN-regulated partners. Klario does not hold or custody user funds.",
      "By using this website, you agree to these terms and acknowledge that any reliance on the information provided here is at your own risk. If you have any questions regarding this disclaimer or the website's content, please contact us at hello@klario.finance.",
    ],
  },
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
    a: "Klario is free to start, and there is one paid plan sold under two names depending on who you are. Money Manager is for personal accounts. Financial Executive is for businesses, priced on the number of accounts and the setup you need, so it starts with a conversation. Free gives you two connected banks, sending, savings goals and budgets; paying unlocks analytics across every account, far more KlarioAI, and exports. See the Pricing section.",
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
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/#security" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Resources", href: "/resources" },
  { label: "Investors", href: "/investors" },
  { label: "Blog", href: "/blog" },
] as const;

export const PROBLEM = {
  label: "The Problem",
  heading: { lead: "Nigerians are financially active, but financially", emphasis: "blind." },
  // Every figure here is now one we can stand behind and point at. The previous
  // set ("217M+ Nigerians", "<4% use any PFM tool", "₦Billions lost monthly")
  // carried no source, in a section directly above a market page that footnotes
  // every external number — the inconsistency was more visible than the stats.
  //
  // Three of the four come from our OWN two-wave beta research, which is the
  // strongest evidence we have precisely because it is ours and it is specific.
  // The fourth is EFInA, already cited on the investor page.
  cards: [
    {
      icon: "Landmark",
      title: "Multiple Banks, Zero Visibility",
      body: "Most Nigerians hold accounts at several banks and have no single place that shows what they actually have.",
      stat: "92% use two or more banks",
    },
    {
      icon: "Bot",
      title: "No Localised Guidance",
      body: "Global finance apps don't understand naira inflation, Nigerian bank charges, or how people here actually earn and spend.",
      stat: "97% still track by hand, or not at all",
    },
    {
      icon: "TrendingDown",
      title: "Silent Financial Leakage",
      body: "Without clarity, money disappears: on charges, duplicate subscriptions, things you forgot about.",
      stat: "79% lose track of where it went",
    },
    {
      icon: "PiggyBank",
      title: "Savings Sit in Yet Another App",
      // Was "Saving Without a System — without automation, most save by mood".
      // That is not true and Nigerians know it is not true: PiggyVest and
      // Cowrywise solved automated saving years ago and solved it well. A
      // problem section that claims otherwise loses the reader on the one card
      // where they have first-hand experience.
      //
      // The real gap is the one those apps create by design: your savings live
      // apart from the accounts you spend from, so the whole picture is still
      // split. That is a problem Klario actually addresses, and it does not
      // require pretending the savings apps failed.
      body: "Savings apps do the saving well, but that money sits apart from the accounts you spend from. Your savings know nothing about your salary, and your bank knows nothing about your goals.",
      stat: "86% want every account in one view",
    },
    {
      icon: "Briefcase",
      title: "Business and Personal in One Pot",
      body: "When diesel for the shop and school fees leave the same account, you can't tell what the business actually made, or prove it to a bank when you need a loan.",
      stat: "30% company tax on profit you can't prove",
    },
    // These two carry no stat on purpose. IconCard omits the line entirely when
    // `stat` is absent, and a card that stands on its copy is better than one
    // propped up by a number we cannot point at.
    {
      icon: "CreditCard",
      title: "Debt You Can't See All Of",
      body: "A card here, a loan app there, something owed to a cooperative. Each one knows its own balance. Nothing tells you what you owe in total, or which to clear first.",
    },
    {
      icon: "ArrowLeftRight",
      title: "Your Own Money, Out of Reach",
      body: "The money is yours and it is right there, just in the wrong account. Moving it means opening another app, retyping details you already have, and hoping you got them right.",
    },
  ],
  sources:
    "Klario Beta Insights, two waves combined (n = 331), July 2026. Company income tax rate: Federal Inland Revenue Service, Nigeria.",
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
  // Flip to true once standard pricing is locked. While false, amounts are
  // masked and the billing toggle is hidden.
  revealPrices: false,
  annualDiscount: 0.1,
  // Money Manager and Financial Executive are NOT a ladder. They are the same
  // paid plan sold to two different buyers: a person, and a business. Nobody
  // upgrades from one to the other, so the cards must not imply "everything in
  // Money Manager, plus…" the way a tiered page would. Limits and figures here
  // mirror the app's featureGates.ts; change them together or the site starts
  // promising something the app refuses.
  tiers: [
    {
      id: "free",
      name: "Free",
      tagline: "A first taste of clarity.",
      monthly: 0,
      cta: "Get Started Free",
      features: [
        "2 bank connections",
        "Send money from any connected bank",
        "10 KlarioAI messages / month",
        "Savings goals and budgets",
        "Analytics for one account",
      ],
    },
    {
      id: "money-manager",
      name: "Money Manager",
      tagline: "For personal money, handled properly.",
      // Matches the app: ₦3,250/month personal, ₦3,000/month billed annually.
      monthly: 3250,
      cta: "Start Money Manager",
      featured: true,
      audience: "personal",
      features: [
        "5 bank connections",
        "200 KlarioAI messages / month",
        "Analytics and exports across every account",
        "Automated budget engine with funded vaults",
        "Savings goals with scheduled auto-save",
        "Debt tracking and risk scoring",
        "Document and payslip analysis",
        "Transaction export (PDF / CSV)",
      ],
    },
    {
      id: "executive",
      name: "Financial Executive",
      tagline: "For businesses, priced on what you need.",
      // Business terms are agreed per customer, so no figure is shown even once
      // revealPrices is on. The number in the app (₦32,700) is the standard
      // rate, not the one every business pays.
      monthly: null,
      contactSales: true,
      audience: "business",
      cta: "Talk to sales",
      features: [
        "10+ bank connections, agreed with you",
        "600 KlarioAI messages / month",
        "Business and personal money kept separate",
        "Commingling tracking and reports",
        "Everything in Money Manager",
        "Dedicated human financial manager",
        "Priority support",
      ],
    },
  ],
} as const;

export const SECURITY = {
  label: "Security",
  // Was "Your data is safer here than anywhere else." — a superlative nobody
  // can verify and we cannot support, on the one section where a reader is
  // actively looking for a reason not to trust us.
  //
  // What replaces it is narrower and checkable, and it happens to answer the
  // objection our own research found people raise first. The strongest thing
  // we can say about security is not that we protect what we hold; it is how
  // little we hold in the first place.
  heading: "We never see your bank login, and we never",
  emphasis: "hold your money.",
  intro:
    "Your credentials go straight to licensed open banking infrastructure. Your money stays with your bank and our regulated payment partners. What we can't hold, we can't lose.",
  cards: [
    {
      icon: "Fingerprint",
      title: "Layered Account Security",
      body: "A transaction PIN approves every payment, optional Face ID speeds up sign-in, and a fresh-device identity check confirms it's really you.",
    },
    {
      icon: "ShieldCheck",
      title: "Encrypted at Rest and in Transit",
      // Was "encrypted end to end". End-to-end encryption means only the two
      // endpoints can read the data, and that is not what Klario does: reading
      // your transactions is the product. AES-256 at rest and TLS 1.3 in
      // transit is the true claim, and it is a strong one.
      body: "AES-256 at rest, TLS 1.3 in transit. Your data is protected everywhere it sits and everywhere it travels.",
    },
    {
      icon: "BadgeCheck",
      title: "Identity Verification",
      // Was "Every user verified... Zero fake accounts". Not true while
      // BETA_SKIP_KYC_GATE is on in the app, and stating it as fact on a live
      // site is the kind of claim that is checked after something goes wrong.
      body: "Bank Verification Number checks confirm real people behind real accounts before money moves.",
    },
    {
      icon: "KeyRound",
      title: "We Never See Your Bank Login",
      // Was "Zero Knowledge Storage", which means the provider cannot read the
      // data at all. The body always said the accurate thing; the title
      // contradicted it.
      body: "Your bank credentials go straight to licensed open banking infrastructure and never touch Klario's servers.",
    },
    {
      icon: "Webhook",
      title: "Verified Payment Callbacks",
      // Was "HMAC-SHA512 Webhooks". The webhook authenticates a shared secret
      // in constant time and refuses every event if that secret is unset. That
      // is genuinely good, and it is not HMAC-SHA512, which nothing computes.
      body: "Every payment callback is authenticated before a single naira moves, and unverified events are refused outright.",
    },
    {
      icon: "DatabaseZap",
      title: "Row-Level Security",
      body: "Database rules enforce, on every single query, that you can only ever reach your own data.",
    },
  ],
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
      id: "debt",
      icon: "TrendingDown",
      eyebrow: "Debt Management",
      title: "Get on top of every debt.",
      body: "See what you owe across every lender in one place, and let KlarioAI map out a repayment plan you can actually keep.",
    },
    {
      id: "send",
      icon: "Send",
      eyebrow: "Send Money",
      title: "Send from any account you've connected.",
      body: "Pick the account, send, done. Split one transfer across several banks when no single account covers it. Klario charges nothing to send.",
    },
    {
      id: "savings",
      icon: "PiggyBank",
      eyebrow: "Savings",
      title: "Money set aside, and kept there.",
      body: "Savings goals that fund themselves on a schedule you choose, with a maturity date that holds you to it. Watch it grow without touching it.",
    },
    {
      id: "budgets",
      icon: "PieChart",
      eyebrow: "Budgets",
      title: "Plan a month before you spend it.",
      body: "Give every naira of your income a job in one pass, then let Klario hold the money back and release it as the month goes.",
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

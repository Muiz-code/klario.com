// Investor-facing content for /investors. Kept honest and provider-agnostic:
// no partner names (pre-license), no fabricated traction. Company-specific
// numbers the founders should own (raise size, valuation, live metrics) are
// intentionally left to the deck / data room, not hard-coded here.

export const INVESTORS = {
  hero: {
    eyebrow: "Investors",
    heading: "The money-clarity layer for",
    emphasis: "everyday Nigeria.",
    sub: "Nigerians bank across three to five apps and still can't answer a simple question: how am I actually doing? Klario unifies every account, adds an AI that understands naira, and turns clarity into action, saving, budgeting, paying, all in one place.",
    primaryCta: { label: "Download the investor brief", href: "/Klario-Investor-Brief.pdf" },
    secondaryCta: { label: "Talk to the founders", href: "mailto:invest@klario.finance?subject=Intro%20call" },
  },

  // Plain-language product explainer, kept to claims already made elsewhere
  // (read-only access, KlarioAI, automated savings, in-app bills, human tier).
  // No metrics here on purpose - this is the "what it actually does" mental
  // model an investor needs before the market case.
  whatItDoes: {
    label: "What Klario does",
    heading: "Scattered accounts become",
    emphasis: "one clear answer.",
    intro:
      "Most Nigerians manage money across three to five banking apps and a mental tally. Klario replaces that with a single place to see everything, understand it in plain naira, and act, without exporting a statement or opening another app.",
    steps: [
      {
        icon: "Landmark",
        step: "01",
        title: "Connect every account",
        body: "Link each Nigerian bank with read-only access. Balances, income and spending flow into one live dashboard, no manual entry, no spreadsheets.",
      },
      {
        icon: "Bot",
        step: "02",
        title: "Understand it in naira",
        body: "KlarioAI sorts every transaction and answers the real questions, “where did my money go?”, “can I afford this?”, in language that models how Nigerians actually earn and spend.",
      },
      {
        icon: "Zap",
        step: "03",
        title: "Act without leaving",
        body: "Turn clarity into action in the same app: automate savings toward a goal, pay bills and airtime, and get guidance, up to a dedicated human advisor at the top tier.",
      },
    ],
  },

  // Headline numbers from our own beta research (two waves, July 2026).
  metrics: [
    { value: "331", label: "Nigerians surveyed across two research waves" },
    { value: "92%", label: "use two or more banks, accounts scattered" },
    { value: "97%", label: "still track money by hand, or not at all" },
    { value: "79%", label: "regularly lose track of where it went" },
    { value: "98%", label: "want a single, clear view of their money" },
  ],

  // Primary-research validation section.
  research: {
    label: "Beta insights",
    heading: "We didn't guess the demand.",
    emphasis: "We measured it.",
    intro: "Two research waves with 331 Nigerians, July 2026. The problem is near-universal, the appetite is proven, and no habit stands in the way.",
    signals: [
      { value: "78%", label: "call automatic spend clarity “extremely valuable”" },
      { value: "86%", label: "want all their accounts in one view" },
      { value: "71%", label: "volunteered to actively test and give feedback" },
      { value: "82%", label: "are comfortable connecting a bank to a secure app" },
      { value: "34%", label: "named a specific price they would pay" },
      { value: "84%", label: "feel anxious about not knowing where money went" },
    ],
    takeaways: [
      "The competition is a habit, not an app: 97% still track manually or from memory.",
      "The demand is not the bottleneck; trust and execution are, and both are our focus.",
      "Security is the top objection raised, and read-only access is exactly our answer.",
    ],
    source: "Klario Beta Insights, two waves combined (n = 331 / 160 / 171), July 2026.",
  },

  opportunity: {
    label: "The opportunity",
    heading: "A huge, financially active market that is",
    emphasis: "financially blind.",
    points: [
      {
        icon: "Landmark",
        title: "Fragmented by default",
        body: "Multi-banking is the norm, not the exception. No one gives Nigerians a single, honest view of their whole financial life.",
      },
      {
        icon: "Bot",
        title: "Underserved by global tools",
        body: "Foreign finance apps don't model naira inflation, local bank charges, or how Nigerians actually earn and spend.",
      },
      {
        icon: "Clock",
        title: "The timing is now",
        body: "Open banking is maturing, KYC rails are live, smartphone penetration is climbing, and AI finally makes real, personal guidance affordable at scale.",
      },
    ],
  },

  // ── Market size, target & willingness to pay (all sourced below) ──────
  // Every external figure carries a `ref` into `market.sources`. Klario's own
  // numbers come from the two-wave beta; the revenue figures are an explicit
  // illustration (subscribers × price × 12), never presented as a forecast.
  market: {
    label: "Market & willingness to pay",
    heading: "A massive digital market that",
    emphasis: "already pays for apps.",
    intro:
      "Nigeria is Africa's largest fintech market by users and by transaction volume. The money already moves digitally; what's missing is a layer that makes sense of it, and Nigerians already pay monthly for the apps they value.",

    // Headline market-size stats.
    size: [
      { value: "$703B", unit: "≈ ₦1.07 quadrillion", label: "moved through Nigeria's instant-payment rails in 2024, up 79.6% year-on-year", ref: 1 },
      { value: "64%", unit: "of adults", label: "formally financially included in 2023, up from 56% in 2020", ref: 2 },
      { value: "5 → 12%", unit: "in three years", label: "share of adults using fintech / non-bank financial services more than doubled", ref: 2 },
      { value: "$65B", unit: "by 2030", label: "projected African fintech revenue at a 32% CAGR, with Nigeria a top-three market", ref: 3 },
    ],

    // Proof the users already exist at scale.
    reach: {
      heading: "The users already exist, at scale",
      body: "Single Nigerian fintechs already count tens of millions of accounts, and the average customer holds several. That fragmentation is exactly the gap Klario closes.",
      stats: [
        { value: "40M+", label: "OPay active users" },
        { value: "30M+", label: "PalmPay users" },
        { value: "430+", label: "fintechs competing for the same wallet" },
      ],
      ref: 4,
    },

    // Who we serve and why they will pay.
    audience: {
      heading: "Who we serve, and why they'll pay",
      body: "Klario's core user is the young, digitally-native Nigerian, students first, then early-career earners, business owners and a premium tier of high-earners. They live on their phones, already juggle three to five finance apps, and are forming the money habits now that compound for decades. We land them early on a free tier and grow with them as their income does.",
      // Target-audience mix. Students are the beachhead; the free tier is the
      // on-ramp and paid tiers convert as users age into income.
      segments: [
        { label: "Students", pct: 40, primary: true },
        { label: "Employed", pct: 20 },
        { label: "Business owners", pct: 20 },
        { label: "Affluent (top ~1%)", pct: 10 },
        { label: "Others", pct: 10 },
      ],
      reasons: [
        "Students are digital-native and habit-forming: win them early and Klario becomes the money app they keep as their income grows.",
        "Every segment already pays monthly for digital value, data, airtime, streaming, so a subscription is a familiar habit, not a new behaviour.",
        "Our own beta measured the intent directly: a clear majority said they would pay, at a price we can build a business on.",
      ],
    },

    // Willingness to pay, benchmarked against what Nigerians already spend.
    pricing: {
      heading: "₦3,250 sits inside a band Nigerians already pay",
      body: "Across two research waves, 70% of respondents were open to paying for Klario, at a median of ₦3,250 per month. That is not a leap of faith, it sits squarely between the digital subscriptions Nigerians already buy every month.",
      benchmarks: [
        { name: "Spotify Premium", price: "₦1,600 / mo", ref: 5 },
        { name: "Klario", price: "₦3,250 / mo", klario: true, ref: 6 },
        { name: "Netflix", price: "₦2,500-8,500 / mo", ref: 5 },
      ],
    },

    // Illustrative revenue model — deliberately labelled, never a forecast.
    projection: {
      heading: "What that could mean",
      body: "A deliberately conservative illustration: subscription revenue alone, at the ₦3,250 beta median, before any partnership or referral upside. Even the largest step here is a small slice of a single incumbent wallet's user base.",
      columns: ["Paying members", "Subscription ARR", "Share of one incumbent's base"],
      rows: [
        ["100,000", "≈ ₦3.9B / yr", "~0.25% of OPay's users"],
        ["500,000", "≈ ₦19.5B / yr", "~1.25% of OPay's users"],
        ["1,000,000", "≈ ₦39B / yr", "~2.5% of OPay's users"],
      ],
      note: "Illustrative model, not a forecast: paying members × ₦3,250 × 12 months, subscription-only. Klario is pre-revenue; the board-reviewed projection and its assumptions live in the data room.",
    },

    sources: [
      "NIBSS instant-payment data, full-year 2024 (reported by Nairametrics & Vanguard, Jan 2025).",
      "EFInA, Access to Financial Services in Nigeria (A2F) 2023 survey.",
      "McKinsey, \"Fintech in Africa: The end of the beginning\"; analyst forecasts to 2030.",
      "Company disclosures, compiled by Fintech News Africa, 2025-26.",
      "Published Nigerian subscription pricing (TechCabal, Techloy), 2026.",
      "Klario Beta Insights, two waves combined (n = 331), July 2026.",
    ],
  },

  product: {
    label: "The product",
    heading: "Clarity, then",
    emphasis: "action.",
    intro: "Klario starts by making money clear, then turns that clarity into the everyday actions people actually need, all in one app.",
    pillars: [
      { icon: "Landmark", title: "Unified dashboard", body: "Every Nigerian bank account, one live view of balances, spending and net worth." },
      { icon: "Sparkles", title: "KlarioAI advisor", body: "An AI that speaks naira. \"Can I afford this?\" gets a real answer, not a generic tip." },
      { icon: "PiggyBank", title: "Smart savings", body: "Set a goal; Klario funds a dedicated savings wallet automatically on schedule." },
      { icon: "Zap", title: "Bill payments", body: "Airtime, data, electricity and more, paid in-app with no redirects." },
      { icon: "UserRound", title: "Human financial manager", body: "Top-tier users get a dedicated human advisor with a personal plan and monthly calls." },
    ],
  },

  model: {
    label: "Business model",
    heading: "Recurring revenue, with room to",
    emphasis: "compound.",
    streams: [
      { title: "Subscriptions", body: "A free tier for reach, and two paid tiers, Money Manager and Financial Executive, for households and power users who want automation and a human advisor. The core paid tier is priced inside the ₦2,500-4,000 band our beta community said they would pay (median ₦3,250), with the free tier as the on-ramp." },
      { title: "Partnerships", body: "Distribution and product partnerships with regulated financial institutions that want to reach engaged, verified, financially active users." },
      { title: "Referrals", body: "Warm, permissioned introductions to vetted savings and investment products, on the user's terms." },
    ],
    note: "Klario is not a bank and never custodies funds. Regulated money movement is carried out by licensed partners on the user's instruction, so the model scales without Klario taking on banking-license risk directly.",
  },

  // Capability tiers (from the brief). No prices shown, capabilities only.
  tiers: {
    label: "How it earns",
    heading: "Freemium, sold as one-time upgrades,",
    emphasis: "trust-first by design.",
    intro: "Three tiers, sold as one-time payments rather than silent auto-renewals. Higher tiers unlock more linked banks, more KlarioAI, and priority support, and the business-versus-personal engine pulls SME users toward paid plans.",
    columns: ["Capability", "Free", "Money Manager", "Financial Executive"],
    rows: [
      ["Linked bank accounts", "1", "3", "10"],
      ["KlarioAI messages / month", "5", "30", "100"],
      ["Data export (NDPR)", "Yes", "Yes", "Yes"],
      ["Priority support", "No", "No", "Yes"],
    ],
    note: "Business-versus-personal intelligence (commingling alerts, monthly report, tax-impact estimates) is gated to solo-founder and SME account types, independent of plan tier.",
    proof: [
      { value: "~80", label: "local spending contexts the engine recognises (jollof, Uber, DSTV, FIRS, and more)" },
      { value: "30%", label: "company tax rate that mis-booked personal spend is needlessly exposed to" },
      { value: "Read-only", label: "no money-movement licence, capital, or fraud liability on Klario today" },
    ],
  },

  // The two investor tracks the founders defined.
  tracks: [
    {
      id: "bank",
      icon: "Building2",
      kicker: "For banks & financial institutions",
      title: "Bank & strategic investors",
      body: "Partner with Klario to reach a verified, engaged, multi-banked audience, gain permissioned insight into real financial behaviour, and co-build features that drive deposits, retention and cross-sell.",
      points: [
        "Distribution to financially active, KYC-verified users",
        "A clarity layer that sits above accounts, not competing with your core",
        "Co-built savings, lending and deposit journeys",
        "Aggregated, consented insight into how customers actually manage money",
      ],
      cta: { label: "Request the partnership brief", href: "mailto:invest@klario.finance?subject=Klario%20partnership%20brief%20request" },
    },
    {
      id: "financial",
      icon: "TrendingUp",
      kicker: "For VCs, angels & funds",
      title: "Financial & return investors",
      body: "Back the team building the default money app for the largest market in Africa, at the moment open banking, KYC and AI have all finally arrived at once.",
      points: [
        "Large, underpenetrated market with clear willingness to pay",
        "Recurring subscription revenue with partnership upside",
        "Asset-light model: licensed partners carry money-movement risk",
        "AI-native product with a widening data and guidance moat",
      ],
      cta: { label: "Request the investor brief", href: "mailto:invest@klario.finance?subject=Klario%20investor%20brief%20request" },
    },
  ],

  // ── Competitive landscape ────────────────────────────────────────────
  // Competitor claims re-verified 2026-07-15. These products move fast, so
  // re-check every cell before each investor send. Findings from this review:
  //   - Revolut: core model = you bank with it; only a "Limited" AI assistant;
  //     not available in NG. Cells OK.
  //   - Emma: live PFM aggregator, cells OK. ⚠️ MINT WAS DISCONTINUED by Intuit
  //     (closed to users ~Mar 2024, folded into Credit Karma). Listing it as a
  //     current competitor is outdated - drop "Mint" or swap in a live
  //     aggregator before this goes to investors.
  //   - Cleo: connects accounts via Plaid, so "Sits on your existing banks" is
  //     arguably "Yes" rather than "Partly"; AI advisor "Yes" OK; not in NG.
  //   - PiggyVest / Cowrywise: custody funds, NG-native, no AI advisor, no
  //     business-vs-personal. All cells OK.
  //   - Kuda / Carbon: you bank with them, NG-native. ⚠️ Kuda now ships an AI
  //     assistant ("Ada") - "AI money advisor" may be "Limited" not "No"; verify
  //     current scope before relying on the "No".
  competitors: {
    label: "The landscape",
    heading: "Everyone owns a slice.",
    emphasis: "No one owns the clarity layer.",
    intro: "Neobanks want you to bank with them. Savings apps do one job. PFM aggregators exist abroad, but none are naira-native. Klario sits on top of the banks Nigerians already use and turns them into one clear, intelligent view.",
    columns: ["", "Category", "Sits on your existing banks", "Nigeria-native", "AI money advisor", "Business vs personal"],
    rows: [
      { name: "Klario", cat: "Money-clarity layer", klario: true, cells: ["Yes", "Yes", "Yes", "Yes"] },
      { name: "Revolut (UK)", cat: "Neobank / super-app", klario: false, cells: ["No, you bank with it", "No", "Limited", "No"] },
      { name: "Emma / Mint (UK-US)", cat: "PFM aggregator", klario: false, cells: ["Yes", "No", "Limited", "No"] },
      { name: "Cleo (US-UK)", cat: "AI budgeting chat", klario: false, cells: ["Partly", "No", "Yes", "No"] },
      { name: "PiggyVest / Cowrywise", cat: "Savings & invest", klario: false, cells: ["No, holds funds", "Yes", "No", "No"] },
      { name: "Kuda / Carbon", cat: "Neobank / lending", klario: false, cells: ["No, you bank with it", "Yes", "No", "No"] },
    ],
    diff: {
      heading: "What we do differently",
      points: [
        { title: "On top, not instead", body: "We don't ask people to move banks. Klario reads the accounts they already have, so adoption has no switching cost." },
        { title: "Naira-native intelligence", body: "KlarioAI understands local merchants, charges and habits, guidance built for how Nigerians actually earn and spend, not a foreign template." },
        { title: "The SME wedge", body: "Automatic business-versus-personal separation (commingling) is a clean-books tool no incumbent offers, a direct line into the formalising SME segment." },
        { title: "Asset-light by design", body: "Read-only today means no money-transmission licence, capital requirement or fraud liability, so we ship faster and burn less than money-movement fintechs." },
      ],
    },
  },

  // ── How we run (cost structure) ──────────────────────────────────────
  economics: {
    label: "How we run",
    heading: "Lean by architecture,",
    emphasis: "not by cost-cutting.",
    intro: "Because Klario reads money instead of moving it, there's no float, settlement, capital reserve or fraud liability to fund. The cost base is small and mostly variable, so gross margin widens as the user base grows.",
    drivers: [
      { title: "Cloud & database", body: "A single modern hosting and database stack. Low fixed cost that amortises across every new user." },
      { title: "AI inference", body: "Pay-per-use on a hosted model, tied to actual KlarioAI usage and capped per tier, so cost tracks revenue." },
      { title: "Open banking & KYC", body: "Per-active-user fees to licensed partners for account linking and identity checks. Variable, and only on engaged users." },
      { title: "No money-movement cost", body: "Zero float, settlement, chargeback or transmission-licence overhead, the largest cost centre for most fintechs, is simply absent." },
    ],
    note: "Detailed unit economics (cost per active user, gross margin by tier, blended CAC and payback) are in the data room.",
  },

  // ── Five-year outlook (levers, not a fabricated P&L) ─────────────────
  outlook: {
    label: "Five-year outlook",
    heading: "The model compounds on",
    emphasis: "three levers.",
    intro: "We're pre-revenue and in beta, so we don't publish a fixed five-year P&L here. Instead, here's how the model grows. The board-reviewed projection, with the assumptions behind it, lives in the data room.",
    levers: [
      { phase: "Years 1-2", title: "Trust & reach", body: "Grow the free, read-only base and prove retention. Revenue is early subscription; the priority is engaged, verified users and a low-cost growth loop." },
      { phase: "Years 2-4", title: "Monetise clarity", body: "Convert to paid tiers and the SME business-versus-personal wedge. Subscription ARPU rises as automation and the human-advisor tier mature." },
      { phase: "Years 4-5", title: "Orchestration upside", body: "With a licensed partner, transaction-linked revenue layers on top of subscriptions, once users already rely on Klario to understand their money." },
    ],
    note: "Figures in any projection are illustrative and assumption-driven; Klario is pre-revenue. The full model is available under NDA in the data room.",
  },

  ask: {
    label: "The raise",
    heading: "We're building the money app Nigeria",
    emphasis: "actually needs.",
    body: "Klario is currently in private beta on a controlled test environment while we complete our regulatory and partner licensing. We're speaking with strategic and financial investors who want in early. The investor brief covers our roadmap, model and the round; the data room has the detail.",
    primaryCta: { label: "Download the investor brief", href: "/Klario-Investor-Brief.pdf" },
    secondaryCta: { label: "Talk to the founders", href: "mailto:invest@klario.finance?subject=Intro%20call" },
    // TODO(legal): counsel to review this disclaimer. The page pairs an
    // "informational only / not an offer or solicitation" statement with live
    // investor-solicitation CTAs ("Talk to the founders", "Request the investor
    // brief", mailto:invest@). Confirm the disclaimer and the active solicitation are
    // compatible under NG (ISA / SEC Nigeria) and any target-investor
    // jurisdiction before publishing. Do not change the wording without sign-off.
    disclaimer: "This page is informational only and is not an offer to sell or a solicitation to buy any security. Klario is operated by Raavon Limited (RC-9537604). Figures shared in the deck are subject to change.",
  },
} as const;

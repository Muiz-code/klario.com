# KLARIO.COM — Full Website Build Prompt
> Single source of truth for every design and dev decision.

---

## 01. WHAT IS KLARIO

Klario is an AI-powered Personal Finance Management (PFM) app.
It connects all your Nigerian bank accounts into one intelligent
dashboard, tracks your spending with AI, automates savings into
a real bank account, pays your bills, and gives premium users
a real human financial manager.

Tagline: "Your money, finally making sense."
Sub-tagline: "One app. Every account. Full clarity."
Target: Nigerian consumers — Gen Z, millennials, working class
App status: Coming soon — download routing goes to waitlist

---

## 02. VIBE & AESTHETIC

This is NOT a generic fintech website.
This is where Gen Z energy meets working-class seriousness.
Think: dark, premium, alive, interactive, trustworthy but cool.

References:
- Linear.app (clean, fast, premium dark)
- Stripe (trust + polish)
- Raycast (Gen Z dark aesthetic)
- But Nigerian — warm, bold, unapologetic

Mood: Dark. Bold. Interactive. Alive. Trustworthy.
NOT: Corporate. Stiff. Generic. Gradient-heavy. Boring.

---

## 03. COLOURS

```css
:root {
  /* Klario Primary */
  --gold:        #D4A853;   /* Kairo legacy gold — premium */
  --gold-dim:    rgba(212,168,83,0.12);
  --charcoal:    #080809;   /* Near black — primary bg */
  --off-white:   #F0EDE6;   /* Warm white — primary text */
  --dark-card:   #111111;   /* Card surfaces */
  --dark-surf:   #0D0D0E;   /* Slightly lifted surface */
  --muted:       rgba(240,237,230,0.45);
  --border:      rgba(212,168,83,0.12);

  /* Accent — Gen Z pop */
  --accent-green: #00FF87;  /* Success, security, live states */
  --accent-blue:  #4FACFE;  /* AI, intelligence, data */
  --accent-warm:  #FF6B35;  /* CTAs, urgency, energy */
}
```

Dark mode default. Light mode optional toggle.

---

## 04. TYPOGRAPHY

```
Display:  Syne (800) — bold, geometric, Gen Z energy
Body:     Inter (300, 400, 500) — clean, readable, trustworthy
Mono:     JetBrains Mono — for amounts, account numbers, data
Accent:   Fraunces italic — for emotional pull quotes

Load via next/font/google
```

---

## 05. FILE STRUCTURE

```
klario.com/
├── app/
│   ├── layout.tsx           # Fonts, metadata, providers
│   ├── page.tsx             # Home — all sections
│   ├── globals.css          # CSS vars, resets
│   ├── not-found.tsx        # 404
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.ts
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Sticky nav, logo, CTA
│   │   └── Footer.tsx
│   │
│   ├── sections/
│   │   ├── Hero.tsx         # Full viewport hero
│   │   ├── Problem.tsx      # The Nigerian money problem
│   │   ├── Solution.tsx     # What Klario solves
│   │   ├── Features.tsx     # 5 core features
│   │   ├── HowItWorks.tsx   # 3-step flow
│   │   ├── Security.tsx     # Security layers
│   │   ├── Pricing.tsx      # 3 tiers
│   │   ├── Testimonials.tsx # Social proof
│   │   └── Download.tsx     # App store CTAs
│   │
│   ├── ui/
│   │   ├── Loader.tsx       # Parallax loader
│   │   ├── Cursor.tsx       # Custom cursor
│   │   ├── PhoneMockup.tsx  # Interactive phone
│   │   ├── FloatingCard.tsx # Animated bank card
│   │   ├── CountUp.tsx      # Number counter
│   │   ├── ScrollReveal.tsx
│   │   └── GlowOrb.tsx      # Ambient orb
│   │
│   └── providers/
│       ├── ThemeProvider.tsx
│       └── SmoothScroll.tsx
│
├── hooks/
│   ├── useScrollProgress.ts
│   ├── useParallax.ts
│   ├── useCountUp.ts
│   └── useCursor.ts
│
├── lib/
│   ├── constants.ts         # All copy, features, pricing
│   ├── metadata.ts          # SEO config
│   └── utils.ts
│
├── public/
│   ├── og-image.png
│   ├── favicon.ico
│   └── app-screens/         # Phone mockup screenshots
│
├── styles/
│   └── animations.css
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── PROMPT.md
```

---

## 06. LOADER — PARALLAX

Full screen parallax loader. This is the first impression.

```
Phase 1 (0–400ms):
  Dark screen. Gold dot appears center. Pulses.

Phase 2 (400–900ms):
  "K" appears — large, center, Syne 800
  Gold. Sharp. No animation yet.

Phase 3 (900–1400ms):
  "lario" slides out from inside the K — letter by letter
  Each letter has a slight parallax depth offset
  "Klario" now complete and glowing softly

Phase 4 (1400–1900ms):
  Tagline fades up below: "Your money, finally making sense."
  In Fraunces italic, gold-dim colour

Phase 5 (1900–2400ms):
  Everything scales down slightly, fades out
  Page content fades in underneath

Implementation:
  framer-motion AnimatePresence + variants
  useEffect sequence with setTimeout or motion timeline
  Remove from DOM after exit — not just hidden
```

---

## 07. NAVBAR

```
Position: Fixed, full width, z-50
Height: 64px
Background: transparent → blur(dark) on scroll

Left: Klario logo (text mark, Syne 800, gold)
Center: Nav links — Features, Security, Pricing, About
Right: [Get Early Access] button — gold, solid

Mobile: Hamburger → fullscreen overlay menu
        Links animate in one by one with framer-motion

Scroll behaviour:
  0px: transparent, no border
  80px+: backdrop-blur-md, border-bottom 1px gold-dim
```

---

## 08. HERO SECTION

This is the most critical section. Make it cinematic.

```
Layout: Full viewport (100dvh), dark bg
        Two columns on desktop, stacked on mobile

LEFT COLUMN:
  Eyebrow badge (animated pill):
    [🟢 AI-Powered  ·  Nigerian Banks  ·  Coming Soon]
    Green pulse dot, gold border, dark fill
    Scrolling marquee text inside

  Headline (large, Syne 800):
    Line 1: "Your money,"     — off-white
    Line 2: "finally"         — gold, slight glow
    Line 3: "making sense."   — off-white
    Each line animates in from bottom with spring physics

  Subtext:
    "Connect every Nigerian bank account. Track every naira.
     Save automatically. Pay bills without leaving the app.
     All powered by AI that actually understands you."
    Inter 300, muted, max-width 480px

  CTA row:
    [Download on iOS ↗]      — gold solid button
    [Get on Android ↗]       — gold border button
    Both route to waitlist/app store
    Subtle hover: scale 1.02, glow

  Trust badges below CTAs:
    🔒 CBN Compliant    🛡️ Bank-Grade Security
    ⚡ 256-bit Encrypted    ✓ BVN Protected
    Small, muted, with Lucide icons

RIGHT COLUMN — PHONE MOCKUP:
  Floating phone frame (CSS + framer-motion)
  Shows Klario dashboard screen inside
  Animated elements on screen:
    - Balance number counts up: ₦0 → ₦847,320
    - Spending bar fills left to right
    - 3 bank logos appear one by one
    - AI insight card slides up from bottom
  Phone floats with subtle parallax on mouse move
  Soft gold glow behind phone

BACKGROUND:
  Dark charcoal
  2-3 ambient gold orbs, blurred, drifting slowly
  Grain texture overlay (fixed, 0.3 opacity)
  Subtle grid lines (very faint, 1px, gold 3% opacity)
```

---

## 09. PROBLEM SECTION

```
Section label: "THE PROBLEM"
Heading: "Nigerians are financially
          active — but financially blind."

3 problem cards (horizontal on desktop, stacked mobile):
  Card 1: 🏦 "Multiple Banks, Zero Visibility"
    "The average Nigerian has accounts across 3-5 banks
     with no unified view of their actual financial health."
    Stat: 217M+ Nigerians

  Card 2: 🤖 "No Localised Guidance"
    "Global finance apps don't understand naira inflation,
     bank charges, or Nigerian spending patterns."
    Stat: <4% use any PFM tool

  Card 3: 💸 "Silent Financial Leakage"
    "Without clarity, money disappears — on charges, on
     duplicate subscriptions, on things you forgot about."
    Stat: ₦Billions lost monthly

Card animation: on scroll, each card slides up with stagger delay
Card style: dark card, gold left border accent, subtle hover glow
```

---

## 10. SOLUTION / FEATURES SECTION

```
Section label: "HOW KLARIO HELPS"
Heading: "One app. Every account. Full clarity."

5 Feature tabs (horizontal scroll on mobile):
  Tab 1: 🏦 Unified Dashboard
    Title: "All your banks. One screen."
    Desc: "Connect every Nigerian bank account and see your
           real net worth, spending, and balances — live."
    Visual: Animated dashboard showing multiple bank logos

  Tab 2: 🤖 KlarioAI
    Title: "Your AI financial advisor."
    Desc: "Ask anything. 'How much did I spend on food?'
           'Can I afford this?' Get real answers, not generic tips."
    Visual: Chat interface with AI responses animating in

  Tab 3: 💰 Smart Savings
    Title: "Save without thinking about it."
    Desc: "Set a goal. Klario creates a real bank savings account
           in your name and funds it automatically on schedule."
    Visual: Savings goal progress bar filling up

  Tab 4: ⚡ Bill Payments
    Title: "Airtime. Data. Electricity. One tap."
    Desc: "Pay every bill without leaving Klario. No redirects,
           no third-party screens. Just done."
    Visual: Bill payment icons with check marks appearing

  Tab 5: 👔 Financial Manager
    Title: "A real human in your corner."
    Desc: "Financial Executive users get a dedicated human
           financial manager. Monthly calls. Personal plan."
    Visual: Calendar with strategy call scheduled

Tab switching: framer-motion AnimatePresence
Active tab: gold underline, content slides in from right
```

---

## 11. HOW IT WORKS

```
Section label: "GET STARTED"
Heading: "Three steps to financial clarity."

Step 1: 📱 Download Klario
  "Available on iOS and Android. Takes 60 seconds to install."

Step 2: 🔗 Connect Your Banks
  "Securely link all your Nigerian bank accounts.
   Your credentials never touch our servers."

Step 3: 💡 Get Clarity
  "Klario analyses your finances and gives you
   a complete picture — instantly."

Design: Large step numbers (Syne 800, very large, gold, low opacity)
        Content beside each number
        Connecting line between steps (animated, draws on scroll)
        Each step fades in with stagger
```

---

## 12. SECURITY SECTION

```
Section label: "BANK-GRADE SECURITY"
Heading: "Your data is safer here
          than anywhere else."

Subtext: "We are obsessed with security. Not because we have to be.
          Because your financial data deserves nothing less."

Security grid — 6 cards, 3x2:

  🔐 Biometric Authentication
    "Face ID or fingerprint required every session.
     No one gets in but you."

  🛡️ 256-bit AES Encryption
    "Every piece of your data — encrypted end to end,
     at rest and in transit. Always."

  🏦 BVN Verification
    "Every user verified against their Bank Verification
     Number. Zero fake accounts."

  🔑 Zero Knowledge Storage
    "Your bank credentials never touch Klario's servers.
     We read data — we never store passwords."

  ⚡ HMAC-SHA512 Webhooks
    "Every payment callback cryptographically verified
     before a single naira moves."

  📊 Row-Level Security
    "Database rules ensure no user can ever access
     another user's data. Architecturally impossible."

Bottom banner:
  "VAPT Audited  ·  NDPC Compliant  ·  CBN Framework"
  Gold text, dark background strip

Card style: dark card, green glow on hover (security = safe = green)
Each card: Lucide icon, title, description
Animation: stagger fade-up on scroll
```

---

## 13. PRICING SECTION

```
Section label: "SIMPLE PRICING"
Heading: "Start free. Upgrade when you're ready."

Toggle: Monthly / Annual (annual saves ~10%)

3 Tier cards:

  FREE — ₦0/month
    1 bank connection
    5 KlarioAI queries/month
    Basic balance dashboard
    Budget alerts
    ₦10 per transaction
    [Get Started Free]

  MONEY MANAGER — ₦2,900/month  ← MOST POPULAR badge
    3 bank connections
    15 KlarioAI queries/day
    Automated budget engine
    4-tier debt risk scoring
    In-app bill payments
    Transaction export PDF/CSV
    Bank-integrated savings goals
    Push notifications
    ₦10 per transaction
    [Start Money Manager]

  FINANCIAL EXECUTIVE — ₦9,900/month
    Unlimited bank connections
    30 KlarioAI queries/day
    Everything in Money Manager
    Dedicated human financial manager
    Monthly 1-on-1 strategy call
    Personalised financial plan (quarterly)
    Investment partner referrals
    Zero transfer fees
    Priority support (2hr response)
    [Go Executive]

Card animation: middle card slightly elevated, gold border, subtle glow
Toggle: smooth price swap with framer-motion number animation
```

---

## 14. DOWNLOAD / CTA SECTION

```
Full width. Dark bg. Gold ambient glow center.
Ghost watermark: "KLARIO" — large, faint behind content

Heading (large, centered):
  "Take control of your money."
  "Download Klario today."

Subtext:
  "Join thousands of Nigerians already on the waitlist."

CTA buttons:
  [📱 Download on iOS]     — gold solid
  [🤖 Get on Android]      — gold border
  Both link to waitlist form or app store

Waitlist input (if app not live):
  Email input + [Join Waitlist] button
  "No spam. We'll only message when we launch."

Below buttons — social proof numbers (count up on scroll):
  [ 10,000+ ] Waitlist     [ 5 ] Nigerian Banks    [ 3 ] Revenue Streams
```

---

## 15. FOOTER

```
Top: gold gradient rule line

4 column grid:
  Col 1: Klario logo + tagline + social links
  Col 2: Product — Features, Pricing, Security, Download
  Col 3: Company — About, Blog, Careers, Press
  Col 4: Legal — Privacy Policy, Terms, Cookie Policy

Bottom strip:
  "© 2026 Klario Financial Technology. All rights reserved."
  "Klario is not a bank. We are a financial intelligence platform."
```

---

## 16. MOBILE & TABLET INTERACTIONS

```
Mobile specific:
  - Bottom sticky CTA bar: [Download Klario ↓]
  - Swipeable feature cards (touch gesture)
  - Phone mockup responds to device tilt (DeviceOrientation API)
  - Tap to reveal security card details

Tablet specific:
  - Side-by-side layout for features (not full desktop)
  - Swipeable pricing cards
  - Touch-optimised tab switching

Desktop specific:
  - Custom gold cursor with lagging ring
  - Phone mockup follows mouse parallax
  - Magnetic buttons (slight pull toward cursor)
  - Scroll-triggered number counters
```

---

## 17. PERFORMANCE RULES

```
- Use next/image for ALL images
- Use next/font for ALL fonts — never CDN
- Lazy load all sections below the fold
- Framer-motion: import only what you use
  import { motion } from "framer-motion"  ✓
  import framer from "framer-motion"      ✗
- No heavy libraries — no GSAP, no Three.js
- Target: Lighthouse score 90+
- Core Web Vitals: LCP < 2.5s, CLS < 0.1
- Preload hero fonts and hero image
- Use will-change: transform only on animated elements
- Remove loader from DOM after animation (not display:none)
```

---

## 18. SEO

```tsx
export const metadata = {
  title: 'Klario — Your Money, Finally Making Sense',
  description: 'Klario is an AI-powered personal finance app for Nigerians. Connect all your bank accounts, track spending with AI, automate savings, and pay bills — all in one place.',
  keywords: 'Klario, personal finance Nigeria, AI finance app, bank account tracker Nigeria, budgeting app Nigeria, KlarioAI',
  openGraph: {
    title: 'Klario — Your Money, Finally Making Sense',
    description: 'One app. Every account. Full clarity.',
    url: 'https://klario.finance',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}
```

---

## 19. ANIMATIONS REFERENCE

```tsx
// Page section reveal
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
}

// Stagger children
const containerVariants = {
  visible: { transition: { staggerChildren: 0.1 } }
}

// Hero headline lines
const lineVariants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
}

// Phone mockup float
const floatVariants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
}

// Loader sequence
const sequence = async (animate) => {
  await animate("#dot", { scale: [0, 1] }, { duration: 0.3 })
  await animate("#k", { opacity: [0, 1] }, { duration: 0.3 })
  await animate("#lario", { x: [-20, 0], opacity: [0, 1] }, { duration: 0.5 })
  await animate("#tagline", { opacity: [0, 1], y: [10, 0] }, { duration: 0.4 })
  await animate("#loader", { opacity: [1, 0] }, { duration: 0.4, delay: 0.5 })
}
```

---

## 20. INSTALL COMMANDS

```bash
# 1. Create Next.js project
npx create-next-app@latest klario.com \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

# 2. Enter the folder
cd klario.com

# 3. Install all dependencies
npm install framer-motion
npm install lucide-react
npm install next-themes
npm install clsx
npm install tailwind-merge

# 4. Dev server
npm run dev
```

---

*PROMPT.md — Klario Financial Technology · klario.finance · 2026*
*Your money, finally making sense.*

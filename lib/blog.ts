import type { Block } from "@/lib/legal";

export type BlogSection = {
  title?: string;
  blocks: Block[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  publishedAtIso: string;
  readTime: string;
  author: { name: string; role: string };
  /** Optional cover photo. When unset, a branded graphic cover is generated. */
  image?: string;
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-nigerians-need-unified-money-view",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1280&q=70",
    title: "Why Nigerians Need a Unified View of Their Money",
    excerpt:
      "Most Nigerians use three or more bank accounts. Without a single dashboard, it's nearly impossible to know where your naira actually goes each month.",
    category: "Personal Finance",
    publishedAt: "12 June 2026",
    publishedAtIso: "2026-06-12",
    readTime: "5 min read",
    author: { name: "Klario Team", role: "Product" },
    sections: [
      {
        blocks: [
          {
            type: "p",
            text: "If you bank with GTBank, hold savings at Kuda, and receive freelance payments through Opay, you're not unusual, you're the average Nigerian. The problem isn't having multiple accounts. It's that no single account tells the full story of your financial life.",
          },
          {
            type: "p",
            text: "Every app shows you its own slice of reality. Your salary lands in one account, rent leaves from another, and daily spending happens across three different cards. By month-end, reconciling everything in a spreadsheet feels like a second job.",
          },
        ],
      },
      {
        title: "The hidden cost of fragmentation",
        blocks: [
          {
            type: "p",
            text: "When your money is scattered, three things break down almost immediately:",
          },
          {
            type: "list",
            items: [
              "You underestimate spending because each app only shows its own transactions",
              "Savings goals stall because surplus cash sits invisible in low-yield accounts",
              "Bill payments get missed when due dates live in different banking apps",
            ],
          },
          {
            type: "p",
            text: "Research consistently shows that people who see all their accounts in one place save more and stress less. Not because they earn more, but because clarity removes the guesswork.",
          },
        ],
      },
      {
        title: "What a unified view actually looks like",
        blocks: [
          {
            type: "p",
            text: "A true unified dashboard isn't just a list of balances. It connects the dots: total net worth across banks, spending by category regardless of which card you used, and automated alerts when you're trending over budget before the month ends.",
          },
          {
            type: "p",
            text: "Klario was built around this idea. Connect every Nigerian bank account once, and let AI categorise every transaction, so you always know where you stand, not where one app thinks you stand.",
          },
        ],
      },
      {
        title: "Start with clarity, not complexity",
        blocks: [
          {
            type: "p",
            text: "You don't need a finance degree to take control. Start by linking your accounts, review your spending categories for one week, and set a single savings target. The unified view does the heavy lifting; you just make better decisions with better information.",
          },
          {
            type: "p",
            text: "Ready to see your full financial picture? Join the Klario beta and connect your first account in under two minutes.",
          },
        ],
      },
    ],
  },
  {
    slug: "signs-you-need-a-finance-app",
    image:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1280&q=70",
    title: "5 Signs You Need a Personal Finance App in 2026",
    excerpt:
      "Still tracking expenses in your head or a WhatsApp note? Here are five clear signals that it's time for a smarter approach to managing your naira.",
    category: "Money Tips",
    publishedAt: "5 June 2026",
    publishedAtIso: "2026-06-05",
    readTime: "4 min read",
    author: { name: "Klario Team", role: "Product" },
    sections: [
      {
        blocks: [
          {
            type: "p",
            text: "Personal finance apps aren't just for people with complicated portfolios. If you earn, spend, and save in naira, you already have enough moving parts to benefit from a dedicated tool. Here are five signs the spreadsheet-or-memory approach isn't cutting it anymore.",
          },
        ],
      },
      {
        title: "1. You can't answer \"where did my money go?\"",
        blocks: [
          {
            type: "p",
            text: "If checking your balance mid-month feels like a surprise, sometimes pleasantly, often not, you're flying blind. A finance app categorises every debit automatically so the answer is always one tap away.",
          },
        ],
      },
      {
        title: "2. You use more than two bank accounts",
        blocks: [
          {
            type: "p",
            text: "Multiple accounts are smart for separating savings, business, and daily spending. But without aggregation, you're manually adding up balances every time you need the real number.",
          },
        ],
      },
      {
        title: "3. Savings happen by accident, not design",
        blocks: [
          {
            type: "p",
            text: "If you only save what's left at month-end, and some months nothing is left, automated savings rules can move money before you have a chance to spend it. Even ₦5,000 per week adds up to ₦260,000 a year.",
          },
        ],
      },
      {
        title: "4. Bills catch you off guard",
        blocks: [
          {
            type: "p",
            text: "Rent, DSTV, data subscriptions, electricity, recurring payments scattered across apps make it easy to miss one. Centralised bill tracking with reminders prevents the ₦50 charge for a failed auto-debit.",
          },
        ],
      },
      {
        title: "5. You want insights, not just records",
        blocks: [
          {
            type: "p",
            text: "The best finance apps don't just show transactions, they surface patterns. Are you spending 40% of income on food delivery? Is your transport cost rising month over month? AI-driven insights turn raw data into actionable advice.",
          },
          {
            type: "p",
            text: "If two or more of these sound familiar, it's worth trying a purpose-built tool. Klario combines account aggregation, AI categorisation, and automated savings, built specifically for how Nigerians manage money.",
          },
        ],
      },
    ],
  },
  {
    slug: "ai-changing-money-management-nigeria",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1280&q=70",
    title: "How AI Is Changing Money Management in Nigeria",
    excerpt:
      "From smart categorisation to personalised savings nudges, artificial intelligence is making personal finance accessible to millions of Nigerians for the first time.",
    category: "Technology",
    publishedAt: "28 May 2026",
    publishedAtIso: "2026-05-28",
    readTime: "6 min read",
    author: { name: "Klario Team", role: "Product" },
    sections: [
      {
        blocks: [
          {
            type: "p",
            text: "Artificial intelligence isn't just for chatbots and image generators anymore. In personal finance, AI is quietly solving problems that have frustrated Nigerian savers for years, messy transaction data, inconsistent merchant names, and advice that doesn't fit local spending patterns.",
          },
        ],
      },
      {
        title: "Smarter categorisation, less manual work",
        blocks: [
          {
            type: "p",
            text: "Nigerian bank statements are notoriously inconsistent. The same Uber ride might appear as \"UBER BV\", \"UBER TRIP\", or a string of numbers. Manual categorisation means hours of cleanup every month.",
          },
          {
            type: "p",
            text: "Modern AI models learn from transaction patterns, merchant names, amounts, timing, and frequency, to assign categories automatically with high accuracy. The more you use it, the better it gets at recognising your specific habits.",
          },
        ],
      },
      {
        title: "Personalised insights, not generic tips",
        blocks: [
          {
            type: "p",
            text: "Generic advice like \"save 20% of your income\" ignores reality. AI can analyse your actual cash flow and suggest realistic targets: maybe ₦15,000 weekly is achievable this month, but ₦25,000 isn't until you reduce a specific subscription.",
          },
          {
            type: "list",
            items: [
              "Spending alerts tailored to your income cycle, not arbitrary calendar dates",
              "Savings recommendations based on surplus patterns, not fixed percentages",
              "Bill reminders timed to when you typically have sufficient balance",
            ],
          },
        ],
      },
      {
        title: "Security that scales with intelligence",
        blocks: [
          {
            type: "p",
            text: "AI also powers fraud detection, flagging unusual transactions, duplicate charges, and spending spikes that might indicate a compromised account. For a country where digital payment fraud is a growing concern, proactive alerts matter.",
          },
          {
            type: "p",
            text: "At Klario, AI runs on aggregated data with bank-grade encryption. We never sell your data, and insights are generated to help you, not advertisers.",
          },
        ],
      },
      {
        title: "The future is already here",
        blocks: [
          {
            type: "p",
            text: "You don't need to wait for some distant future where AI manages your money. The tools exist today, and they're getting better every month. The question is whether you'll use them to gain clarity or keep reconciling spreadsheets manually.",
          },
          {
            type: "p",
            text: "Experience AI-powered finance built for Nigeria. Join the Klario beta and see what your money looks like when technology works for you.",
          },
        ],
      },
    ],
  },
  {
    slug: "build-emergency-fund-nigerian-salary",
    image:
      "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1280&q=70",
    title: "How to Build an Emergency Fund on a Nigerian Salary",
    excerpt:
      "An emergency fund is the difference between a setback and a crisis. Here is a realistic way to build one, even when prices keep climbing and income feels stretched.",
    category: "Savings",
    publishedAt: "18 June 2026",
    publishedAtIso: "2026-06-18",
    readTime: "6 min read",
    author: { name: "Klario Team", role: "Product" },
    sections: [
      {
        blocks: [
          {
            type: "p",
            text: "A burst tyre, a sudden hospital bill, a phone that finally gives up at the worst moment. Emergencies do not check your account balance before they arrive. An emergency fund is simply cash set aside so that life's surprises do not push you into debt or force you to sell something you need.",
          },
          {
            type: "p",
            text: "The good news is that you do not need a big salary to start. You need a system that runs whether or not you remember it.",
          },
        ],
      },
      {
        title: "Start with one month, not six",
        blocks: [
          {
            type: "p",
            text: "The usual advice to save three to six months of expenses is sound, but it can feel so far away that people never begin. Flip it. Your first goal is one month of essential expenses: rent share, food, transport, data, and any debt repayment.",
          },
          {
            type: "p",
            text: "Hitting one month proves the habit works and gives you a real cushion. From there, each additional month is easier because the routine already exists.",
          },
        ],
      },
      {
        title: "Pay your fund first",
        blocks: [
          {
            type: "p",
            text: "Saving whatever is left at month end rarely works, because there is usually nothing left. Instead, move a fixed amount the day your salary lands, before you spend on anything else.",
          },
          {
            type: "list",
            items: [
              "Pick an amount you will not miss, even if it is only 5,000 naira a month",
              "Automate the transfer so it happens without a decision each time",
              "Keep the money in a separate account you do not carry a card for",
            ],
          },
          {
            type: "p",
            text: "Friction is your friend here. The harder it is to dip into the fund for a non-emergency, the longer it survives.",
          },
        ],
      },
      {
        title: "Protect it from yourself",
        blocks: [
          {
            type: "p",
            text: "Define what counts as an emergency before one happens. A medical bill qualifies. A flash sale does not. Writing the rule down while you are calm makes it far easier to follow when you are tempted.",
          },
          {
            type: "p",
            text: "Klario lets you ring-fence a savings goal, automate the transfer on payday, and see the balance grow next to the rest of your money, so the fund stays out of sight but never out of mind.",
          },
        ],
      },
    ],
  },
  {
    slug: "budgeting-methods-irregular-income",
    image:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1280&q=70",
    title: "Budgeting Methods That Actually Work for Irregular Income",
    excerpt:
      "Freelancers, traders, and side-hustlers rarely earn the same amount twice. These budgeting methods are built for months that swing high and low.",
    category: "Budgeting",
    publishedAt: "9 June 2026",
    publishedAtIso: "2026-06-09",
    readTime: "5 min read",
    author: { name: "Klario Team", role: "Product" },
    sections: [
      {
        blocks: [
          {
            type: "p",
            text: "Most budgeting advice assumes a fixed salary that arrives on the same day every month. For a growing number of Nigerians, income does not work that way. One month is plenty, the next is lean, and a third disappears entirely. Budgeting still works, but the method has to fit the reality.",
          },
        ],
      },
      {
        title: "Budget on your average, not your best month",
        blocks: [
          {
            type: "p",
            text: "Add up your income over the last six months and divide by six. That average, not your highest month, is the number you build your spending around. It keeps you from inflating your lifestyle on a good month and panicking on a slow one.",
          },
        ],
      },
      {
        title: "Use a baseline budget",
        blocks: [
          {
            type: "p",
            text: "Work out the minimum it costs to keep your life running for a month: rent, food, transport, utilities, and essential debt. This baseline is the target every working month must cover first.",
          },
          {
            type: "list",
            items: [
              "On a strong month, fund your baseline, then top up savings and your buffer",
              "On a weak month, the baseline tells you exactly how much you must still earn",
              "Anything above baseline is for goals, not for spending by default",
            ],
          },
        ],
      },
      {
        title: "Build a buffer that smooths the swings",
        blocks: [
          {
            type: "p",
            text: "A buffer is a small reserve that catches the gap between a big month and a small one. In a high month, move the surplus into the buffer. In a low month, draw from it to top your income up to baseline. Over time the buffer turns a jagged income into a steady one.",
          },
          {
            type: "p",
            text: "Klario tracks income across every account, shows your real monthly average, and flags when a month is trending below baseline early enough to act. Irregular income is hard to manage in your head, and a lot easier to manage on one screen.",
          },
        ],
      },
    ],
  },
  {
    slug: "digital-banking-security-checklist",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1280&q=70",
    title: "Keeping Your Money Safe: A Security Checklist for Digital Banking",
    excerpt:
      "Mobile banking put your accounts in your pocket and the same in a fraudster's reach. A few habits keep you firmly on the safe side.",
    category: "Security",
    publishedAt: "22 May 2026",
    publishedAtIso: "2026-05-22",
    readTime: "5 min read",
    author: { name: "Klario Team", role: "Security" },
    sections: [
      {
        blocks: [
          {
            type: "p",
            text: "Digital banking is convenient, fast, and here to stay. It also moves the risk from a bank hall to your phone. Most fraud succeeds not because systems are weak, but because a person was tricked into handing over access. Build a few habits and you remove the easiest paths an attacker would use.",
          },
        ],
      },
      {
        title: "Lock down access",
        blocks: [
          {
            type: "list",
            items: [
              "Use a unique PIN and password for banking, never the ones you reuse elsewhere",
              "Turn on biometric login and a screen lock so a lost phone is not an open door",
              "Enable two-factor authentication wherever your bank offers it",
            ],
          },
        ],
      },
      {
        title: "Know how scams reach you",
        blocks: [
          {
            type: "p",
            text: "No legitimate bank will ever ask for your PIN, full card number, OTP, or password by call, text, or chat. The moment someone does, the conversation is the fraud. Hang up and contact your bank using the number on the back of your card.",
          },
          {
            type: "list",
            items: [
              "Treat urgent messages about a blocked account as a warning sign, not a reason to rush",
              "Do not click links in unexpected texts or emails, type your bank's address yourself",
              "Be wary of anyone who wants to move the conversation to WhatsApp",
            ],
          },
        ],
      },
      {
        title: "Watch your accounts",
        blocks: [
          {
            type: "p",
            text: "Speed matters in fraud. The faster you spot an unfamiliar transaction, the more likely it can be stopped or reversed. Turn on alerts for every debit, and review your transactions regularly rather than only at month end.",
          },
          {
            type: "p",
            text: "Klario watches every linked account in one place and flags unusual activity, so a strange charge across any of your banks reaches you quickly instead of hiding in an app you rarely open.",
          },
        ],
      },
    ],
  },
  {
    slug: "stop-budgeting-in-a-spreadsheet",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1280&q=70",
    title: "It's 2026. Please Stop Budgeting in a Spreadsheet.",
    excerpt:
      "Your spreadsheet was a hero in 2015. Today it is an unpaid part-time job you forgot you applied for. Consider this a gentle intervention.",
    category: "Budgeting",
    publishedAt: "20 June 2026",
    publishedAtIso: "2026-06-20",
    readTime: "4 min read",
    author: { name: "Klario Team", role: "Product" },
    sections: [
      {
        blocks: [
          {
            type: "p",
            text: "We need to talk about the spreadsheet. You know the one. Twelve tabs, one per month, colour-coded with the quiet confidence of someone who downloaded it from a YouTube video in 2019 and has been lightly lying to it ever since.",
          },
          {
            type: "p",
            text: "Spreadsheets are brilliant. They are also, for budgeting in 2026, a charming antique. Here is why it might be time to let yours retire with dignity.",
          },
        ],
      },
      {
        title: "The honeymoon is over",
        blocks: [
          {
            type: "p",
            text: "For the first two weeks, you and your spreadsheet were inseparable. You logged every jollof, every bolt ride, every airtime top-up. Then real life happened, you missed a day, then a week, and now opening it feels like running into someone you ghosted.",
          },
          {
            type: "p",
            text: "A budget you have to feed by hand will always lose to a budget that feeds itself. That is not a discipline problem. It is a design problem.",
          },
        ],
      },
      {
        title: "Things your spreadsheet will never do",
        blocks: [
          {
            type: "list",
            items: [
              "Notice that your transport spend quietly doubled and tell you before month end",
              "Pull every transaction from every bank without you typing a single naira",
              "Know that UBER BV and UBER TRIP are the same Uber, not two new friends",
              "Send you a polite nudge instead of waiting to be opened",
            ],
          },
          {
            type: "p",
            text: "Your spreadsheet does not categorise. It does not remind. It does not sync. It sits there, formulas folded, waiting for you to do the actual work. The bar is genuinely on the floor.",
          },
        ],
      },
      {
        title: "Breaking up is easy, actually",
        blocks: [
          {
            type: "p",
            text: "You do not need to delete your beloved tabs. Keep them for sentimental value. But let an app do the daily lifting: connect your accounts once, let AI sort every transaction, and check a single screen instead of typing into thirty rows.",
          },
          {
            type: "p",
            text: "Klario does the boring part so the only spreadsheet you open is one you actually want to. Join the beta and give your formulas the retirement they have earned.",
          },
        ],
      },
    ],
  },
  {
    slug: "too-many-bank-apps",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1280&q=70",
    title: "You Have Five Banking Apps and a Headache. Let's Talk.",
    excerpt:
      "GTBank for salary, Opay for transfers, Kuda for savings, and two more you genuinely forgot the password to. Your phone has become a financial group chat nobody muted.",
    category: "Personal Finance",
    publishedAt: "14 June 2026",
    publishedAtIso: "2026-06-14",
    readTime: "4 min read",
    author: { name: "Klario Team", role: "Product" },
    sections: [
      {
        blocks: [
          {
            type: "p",
            text: "Open your phone and count the banking apps. Go on, we will wait. If you got past three, congratulations, you are a fully diversified Nigerian and also slightly tired. Each app does one thing well and absolutely refuses to talk to the others.",
          },
        ],
      },
      {
        title: "The folder of forgotten passwords",
        blocks: [
          {
            type: "p",
            text: "There is one app you only open to reset the password so you can open it. There is another holding an amount you are not emotionally ready to confirm. And somewhere in there is your real balance, scattered across five screens like clues in a treasure hunt nobody wanted.",
          },
        ],
      },
      {
        title: "Why one number matters",
        blocks: [
          {
            type: "p",
            text: "The problem is not having multiple accounts. Spreading salary, savings, and spending is smart. The problem is that no single app can answer the only question that counts: how much do I actually have, across everything, right now?",
          },
          {
            type: "list",
            items: [
              "You overspend because each app only confesses to its own transactions",
              "Savings hide in an account you forget to check",
              "A bill bounces because the money was in a different app, looking the other way",
            ],
          },
        ],
      },
      {
        title: "Keep the apps, lose the headache",
        blocks: [
          {
            type: "p",
            text: "Nobody is asking you to break up with your banks. Keep all five. Just stop being the human glue holding them together in your head. Let one place pull them into a single, honest number.",
          },
          {
            type: "p",
            text: "Klario connects every Nigerian bank account into one clear view, so your phone goes back to being a phone and not a part-time accounting department. Join the beta and meet your real balance.",
          },
        ],
      },
    ],
  },
];

function sortByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishedAtIso).getTime() -
      new Date(a.publishedAtIso).getTime()
  );
}

/** Static seed posts only (sync). */
export function getBlogPosts(): BlogPost[] {
  return sortByDate(BLOG_POSTS);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}

/**
 * All posts shown publicly: admin-authored DB posts merged with the static seed
 * posts. A DB post with the same slug overrides its static twin. Falls back to
 * the static posts if the database is unavailable.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const { isSupabaseConfigured } = await import("@/lib/supabase/admin");
  let dbPosts: BlogPost[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { listPublishedDbPosts } = await import("@/lib/db/blogPosts");
      dbPosts = await listPublishedDbPosts();
    } catch {
      dbPosts = [];
    }
  }
  const bySlug = new Map<string, BlogPost>();
  for (const p of BLOG_POSTS) bySlug.set(p.slug, p);
  for (const p of dbPosts) bySlug.set(p.slug, p);
  return sortByDate([...bySlug.values()]);
}

/** A single public post by slug: DB first, then the static seed posts. */
export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const { isSupabaseConfigured } = await import("@/lib/supabase/admin");
  if (isSupabaseConfigured()) {
    try {
      const { getDbPostBySlug } = await import("@/lib/db/blogPosts");
      const dbPost = await getDbPostBySlug(slug);
      if (dbPost) return dbPost;
    } catch {
      // fall through to static
    }
  }
  return BLOG_POSTS.find((post) => post.slug === slug);
}

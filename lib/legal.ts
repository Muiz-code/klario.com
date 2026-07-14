export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "olist"; items: string[] }
  | { type: "subhead"; text: string }
  | { type: "link"; prefix?: string; label: string; href: string; suffix?: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type LegalSection = {
  title: string;
  blocks: Block[];
};

export type LegalPage = {
  slug:
    | "privacy"
    | "terms"
    | "cookies"
    | "data-protection"
    | "anti-fraud"
    | "compliance"
    | "delete-account";
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  preamble: Block[];
  sections: LegalSection[];
};

const dates = {
  effectiveDate: "11 July 2026",
  lastUpdated: "11 July 2026",
};

const draftNotice: Block = {
  type: "p",
  text: "Draft for review: this document is a draft representation prepared for review by a qualified Nigerian lawyer before publication. It is provided for information only and is not legal advice. Confirmed legal names of our licensed partners are inserted before publishing.",
};

export const PRIVACY: LegalPage = {
  slug: "privacy",
  title: "Privacy Policy",
  ...dates,
  preamble: [
    draftNotice,
    {
      type: "p",
      text: `Klario ("Klario", "we", "us", or "our") is a product of Raavon Limited. This Privacy Policy explains, in plain language, what personal information we collect when you use the Klario app and website (klario.finance), how we use it, who we share it with, and the choices and rights you have. It is written to comply with the Nigeria Data Protection Act 2023 (NDPA), the NDPR, and the consumer-protection expectations of the Central Bank of Nigeria (CBN).`,
    },
    {
      type: "p",
      text: "An important note about your money: Klario is not a bank and never holds your funds itself. Your savings balance is held in a wallet operated by a licensed payments partner, and transfers and payouts are carried out by CBN-licensed partners on your instruction. Klario orchestrates these actions; it does not itself move or hold your money.",
    },
  ],
  sections: [
    {
      title: "Who we are, and how money moves",
      blocks: [
        {
          type: "p",
          text: "Klario is operated by Raavon Limited (RC-9537604). You can reach us at support@klario.finance. Klario recently added the ability to move money; previously the app was read-only. This policy reflects those new features.",
        },
        {
          type: "p",
          text: "Because we are not a bank, the parts of Klario that hold or move money are provided by licensed partners:",
        },
        {
          type: "list",
          items: [
            "Your savings balance is held in a wallet operated by a licensed payments partner.",
            "Transfers and direct debits (including recurring auto-save) are executed by a licensed open-banking partner through its direct-debit feature, on your instruction.",
            "Klario prepares and routes your instructions; it does not itself custody or move your money.",
          ],
        },
      ],
    },
    {
      title: "Information we collect",
      blocks: [
        { type: "subhead", text: "Identity and KYC" },
        {
          type: "p",
          text: "Your legal name, date of birth, phone number, email, and identity-verification data. Your Bank Verification Number (BVN) is verified by our open-banking and KYC partners and is not stored in raw form on Klario's servers.",
        },
        { type: "subhead", text: "Bank account data (via open banking)" },
        {
          type: "p",
          text: "With your consent, we read: account name, balance, masked account number, and transaction history. We do not access your card details, PINs, or one-time passwords (OTPs).",
        },
        { type: "subhead", text: "Money-movement data" },
        {
          type: "p",
          text: "Savings goals, auto-save mandates, and records of the transfers, withdrawals and deposits you make. Your transfer PIN is stored only as a salted hash, never as plaintext.",
        },
        { type: "subhead", text: "Device and diagnostics" },
        {
          type: "p",
          text: "Device identifiers, and crash and diagnostic logs that are scrubbed of personal information on your device before they reach us.",
        },
      ],
    },
    {
      title: "How we use your information",
      blocks: [
        { type: "p", text: "We use your information to:" },
        {
          type: "list",
          items: [
            "Create and run your account, and show your money in one place;",
            "Set up and run savings goals and recurring auto-save;",
            "Carry out the transfers and withdrawals you authorise, through our licensed partners;",
            "Power KlarioAI guidance based on your financial context;",
            "Verify your identity and protect you from fraud and money laundering;",
            "Send you the notifications described below;",
            "Fix problems, keep the app secure, and improve it;",
            "Meet our legal and regulatory obligations.",
          ],
        },
        {
          type: "p",
          text: "Under the NDPA, we rely on these lawful bases: performing our contract with you (running your account and executing your instructions), your consent (connecting a bank, marketing, an auto-save mandate), our legal obligations (KYC and anti-money-laundering), and our legitimate interests (fraud prevention and improving the app).",
        },
      ],
    },
    {
      title: "KlarioAI",
      blocks: [
        {
          type: "p",
          text: "KlarioAI, our in-app assistant, is powered by Anthropic (Claude). It processes your financial context to give guidance and can prepare an action for you, but it never executes a payment on its own. Every action needs your tap and your transfer PIN.",
        },
        {
          type: "p",
          text: "KlarioAI may fetch live foreign-exchange rates from ExchangeRate-API (open.er-api.com). No personal data is sent to the rate provider; Klario only requests the public rate table. Any FX figures shown are indicative only; they are not a settlement or guaranteed rate.",
        },
        {
          type: "p",
          text: "KlarioAI output is general information only. It is not financial, investment, tax, or legal advice.",
        },
      ],
    },
    {
      title: "Moving money, and your consent",
      blocks: [
        { type: "subhead", text: "Savings wallet" },
        {
          type: "p",
          text: "Money you save is held in a wallet operated by our licensed payments partner, not by Klario.",
        },
        { type: "subhead", text: "Recurring auto-save (debit mandate)" },
        {
          type: "p",
          text: "Recurring auto-save is a debit mandate that you authorise. You can cancel it at any time in the app. If there are not enough funds on a scheduled date, we notify you, hold the instruction, retry when funds appear, and then skip to the next scheduled date. Nothing is debited without an active mandate.",
        },
        { type: "subhead", text: "Withdrawals" },
        {
          type: "p",
          text: "For your security and to prevent fraud, you can only withdraw to a bank account whose account-holder name matches your identity-verified (KYC) legal name, including accounts you have not connected. We resolve the destination account name through a payments provider to enforce this.",
        },
        { type: "subhead", text: "Sending money" },
        {
          type: "p",
          text: "Each transfer is authorised individually with your transfer PIN.",
        },
      ],
    },
    {
      title: "Who we share data with (sub-processors)",
      blocks: [
        {
          type: "p",
          text: "We do not sell or rent your personal information. We share it only with the service providers below, each under a contract that requires them to protect your data and use it solely to deliver their service. Some are also our regulated financial partners.",
        },
        {
          type: "table",
          head: ["Third party", "What they do"],
          rows: [
            ["Licensed open-banking partner", "CBN-licensed open banking (connecting your bank accounts and verifying your BVN), and executing transfers and direct debits on your instruction"],
            ["Licensed payments partner", "Holds your savings wallet balance and provides payment rails"],
            ["Account-verification partner", "Bank list and account-name resolution"],
            ["Identity-verification partner", "Identity verification (KYC)"],
            ["Anthropic", "AI processing that powers KlarioAI (Claude)"],
            ["ExchangeRate-API (open.er-api.com)", "Live currency exchange rates for KlarioAI conversions. No user data is sent; Klario only requests the public rate table."],
            ["Supabase", "Application hosting, database, and authentication"],
            ["Push-notification delivery provider", "Delivering push notifications to your device"],
          ],
        },
        {
          type: "p",
          text: "We may also disclose information where required by law, court order, or a regulator such as the CBN or the NDPC.",
        },
      ],
    },
    {
      title: "How we keep your data secure",
      blocks: [
        {
          type: "p",
          text: "We apply technical and organisational safeguards, including:",
        },
        {
          type: "list",
          items: [
            "Your transfer PIN stored as a salted hash, never as plaintext;",
            "The transfer PIN bound to your account (not just your device), with brute-force rate limiting;",
            "HTTPS-only transport for data in transit;",
            "Name-matched withdrawals (funds can only leave to an account in your verified name);",
            "Automatic app lock and biometric unlock.",
          ],
        },
        {
          type: "p",
          text: "Some safeguards are provided by our licensed partners: wallet custody, account-name resolution, and the execution of transfers and payouts. No system can be perfectly secure, so please keep your PIN secret and enable biometric unlock.",
        },
      ],
    },
    {
      title: "Your rights (NDPR)",
      blocks: [
        {
          type: "p",
          text: "Under the NDPA and NDPR, you can, at any time:",
        },
        {
          type: "list",
          items: [
            "Access the personal data we hold about you;",
            "Export your data (portability) in a structured, machine-readable format;",
            "Delete your account and associated data;",
            "Disconnect any bank you have linked;",
            "Withdraw consent, including cancelling an auto-save mandate;",
            "Object to or restrict certain processing, and opt out of marketing.",
          ],
        },
        {
          type: "p",
          text: "Most of these are self-service in the app. You can also contact support@klario.finance. We verify your identity and respond within the timeline set by the NDPC, and in any case within 30 days. You may also lodge a complaint with the NDPC.",
        },
      ],
    },
    {
      title: "Unauthorised transactions",
      blocks: [
        {
          type: "p",
          text: "Keep your transfer PIN secret and never share it. If you see a transaction you did not authorise, report it immediately in the app or by emailing support@klario.finance. We will investigate, work with the relevant licensed partner, and handle your report in line with CBN consumer-protection expectations. Report promptly, as delays can affect what can be recovered.",
        },
      ],
    },
    {
      title: "Notifications we send",
      blocks: [
        {
          type: "p",
          text: "So you always know what is happening with your money, we send:",
        },
        {
          type: "list",
          items: [
            "Savings maturity notices;",
            "Upcoming-deposit reminders (before a scheduled auto-save);",
            "Upcoming-withdrawal reminders;",
            "Security alerts and other push notices.",
          ],
        },
        {
          type: "p",
          text: "You can manage most notifications in settings. Some security and transaction notices are necessary and cannot be turned off.",
        },
      ],
    },
    {
      title: "How long we keep your data",
      blocks: [
        {
          type: "p",
          text: "We keep your data while your account is active. When you delete your account, your personal and financial data are permanently removed within 30 days.",
        },
        {
          type: "p",
          text: "Records we are legally required to retain (for example anti-fraud, tax and regulatory records under applicable Nigerian law) are kept for up to the period required by law, then permanently deleted. Anonymised, aggregated data that cannot identify you may be kept longer.",
        },
      ],
    },
    {
      title: "Children",
      blocks: [
        {
          type: "p",
          text: "Klario is for users aged 18 and above. We do not knowingly collect data from anyone under 18. If we learn that a minor has registered, we will delete the account and its data.",
        },
      ],
    },
    {
      title: "Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "We may update this policy to reflect new features or legal requirements. Where changes are material, we will notify you by email or in-app at least 14 days before they take effect.",
        },
      ],
    },
    {
      title: "Governing law and contact",
      blocks: [
        {
          type: "p",
          text: "This policy is governed by the laws of the Federal Republic of Nigeria.",
        },
        { type: "subhead", text: "Klario (by Raavon Limited, RC-9537604)" },
        { type: "p", text: "Email: support@klario.finance" },
        { type: "p", text: "Website: klario.finance" },
        {
          type: "link",
          prefix: "Parent company: ",
          label: "www.raavon.com",
          href: "https://www.raavon.com",
        },
      ],
    },
  ],
};

export const TERMS: LegalPage = {
  slug: "terms",
  title: "Terms of Service",
  ...dates,
  preamble: [
    draftNotice,
    {
      type: "p",
      text: `These Terms of Service ("Terms") are an agreement between you and Raavon Limited ("Klario", "we", "us", or "our"), which operates the Klario app and website. They explain the rules for using Klario, especially now that the app can move money on your instruction.`,
    },
    {
      type: "p",
      text: "By creating an account or using Klario, you confirm you have read and agree to these Terms and our Privacy Policy. If you do not agree, please do not use Klario.",
    },
  ],
  sections: [
    {
      title: "About Klario (and what we are not)",
      blocks: [
        {
          type: "p",
          text: "Klario is a personal-finance app operated by Raavon Limited (RC-9537604). We are not a bank and never hold your funds ourselves. Your savings balance is held in a wallet operated by a licensed payments partner, and transfers and direct debits are executed by a licensed open-banking partner through its direct-debit feature, on your instruction. Klario orchestrates these actions; it does not itself custody or move your money. Our partners are described in our Privacy Policy.",
        },
      ],
    },
    {
      title: "Who can use Klario",
      blocks: [
        { type: "p", text: "To use Klario, you must:" },
        {
          type: "list",
          items: [
            "Be at least 18 years old;",
            "Be resident in Nigeria;",
            "Have a valid Nigerian Bank Verification Number (BVN);",
            "Have the legal capacity to enter into this agreement;",
            "Provide accurate and complete information, and keep it up to date.",
          ],
        },
      ],
    },
    {
      title: "Your account and security",
      blocks: [
        {
          type: "p",
          text: "You may hold one account, and you are responsible for everything that happens under it. Keep your login, app PIN, transfer PIN and biometric access private and never share them. Your transfer PIN is what authorises money to move, so treat it like a bank PIN.",
        },
        {
          type: "p",
          text: "Tell us immediately at support@klario.finance if you think someone else has accessed your account or a transaction was made without your permission.",
        },
      ],
    },
    {
      title: "Savings and auto-save (debit mandate)",
      blocks: [
        {
          type: "p",
          text: "You can create savings goals; the money is held in a wallet operated by our licensed payments partner. Recurring auto-save is a debit mandate that you authorise, and you can cancel it at any time in the app.",
        },
        {
          type: "p",
          text: "If there are not enough funds on a scheduled date, we notify you, hold the instruction, retry when funds appear, and then skip to the next scheduled date. Nothing is debited without an active mandate.",
        },
      ],
    },
    {
      title: "Withdrawals",
      blocks: [
        {
          type: "p",
          text: "For your security and to prevent fraud, you can only withdraw to a bank account whose account-holder name matches your identity-verified (KYC) legal name, including accounts you have not connected to Klario. The destination account name is resolved through a payments provider to enforce this. Withdrawals to accounts in a different name are not permitted.",
        },
      ],
    },
    {
      title: "Sending money and transfers",
      blocks: [
        {
          type: "p",
          text: "Each transfer is authorised individually with your transfer PIN. Your transfer PIN is stored as a salted hash bound to your account (not just your device), with brute-force rate limiting. Please check the recipient and amount carefully before you confirm: once your instruction is executed by our licensed partners, a transfer may not be reversible.",
        },
      ],
    },
    {
      title: "KlarioAI",
      blocks: [
        {
          type: "p",
          text: "KlarioAI is powered by Anthropic (Claude). It can give guidance and prepare an action for you, but it never executes a payment on its own. Every action needs your tap and your transfer PIN.",
        },
        {
          type: "p",
          text: "KlarioAI may show live foreign-exchange rates from ExchangeRate-API (open.er-api.com); those figures are indicative only and are not a settlement or guaranteed rate. KlarioAI output is general information only, and is not financial, investment, tax, or legal advice.",
        },
      ],
    },
    {
      title: "Fees",
      blocks: [
        {
          type: "p",
          text: "Klario may offer free and paid plans. Any subscription prices and transaction fees are shown in the app and on our website before you subscribe or confirm a transaction. Your bank or our partners may also apply their own charges.",
        },
      ],
    },
    {
      title: "Acceptable use",
      blocks: [
        { type: "p", text: "You agree not to:" },
        {
          type: "list",
          items: [
            "Use Klario for any unlawful, fraudulent, or deceptive purpose;",
            "Use Klario to facilitate money laundering, terrorist financing, or any financial crime;",
            "Attempt to gain unauthorised access to Klario or its systems, or interfere with them;",
            "Reverse engineer, scrape, or misuse the app;",
            "Impersonate another person, or use an account that is not yours;",
            "Break any applicable Nigerian or other law.",
          ],
        },
        {
          type: "p",
          text: "Breaking these rules may lead to suspension or termination of your account, and may be reported to law enforcement or regulators.",
        },
      ],
    },
    {
      title: "Availability and changes to the service",
      blocks: [
        {
          type: "p",
          text: "We work to keep Klario available but cannot guarantee it will always be uninterrupted; maintenance, upgrades, partner outages, or events beyond our control may affect it. We may add, change, or remove features, and will give reasonable notice of material changes where we can.",
        },
      ],
    },
    {
      title: "Disclaimers and limitation of liability",
      blocks: [
        {
          type: "p",
          text: `Klario is provided on an "as is" and "as available" basis. KlarioAI insights are information, not professional advice, and we do not warrant the accuracy of third-party data retrieved from your banks or FX providers.`,
        },
        {
          type: "p",
          text: "To the fullest extent permitted by Nigerian law, we are not liable for indirect or consequential losses, for losses caused by your failure to keep your PIN and credentials secret, or for the acts or omissions of our licensed banking, payments and infrastructure partners. Nothing in these Terms limits any liability that cannot be limited under applicable law.",
        },
      ],
    },
    {
      title: "Unauthorised transactions and complaints",
      blocks: [
        {
          type: "p",
          text: "If you notice a transaction you did not authorise, report it as soon as possible in the app or by emailing support@klario.finance. We will investigate, work with the relevant licensed partner, and handle your complaint in line with CBN consumer-protection expectations. Reporting promptly gives the best chance of resolving the issue.",
        },
      ],
    },
    {
      title: "Termination",
      blocks: [
        {
          type: "p",
          text: 'You can close your account at any time by choosing "Delete Account" in the app; your data is removed as described in our Privacy Policy. We may suspend or terminate your account if you break these Terms, act fraudulently, or create legal or security risk. Terms that should survive termination (such as liability and governing law) continue to apply.',
        },
      ],
    },
    {
      title: "Governing law and disputes",
      blocks: [
        {
          type: "p",
          text: "These Terms are governed by the laws of the Federal Republic of Nigeria. If a dispute arises, we will first try to resolve it with you in good faith; if it is not resolved within 30 days, it may be referred to mediation or arbitration under Nigerian law. You can reach us at support@klario.finance.",
        },
      ],
    },
    {
      title: "Changes to these Terms",
      blocks: [
        {
          type: "p",
          text: "We may update these Terms. Where changes are material, we will notify you by email or in-app at least 14 days before they take effect. Continuing to use Klario after that means you accept the updated Terms.",
        },
      ],
    },
    {
      title: "Contact",
      blocks: [
        { type: "subhead", text: "Klario (by Raavon Limited, RC-9537604)" },
        { type: "p", text: "Email: support@klario.finance" },
        { type: "p", text: "Website: klario.finance" },
        {
          type: "link",
          prefix: "Parent company: ",
          label: "www.raavon.com",
          href: "https://www.raavon.com",
        },
      ],
    },
  ],
};

const corporateDates = {
  effectiveDate: "24 April 2026",
  lastUpdated: "24 April 2026",
};

export const DATA_PROTECTION: LegalPage = {
  slug: "data-protection",
  title: "Data Protection Policy",
  ...corporateDates,
  preamble: [
    {
      type: "p",
      text: `This Policy sets out how Raavon Limited ("the Company"), the company behind Klario Finance, collects, uses, stores, shares, transfers and disposes of personal data, in compliance with the Nigeria Data Protection Act 2023 (NDPA), the Nigeria Data Protection Regulation 2019 (NDPR), and the General Application and Implementation Directive (GAID) 2025 issued by the Nigeria Data Protection Commission (NDPC).`,
    },
    {
      type: "p",
      text: `It applies to Raavon Limited and all ventures operating under it, including Klario Finance, and to all employees, co-founders, contractors and third parties processing personal data on the Company's behalf, whether the Company acts as a data controller or as a data processor.`,
    },
  ],
  sections: [
    {
      title: "Definitions",
      blocks: [
        {
          type: "list",
          items: [
            "Personal data: any information relating to an identified or identifiable natural person, including name, contact details, identification numbers, location data, online identifiers and financial information.",
            "Sensitive personal data: data relating to health, genetic or biometric data, race or ethnicity, religious or similar beliefs, political opinions or sex life, or such other data as the NDPC may classify as sensitive.",
            "Processing: any operation performed on personal data, including collection, recording, storage, retrieval, use, disclosure, restriction, erasure or destruction.",
            "Data controller: the entity that determines the purposes and means of processing. Data processor: the entity that processes personal data on behalf of a controller.",
          ],
        },
      ],
    },
    {
      title: "Data Protection Principles",
      blocks: [
        {
          type: "p",
          text: "In line with Section 24 of the NDPA 2023, the Company ensures that personal data is:",
        },
        {
          type: "list",
          items: [
            "Processed fairly, lawfully and transparently;",
            "Collected for specified, explicit and legitimate purposes, and not further processed in a manner incompatible with those purposes;",
            "Adequate, relevant and limited to what is necessary (data minimisation);",
            "Accurate and kept up to date, with inaccurate data corrected or erased without delay;",
            "Retained for no longer than is necessary for the purposes for which it was collected;",
            "Processed with appropriate security, integrity and confidentiality.",
          ],
        },
        {
          type: "p",
          text: "The Company applies privacy by design and by default in the development of all venture products.",
        },
      ],
    },
    {
      title: "Lawful Bases for Processing",
      blocks: [
        {
          type: "p",
          text: "The Company processes personal data only where at least one lawful basis under Section 25 of the NDPA 2023 applies:",
        },
        {
          type: "list",
          items: [
            "The data subject has given consent, which must be freely given, specific, informed and unambiguous, and may be withdrawn at any time;",
            "Processing is necessary for the performance of a contract with the data subject, or to take steps at their request prior to entering a contract;",
            "Processing is necessary for compliance with a legal obligation;",
            "Processing is necessary to protect the vital interests of the data subject or another person;",
            "Processing is necessary for a task carried out in the public interest or the exercise of official authority;",
            "Processing is necessary for the legitimate interests of the Company or a third party, except where overridden by the rights and freedoms of the data subject.",
          ],
        },
        {
          type: "p",
          text: "Sensitive personal data is processed only under the stricter conditions of Section 30 of the NDPA 2023. We do not process the personal data of children without verifiable parental or guardian consent, and apply appropriate age-verification mechanisms in ventures whose users may include persons under eighteen (18).",
        },
      ],
    },
    {
      title: "Your Rights as a Data Subject",
      blocks: [
        {
          type: "p",
          text: "Under Sections 34 to 37 of the NDPA 2023, you have the right to:",
        },
        {
          type: "list",
          items: [
            "Be informed about the processing of your personal data through clear privacy notices;",
            "Access your personal data and obtain a copy;",
            "Rectification of inaccurate or incomplete data;",
            "Erasure of personal data where there is no lawful justification for retention;",
            "Restriction of, or objection to, processing, including for direct marketing;",
            "Data portability in a structured, commonly used and machine-readable format;",
            "Withdraw consent at any time without affecting prior lawful processing;",
            "Not be subject to a decision based solely on automated processing producing legal or similarly significant effects, without appropriate safeguards;",
            "Lodge a complaint with the Nigeria Data Protection Commission.",
          ],
        },
        {
          type: "p",
          text: "Requests should be directed to privacy@raavon.com and are resolved without undue delay and within any timeline prescribed by the NDPC. Identity is verified before any request is actioned.",
        },
      ],
    },
    {
      title: "Data Protection Officer",
      blocks: [
        {
          type: "p",
          text: "The Company has designated a Data Protection Officer (DPO), reachable at privacy@raavon.com, responsible for compliance monitoring, maintenance of the Record of Processing Activities, data subject and regulator liaison, DPIA oversight and breach coordination.",
        },
      ],
    },
    {
      title: "Security of Personal Data",
      blocks: [
        {
          type: "p",
          text: "We implement appropriate technical and organisational measures proportionate to the risk, including:",
        },
        {
          type: "list",
          items: [
            "Encryption of data in transit (TLS 1.2 or higher) and at rest;",
            "Role-based access control and least privilege;",
            "Multi-factor authentication on critical systems;",
            "Logging and monitoring;",
            "Secure development practices;",
            "Pseudonymisation or masking where full data is not required;",
            "Secure disposal of data and media.",
          ],
        },
      ],
    },
    {
      title: "Personal Data Breach Management",
      blocks: [
        {
          type: "list",
          items: [
            "All suspected personal data breaches are reported immediately to the DPO at privacy@raavon.com.",
            "The DPO assesses the breach, coordinates containment and remediation, and maintains an internal breach register.",
            "Where a breach is likely to result in a risk to the rights and freedoms of data subjects, we notify the NDPC within seventy-two (72) hours of becoming aware of it.",
            "Where the breach is likely to result in a high risk, affected data subjects are informed without undue delay, with advice on protective steps.",
            "Where the Company acts as a data processor, it notifies the relevant data controller without undue delay.",
          ],
        },
      ],
    },
    {
      title: "Third Parties and Data Processors",
      blocks: [
        {
          type: "p",
          text: "We engage only processors and sub-processors that provide sufficient guarantees of compliance with applicable data protection legislation. All processing by third parties is governed by a written data processing agreement covering confidentiality, security measures, sub-processing, assistance with data subject rights, breach notification, audit rights, and return or deletion of data at the end of the engagement. Where a venture relies on regulated partners (such as banking, payments or open-banking providers), data sharing is limited to the minimum data necessary for the service.",
        },
        {
          type: "p",
          text: "For Klario, these partners include a licensed open-banking partner (open banking, BVN verification and direct debits), a licensed payments partner (savings wallet and payment rails), an account-verification partner (account-name resolution), an identity-verification partner (KYC), Anthropic (KlarioAI), Supabase (hosting and database), and a currency-rates provider (no personal data is sent).",
        },
      ],
    },
    {
      title: "Cross-Border Data Transfers",
      blocks: [
        {
          type: "p",
          text: "Personal data is not transferred outside Nigeria except in accordance with Sections 41 to 43 of the NDPA 2023, under a mechanism affording adequate protection or another lawful condition such as the data subject's informed consent. Where ventures use cloud infrastructure hosted outside Nigeria, the DPO ensures an appropriate transfer mechanism is in place and recorded.",
        },
      ],
    },
    {
      title: "Retention, Disposal and Impact Assessments",
      blocks: [
        {
          type: "p",
          text: "Personal data is retained only as long as necessary for the purpose collected, or as required by law (including financial-sector record-keeping obligations). On expiry, data is securely deleted, anonymised or destroyed.",
        },
        {
          type: "p",
          text: "A Data Protection Impact Assessment (DPIA) is carried out before any processing likely to result in high risk to data subjects, including large-scale processing of financial data, profiling, the adoption of new technologies (including AI-assisted features), or processing of sensitive personal data.",
        },
      ],
    },
    {
      title: "Contact",
      blocks: [
        { type: "subhead", text: "Raavon Limited (RC-9537604)" },
        { type: "p", text: "Data Protection Officer: privacy@raavon.com" },
        {
          type: "link",
          prefix: "Parent Company: ",
          label: "www.raavon.com",
          href: "https://www.raavon.com",
        },
      ],
    },
  ],
};

export const ANTI_FRAUD: LegalPage = {
  slug: "anti-fraud",
  title: "Anti-Fraud Policy",
  ...corporateDates,
  preamble: [
    {
      type: "p",
      text: `This Anti-Fraud Policy forms part of the Anti-Fraud, Bribery & Corruption strategy of Raavon Limited (RC-9537604), the company behind Klario Finance. It sets out our zero-tolerance approach to fraud, bribery and corruption across all of our operations and ventures.`,
    },
  ],
  sections: [
    {
      title: "Our Commitment",
      blocks: [
        { type: "p", text: "Management states that:" },
        {
          type: "list",
          items: [
            "Raavon Limited is committed to the prevention of fraud and malpractice in its operations.",
            "We shall not tolerate acts of fraud, bribery or corruption.",
            "Employees found guilty of fraud or malpractice will be subject to disciplinary measures, including but not limited to suspension, dismissal and criminal prosecution.",
            "All employees have a duty to report incidents of fraudulent activity to management.",
            "The confidentiality of staff reporting acts of fraud and malpractice will be maintained at all times.",
            "Every reported incident of fraud will be thoroughly investigated.",
            "Where applicable, appropriate government agencies will be notified.",
            "This policy applies to all employees, contractors and consultants of Raavon Limited.",
          ],
        },
      ],
    },
    {
      title: "Reporting Fraud",
      blocks: [
        {
          type: "p",
          text: "If you suspect fraud, bribery or corruption involving Klario or Raavon, report it in confidence. All reports are taken seriously, investigated thoroughly, and the identity of the reporter is protected.",
        },
        { type: "p", text: "Email: contact@raavon.com" },
      ],
    },
    {
      title: "Contact",
      blocks: [
        { type: "subhead", text: "Raavon Limited (RC-9537604)" },
        { type: "p", text: "Email: contact@raavon.com" },
        {
          type: "link",
          prefix: "Parent Company: ",
          label: "www.raavon.com",
          href: "https://www.raavon.com",
        },
      ],
    },
  ],
};

export const COMPLIANCE: LegalPage = {
  slug: "compliance",
  title: "Compliance",
  effectiveDate: "8 June 2026",
  lastUpdated: "8 June 2026",
  preamble: [
    {
      type: "p",
      text: `Klario Finance is built and operated by Raavon Limited (RC-9537604), a Nigerian company registered with the Corporate Affairs Commission. We treat compliance, security and the protection of your money and data as foundational, not optional. This page summarises the regulatory framework, registrations and controls we operate under.`,
    },
  ],
  sections: [
    {
      title: "Regulatory Framework",
      blocks: [
        {
          type: "p",
          text: "Our operations are governed by, and aligned with, the following Nigerian laws and standards:",
        },
        {
          type: "list",
          items: [
            "Nigeria Data Protection Act 2023 (NDPA);",
            "Nigeria Data Protection Regulation 2019 (NDPR);",
            "NDPC General Application and Implementation Directive (GAID) 2025;",
            "Money Laundering (Prevention and Prohibition) Act 2022;",
            "The regulatory framework of the Central Bank of Nigeria (CBN), via our licensed banking and open-banking partners.",
          ],
        },
      ],
    },
    {
      title: "Registrations & Licences",
      blocks: [
        { type: "subhead", text: "Corporate Registration" },
        {
          type: "p",
          text: "Raavon Limited is registered with the Corporate Affairs Commission of Nigeria under RC-9537604.",
        },
        { type: "subhead", text: "SCUML / Anti-Money Laundering" },
        {
          type: "p",
          text: "Raavon Limited is registered with the Special Control Unit Against Money Laundering (SCUML), under the Economic and Financial Crimes Commission (EFCC), in accordance with Section 17(2)(a) of the Money Laundering (Prevention and Prohibition) Act 2022.",
        },
        {
          type: "list",
          items: [
            "SCUML Registration Number: SC 251523895;",
            "Date of issue: 8 June 2026.",
          ],
        },
      ],
    },
    {
      title: "Data Protection",
      blocks: [
        {
          type: "p",
          text: "We process personal data lawfully, fairly and transparently under the NDPA 2023, and we have appointed a Data Protection Officer responsible for compliance, the Record of Processing Activities, regulator liaison and breach coordination.",
        },
        {
          type: "list",
          items: [
            "Data Protection Officer: privacy@raavon.com;",
            "Data subjects can access, correct, port, restrict, object to and erase their data, and withdraw consent at any time;",
            "Personal data breaches that pose a risk are notified to the NDPC within 72 hours.",
          ],
        },
        {
          type: "link",
          prefix: "Read our full ",
          label: "Data Protection Policy",
          href: "/data-protection",
        },
      ],
    },
    {
      title: "Information Security",
      blocks: [
        {
          type: "p",
          text: "We maintain an Information Security Policy aligned with recognised hardening standards (NIST, ISO 27001 / CIS Benchmarks). Core controls include:",
        },
        {
          type: "list",
          items: [
            "Encryption of data in transit (TLS 1.2 or higher) and at rest;",
            "Role-based access control and least privilege, with unique user IDs;",
            "Multi-factor authentication on critical systems, cloud consoles, code repositories and production environments;",
            "Centralised logging, monitoring and alerting, with audit logs retained;",
            "A formal change-control process, with protected repositories and mandatory review before merge;",
            "Secure application development aligned with the OWASP Top 10, and a documented penetration-testing methodology;",
            "Secure data retention and disposal.",
          ],
        },
        {
          type: "p",
          text: "Klario is not a bank, does not hold customer funds itself, and does not store bank login credentials. Bank data is read through our licensed open-banking partner. Money movement is carried out by our regulated partners on the user's instruction: the savings wallet is operated by a licensed payments partner, and transfers and direct debits run through a licensed open-banking partner's direct-debit feature.",
        },
      ],
    },
    {
      title: "Anti-Fraud",
      blocks: [
        {
          type: "p",
          text: "We operate a zero-tolerance Anti-Fraud, Bribery & Corruption policy across the company and all of its ventures, with mandatory reporting, confidential whistleblowing and thorough investigation of every reported incident.",
        },
        {
          type: "link",
          prefix: "Read our full ",
          label: "Anti-Fraud Policy",
          href: "/anti-fraud",
        },
      ],
    },
    {
      title: "Records & Policies",
      blocks: [
        {
          type: "p",
          text: "We maintain a Record of Processing Activities (RoPA) documenting every processing activity, its lawful basis, recipients, transfers and retention, reviewed at least annually. Our full policy set includes:",
        },
        {
          type: "list",
          items: [
            "Data Protection Policy (RAAVON/DPP/2026);",
            "Information Security Policy (RAAVON/ISP/2026);",
            "Anti-Fraud, Bribery & Corruption Policy;",
            "Record of Processing Activities (RAAVON/ROPA/2026).",
          ],
        },
        {
          type: "p",
          text: "The Information Security Policy and Record of Processing Activities are internal compliance documents; summaries are provided above and full copies are available to regulators and partners on request.",
        },
      ],
    },
    {
      title: "Contact",
      blocks: [
        { type: "subhead", text: "Raavon Limited (RC-9537604)" },
        { type: "p", text: "Compliance & data protection: privacy@raavon.com" },
        { type: "p", text: "General: contact@raavon.com" },
        {
          type: "link",
          prefix: "Parent Company: ",
          label: "www.raavon.com",
          href: "https://www.raavon.com",
        },
      ],
    },
  ],
};

export const DELETE_ACCOUNT: LegalPage = {
  slug: "delete-account",
  title: "Delete your Klario account",
  effectiveDate: "11 July 2026",
  lastUpdated: "11 July 2026",
  preamble: [
    {
      type: "p",
      text: "Klario (Raavon Limited) lets you delete your account and associated data at any time.",
    },
  ],
  sections: [
    {
      title: "In the app (fastest)",
      blocks: [
        {
          type: "olist",
          items: [
            "Open Klario and sign in.",
            "Go to Profile.",
            'Tap "Delete Account".',
            "Confirm. Your account and data are permanently removed.",
          ],
        },
      ],
    },
    {
      title: "By email",
      blocks: [
        {
          type: "link",
          prefix: "If you can't access the app, email ",
          label: "support@klario.finance",
          href: "mailto:support@klario.finance?subject=Delete%20my%20account",
          suffix:
            ' from your registered email address with the subject "Delete my account". We\'ll verify and process the request within 30 days.',
        },
      ],
    },
    {
      title: "Delete specific data (without closing your account)",
      blocks: [
        {
          type: "p",
          text: "You can remove individual data in the app at any time:",
        },
        {
          type: "list",
          items: [
            "Disconnect a bank: Profile > Money & Banking > Linked Banks > select a bank > Disconnect. This removes that bank and its synced transactions.",
            "Delete budgets, savings goals, or debts: open the item and choose Delete.",
          ],
        },
        {
          type: "link",
          prefix: "For anything else, email ",
          label: "support@klario.finance",
          href: "mailto:support@klario.finance?subject=Delete%20specific%20data",
          suffix:
            " from your registered email and we'll remove the requested data within 30 days.",
        },
      ],
    },
    {
      title: "What is deleted",
      blocks: [
        {
          type: "p",
          text: "When you delete your account, we permanently remove:",
        },
        {
          type: "list",
          items: [
            "Your profile and personal details",
            "Linked bank connections",
            "Transactions",
            "Budgets",
            "Savings goals",
            "Debts",
            "Notifications",
            "Identity (KYC) data",
          ],
        },
      ],
    },
    {
      title: "What is kept, and for how long",
      blocks: [
        {
          type: "p",
          text: "Records we are legally required to retain (e.g. anti-fraud, tax and regulatory records under applicable Nigerian law) are kept for up to the period required by law, then permanently deleted. We do not retain this data for any other purpose.",
        },
      ],
    },
    {
      title: "Contact",
      blocks: [
        { type: "subhead", text: "Klario (by Raavon Limited, RC-9537604)" },
        { type: "p", text: "Email: support@klario.finance" },
        { type: "p", text: "Last updated: 11 July 2026" },
      ],
    },
  ],
};

export const COOKIES: LegalPage = {
  slug: "cookies",
  title: "Cookie Policy",
  ...dates,
  preamble: [
    draftNotice,
    {
      type: "p",
      text: `This Cookie Policy explains how Klario (a product of Raavon Limited) uses cookies and similar tracking technologies on the klario.finance website (the "Website").`,
    },
    {
      type: "p",
      text: "This policy should be read alongside our Privacy Policy, which provides broader information about how we collect and use personal information.",
    },
  ],
  sections: [
    {
      title: "What Are Cookies",
      blocks: [
        {
          type: "p",
          text: "Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites function correctly, improve efficiency, and provide information to website owners.",
        },
        { type: "p", text: "Cookies may be:" },
        {
          type: "list",
          items: [
            "Session cookies, temporary files deleted when you close your browser",
            "Persistent cookies, files that remain on your device for a defined period or until you delete them",
            "First-party cookies, set directly by Klario",
            "Third-party cookies, set by external services we use (we minimise these significantly)",
          ],
        },
      ],
    },
    {
      title: "How We Use Cookies",
      blocks: [
        { type: "subhead", text: "2.1 Strictly Necessary Cookies" },
        {
          type: "p",
          text: "These cookies are essential for the Website to function correctly. They cannot be disabled. They include:",
        },
        {
          type: "list",
          items: [
            "Authentication tokens, to keep you securely logged in during your session",
            "Security tokens, to protect against cross-site request forgery (CSRF)",
            "Load balancing cookies, to distribute traffic efficiently across our servers",
          ],
        },
        { type: "subhead", text: "2.2 Preference Cookies" },
        {
          type: "p",
          text: "These cookies remember your settings and personalise your experience. They include:",
        },
        {
          type: "list",
          items: [
            "Theme preference (light or dark mode)",
            "Language and regional settings",
            "Previously dismissed notifications or banners",
          ],
        },
        { type: "p", text: "Preference cookies typically expire after 12 months." },
        { type: "subhead", text: "2.3 Analytics Cookies" },
        {
          type: "p",
          text: "These cookies help us understand how visitors interact with our Website so we can improve it. We use privacy-first analytics tools that do not share your individual data with third parties and do not build advertising profiles.",
        },
        { type: "p", text: "Data collected includes:" },
        {
          type: "list",
          items: [
            "Pages visited and time spent on each page",
            "Entry and exit points",
            "Browser type and device category",
            "General geographic region (country level only)",
          ],
        },
        {
          type: "p",
          text: "You may opt out of analytics cookies at any time through our cookie preference centre.",
        },
        { type: "subhead", text: "2.4 Performance Cookies" },
        {
          type: "p",
          text: "These cookies help us monitor the technical performance of the Website, including:",
        },
        {
          type: "list",
          items: [
            "Page load times and errors",
            "Feature usage rates",
            "Crash and diagnostic reports",
          ],
        },
      ],
    },
    {
      title: "What We Do Not Do",
      blocks: [
        { type: "p", text: "Klario does not:" },
        {
          type: "list",
          items: [
            "Use advertising or retargeting cookies",
            "Allow third-party advertisers to place cookies on our Website",
            "Sell cookie data or behavioural profiles to any third party",
            "Track your activity across other websites you visit after leaving klario.finance",
          ],
        },
      ],
    },
    {
      title: "Managing Your Cookie Preferences",
      blocks: [
        { type: "subhead", text: "4.1 Cookie Preference Centre" },
        {
          type: "p",
          text: `You can manage your non-essential cookie preferences at any time by clicking "Cookie Settings" in the footer of our Website.`,
        },
        { type: "subhead", text: "4.2 Browser Settings" },
        {
          type: "p",
          text: "You can also control cookies through your browser settings. Most browsers allow you to:",
        },
        {
          type: "list",
          items: [
            "View cookies currently stored on your device",
            "Delete individual or all cookies",
            "Block cookies from specific websites",
            "Block all third-party cookies",
          ],
        },
        {
          type: "p",
          text: "Please note that disabling strictly necessary cookies will affect the functionality of the Website and may prevent you from accessing certain features.",
        },
        { type: "p", text: "Browser-specific guidance is available at:" },
        {
          type: "list",
          items: [
            "Chrome: support.google.com/chrome",
            "Firefox: support.mozilla.org",
            "Safari: support.apple.com",
            "Edge: support.microsoft.com",
          ],
        },
        { type: "subhead", text: "4.3 Opt-Out of Analytics" },
        {
          type: "p",
          text: `To opt out of analytics tracking specifically, you may also enable "Do Not Track" in your browser settings. We honour this signal.`,
        },
      ],
    },
    {
      title: "Cookies and the Klario Mobile App",
      blocks: [
        {
          type: "p",
          text: "The Klario mobile application does not use browser cookies. The app uses secure, encrypted local storage and device-level tokens to maintain your session and preferences. These are governed by our Privacy Policy rather than this Cookie Policy.",
        },
      ],
    },
    {
      title: "Updates to This Policy",
      blocks: [
        {
          type: "p",
          text: "We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for operational, legal, or regulatory reasons.",
        },
        {
          type: "p",
          text: "The date at the top of this page indicates when the Policy was last updated. We encourage you to review this page periodically.",
        },
      ],
    },
    {
      title: "Contact Us",
      blocks: [
        {
          type: "p",
          text: "If you have any questions about our use of cookies or this Cookie Policy, please contact us:",
        },
        { type: "subhead", text: "Klario Finance" },
        { type: "p", text: "Powered by Raavon Limited (RC-9537604)" },
        { type: "p", text: "Raavon contact: contact@raavon.com" },
        { type: "p", text: "Email: privacy@klario.finance" },
        { type: "p", text: "Website: klario.finance" },
        {
          type: "link",
          prefix: "Parent Company: ",
          label: "www.raavon.com",
          href: "https://www.raavon.com",
        },
        {
          type: "p",
          text: "We aim to respond to all enquiries within 5 business days.",
        },
      ],
    },
  ],
};

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "subhead"; text: string }
  | { type: "link"; prefix?: string; label: string; href: string };

export type LegalSection = {
  title: string;
  blocks: Block[];
};

export type LegalPage = {
  slug: "privacy" | "terms" | "cookies";
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  preamble: Block[];
  sections: LegalSection[];
};

const dates = {
  effectiveDate: "10 May 2026",
  lastUpdated: "10 May 2026",
};

export const PRIVACY: LegalPage = {
  slug: "privacy",
  title: "Privacy Policy",
  ...dates,
  preamble: [
    {
      type: "p",
      text: `Klario Finance ("Klario", "we", "us", or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, store, share, and protect your data when you use the Klario mobile application and website (collectively, the "Platform").`,
    },
    {
      type: "p",
      text: `By accessing or using the Platform, you acknowledge that you have read, understood, and agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of the Platform immediately.`,
    },
  ],
  sections: [
    {
      title: "Information We Collect",
      blocks: [
        { type: "subhead", text: "1.1 Information You Provide Directly" },
        {
          type: "p",
          text: "We collect information you voluntarily provide when you register for an account or use our services, including:",
        },
        {
          type: "list",
          items: [
            "Full name and date of birth",
            "Email address and phone number",
            "Bank Verification Number (BVN) for identity verification",
            "Profile photograph (optional)",
            "Financial goals and preferences you set within the Platform",
          ],
        },
        { type: "subhead", text: "1.2 Information We Collect Automatically" },
        {
          type: "p",
          text: "When you use the Platform, we automatically collect certain technical information, including:",
        },
        {
          type: "list",
          items: [
            "Device type, operating system, and unique device identifiers",
            "IP address and approximate location",
            "App usage data, feature interactions, and session duration",
            "Crash reports and performance diagnostics",
          ],
        },
        { type: "subhead", text: "1.3 Financial Information" },
        {
          type: "p",
          text: "To provide our core services, we collect the following financial data via licensed open banking infrastructure:",
        },
        {
          type: "list",
          items: [
            "Bank account names and account numbers (masked)",
            "Account balances and transaction history",
            "Spending categories and patterns",
          ],
        },
        {
          type: "p",
          text: "Important: We access your financial data on a read-only basis through licensed data partners. We do not store your bank login credentials. Your username and password for any bank are never transmitted to or stored on Klario's servers.",
        },
      ],
    },
    {
      title: "How We Use Your Information",
      blocks: [
        {
          type: "p",
          text: "We use the information we collect for the following purposes:",
        },
        { type: "subhead", text: "2.1 Service Delivery" },
        {
          type: "list",
          items: [
            "To create and manage your Klario account",
            "To display consolidated financial data from your connected bank accounts",
            "To generate AI-powered financial insights and recommendations personalised to your spending behaviour",
            "To execute bill payments and savings instructions you initiate within the Platform",
          ],
        },
        { type: "subhead", text: "2.2 Security and Fraud Prevention" },
        {
          type: "list",
          items: [
            "To verify your identity and prevent unauthorised access",
            "To monitor for suspicious activity and protect your account",
            "To comply with anti-money laundering (AML) obligations",
          ],
        },
        { type: "subhead", text: "2.3 Platform Improvement" },
        {
          type: "list",
          items: [
            "To analyse usage patterns and improve product features",
            "To diagnose technical issues and optimise performance",
            "To conduct internal research and product development",
          ],
        },
        { type: "subhead", text: "2.4 Communications" },
        {
          type: "list",
          items: [
            "To send transactional notifications (payment confirmations, savings updates, security alerts)",
            "To deliver important updates about changes to our services or policies",
            "To send marketing communications where you have provided consent (you may opt out at any time)",
          ],
        },
      ],
    },
    {
      title: "How We Share Your Information",
      blocks: [
        {
          type: "p",
          text: "Klario does not sell, rent, or trade your personal information to third parties for commercial purposes.",
        },
        {
          type: "p",
          text: "We may share your information only in the following limited circumstances:",
        },
        { type: "subhead", text: "3.1 Licensed Service Partners" },
        {
          type: "p",
          text: "We work with carefully selected partners to deliver our services. These include:",
        },
        {
          type: "list",
          items: [
            "Open banking data providers, to securely retrieve your financial data from connected banks",
            "Payment processors, to facilitate bill payments and subscription billing",
            "Cloud infrastructure providers, to host and secure your data",
          ],
        },
        {
          type: "p",
          text: "All partners are contractually bound to handle your data in accordance with applicable data protection laws and may not use your data for any purpose beyond delivering the agreed service.",
        },
        { type: "subhead", text: "3.2 Legal and Regulatory Obligations" },
        {
          type: "p",
          text: "We may disclose your information where required by law, court order, or regulatory authority, including the Central Bank of Nigeria (CBN) and the Nigeria Data Protection Commission (NDPC).",
        },
        { type: "subhead", text: "3.3 Business Transfers" },
        {
          type: "p",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the successor entity. We will notify you prior to such a transfer.",
        },
      ],
    },
    {
      title: "Data Security",
      blocks: [
        {
          type: "p",
          text: "We implement industry-standard technical and organisational measures to protect your personal information, including:",
        },
        {
          type: "list",
          items: [
            "AES-256 encryption for all data stored at rest",
            "TLS 1.3 encryption for all data transmitted in transit",
            "Row-level security architecture ensuring no cross-user data access is architecturally possible",
            "Biometric and PIN-based authentication at the application level",
            "HMAC-SHA512 cryptographic verification on all payment callbacks",
            "Regular vulnerability assessments and security audits",
          ],
        },
        {
          type: "p",
          text: "While we apply rigorous security controls, no system can guarantee absolute security. We encourage you to use a strong, unique PIN and to enable biometric authentication within the app.",
        },
      ],
    },
    {
      title: "Data Retention",
      blocks: [
        {
          type: "p",
          text: "We retain your personal data for as long as your account remains active or as required to fulfil our legal and regulatory obligations.",
        },
        { type: "p", text: "Upon account deletion:" },
        {
          type: "list",
          items: [
            "Your personal profile data is permanently deleted within 30 days",
            "Transaction history and financial data are deleted within 30 days",
            "Anonymised, aggregated analytics data may be retained indefinitely as it cannot be linked to any individual",
          ],
        },
      ],
    },
    {
      title: "Your Rights",
      blocks: [
        {
          type: "p",
          text: "Under the Nigeria Data Protection Act (NDPA) and applicable regulations, you have the following rights regarding your personal data:",
        },
        { type: "subhead", text: "Right of Access" },
        {
          type: "p",
          text: "You may request a copy of the personal data we hold about you at any time.",
        },
        { type: "subhead", text: "Right to Rectification" },
        {
          type: "p",
          text: "You may request correction of any inaccurate or incomplete personal data.",
        },
        { type: "subhead", text: "Right to Erasure" },
        {
          type: "p",
          text: "You may request deletion of your personal data, subject to our legal retention obligations.",
        },
        { type: "subhead", text: "Right to Withdraw Consent" },
        {
          type: "p",
          text: "Where we process your data based on consent, you may withdraw that consent at any time without affecting the lawfulness of prior processing.",
        },
        { type: "subhead", text: "Right to Data Portability" },
        {
          type: "p",
          text: "You may request your data in a structured, machine-readable format.",
        },
        { type: "subhead", text: "Right to Lodge a Complaint" },
        {
          type: "p",
          text: "You have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your data rights have been violated.",
        },
        {
          type: "p",
          text: "To exercise any of these rights, contact us at: privacy@klario.finance",
        },
        {
          type: "p",
          text: "We will respond to all verified requests within 30 days of receipt.",
        },
      ],
    },
    {
      title: "Cookies and Tracking",
      blocks: [
        {
          type: "p",
          text: "Our website uses cookies and similar tracking technologies to improve your browsing experience. Please refer to our Cookie Policy for full details on how we use cookies and how you can manage your preferences.",
        },
      ],
    },
    {
      title: "Children's Privacy",
      blocks: [
        {
          type: "p",
          text: "The Klario Platform is intended for users aged 18 and above. We do not knowingly collect personal information from individuals under the age of 18. If we become aware that a minor has registered an account, we will promptly delete the account and associated data.",
        },
      ],
    },
    {
      title: "Changes to This Policy",
      blocks: [
        {
          type: "p",
          text: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal obligations. Where changes are material, we will notify you via email or in-app notification at least 14 days before the changes take effect.",
        },
        {
          type: "p",
          text: "Your continued use of the Platform after the effective date of any update constitutes your acceptance of the revised Policy.",
        },
      ],
    },
    {
      title: "Contact Us",
      blocks: [
        {
          type: "p",
          text: "If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:",
        },
        { type: "subhead", text: "Klario Finance" },
        { type: "p", text: "Powered by Raavon Limited — RC-9537604" },
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

export const TERMS: LegalPage = {
  slug: "terms",
  title: "Terms of Service",
  ...dates,
  preamble: [
    {
      type: "p",
      text: `These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and Klario Finance ("Klario", "we", "us", or "our") governing your access to and use of the Klario mobile application and website (the "Platform").`,
    },
    {
      type: "p",
      text: "Please read these Terms carefully before using the Platform. By creating an account or using any part of the Platform, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.",
    },
  ],
  sections: [
    {
      title: "About Klario",
      blocks: [
        {
          type: "p",
          text: "Klario is a personal finance management platform developed under Klario Finance and operated by Raavon Limited (RC-9537604, www.raavon.com). We are not a bank, deposit-taking institution, or payment service provider. We do not hold, custody, or control your funds. All banking and payment functions are delivered through licensed third-party financial infrastructure partners operating under the regulatory framework of the Central Bank of Nigeria (CBN).",
        },
      ],
    },
    {
      title: "Eligibility",
      blocks: [
        { type: "p", text: "To use the Klario Platform, you must:" },
        {
          type: "list",
          items: [
            "Be at least 18 years of age",
            "Be a resident of Nigeria",
            "Possess a valid Nigerian Bank Verification Number (BVN)",
            "Have the legal capacity to enter into a binding agreement",
            "Provide accurate, current, and complete registration information",
          ],
        },
        {
          type: "p",
          text: "By registering an account, you represent and warrant that you meet all of the above eligibility requirements.",
        },
      ],
    },
    {
      title: "Account Registration and Security",
      blocks: [
        { type: "subhead", text: "3.1 Account Creation" },
        {
          type: "p",
          text: "You must register an account to access Klario's core features. You agree to provide truthful, accurate, and complete information during registration and to keep your information current.",
        },
        { type: "subhead", text: "3.2 Account Security" },
        { type: "p", text: "You are solely responsible for:" },
        {
          type: "list",
          items: [
            "Maintaining the confidentiality of your login credentials, PIN, and biometric authentication",
            "All activities that occur under your account",
            "Notifying us immediately at security@klario.finance if you suspect any unauthorised access or security breach",
          ],
        },
        {
          type: "p",
          text: "Klario will not be liable for any loss or damage arising from your failure to maintain the security of your account credentials.",
        },
        { type: "subhead", text: "3.3 One Account Per User" },
        {
          type: "p",
          text: "You may only maintain one active Klario account. Creating multiple accounts or accounts on behalf of another person without their explicit authorisation is strictly prohibited.",
        },
      ],
    },
    {
      title: "Services",
      blocks: [
        { type: "subhead", text: "4.1 Platform Services" },
        {
          type: "p",
          text: "Subject to these Terms, Klario provides the following services depending on your subscription tier:",
        },
        {
          type: "list",
          items: [
            "Bank Account Aggregation: Read-only access to your connected Nigerian bank accounts, displaying consolidated balances and transaction history",
            "KlarioAI Financial Assistant: An AI-powered conversational assistant that provides personalised financial insights based on your account data",
            "Savings Goal Management: Automated savings instructions that direct funds to a dedicated savings account opened in your name at our banking partner",
            "Bill Payments: Facilitation of airtime, data, electricity, and cable TV payments initiated by you",
            "Human Financial Manager: A dedicated financial professional assigned to Financial Executive tier subscribers",
          ],
        },
        { type: "subhead", text: "4.2 Service Availability" },
        {
          type: "p",
          text: "We endeavour to maintain continuous Platform availability but do not guarantee uninterrupted service. Scheduled maintenance, system upgrades, or events beyond our control may temporarily affect availability. We will notify users of planned downtime where reasonably possible.",
        },
        { type: "subhead", text: "4.3 Service Modifications" },
        {
          type: "p",
          text: "We reserve the right to modify, suspend, or discontinue any feature or service at any time. Where changes are material, we will provide reasonable advance notice.",
        },
      ],
    },
    {
      title: "Subscription and Payment Terms",
      blocks: [
        { type: "subhead", text: "5.1 Subscription Tiers" },
        { type: "p", text: "Klario offers three subscription tiers:" },
        {
          type: "list",
          items: [
            "Free: ₦0 / month, limited features as described on the Platform",
            "Money Manager: ₦1,900 / month, expanded features as described on the Platform",
            "Financial Executive: ₦5,400 / month, full feature access including dedicated human financial manager",
          ],
        },
        { type: "subhead", text: "5.2 Transaction Fees" },
        {
          type: "p",
          text: "A flat transaction fee of ₦10 applies to each outbound transaction initiated by Free and Money Manager tier users. Financial Executive tier users are exempt from transaction fees.",
        },
        { type: "subhead", text: "5.3 Billing and Renewal" },
        {
          type: "p",
          text: "Paid subscriptions are billed monthly in advance. Your subscription will automatically renew on the same date each month unless cancelled before the renewal date.",
        },
        { type: "subhead", text: "5.4 Cancellation" },
        {
          type: "p",
          text: "You may cancel your subscription at any time through the app settings. Cancellation takes effect at the end of the current billing period. We do not provide refunds for the remaining days of a cancelled billing period.",
        },
        { type: "subhead", text: "5.5 Price Changes" },
        {
          type: "p",
          text: "We reserve the right to change subscription prices with 30 days' written notice. Continued use of the Platform after a price change takes effect constitutes acceptance of the new pricing.",
        },
      ],
    },
    {
      title: "Prohibited Conduct",
      blocks: [
        { type: "p", text: "You agree not to:" },
        {
          type: "list",
          items: [
            "Use the Platform for any unlawful, fraudulent, or deceptive purpose",
            "Attempt to gain unauthorised access to any part of the Platform or its underlying systems",
            "Reverse engineer, decompile, or disassemble any component of the Platform",
            "Use automated tools, bots, or scrapers to interact with the Platform",
            "Upload, transmit, or distribute malicious code or content",
            "Impersonate any person, entity, or Klario employee",
            "Use the Platform to facilitate money laundering, terrorist financing, or any other financial crime",
            "Violate any applicable local, national, or international law or regulation",
          ],
        },
        {
          type: "p",
          text: "Violation of these prohibitions may result in immediate account suspension or termination and may be reported to relevant law enforcement or regulatory authorities.",
        },
      ],
    },
    {
      title: "Intellectual Property",
      blocks: [
        {
          type: "p",
          text: "All content, features, design elements, trademarks, logos, software, and technology comprising the Klario Platform are the exclusive property of Klario Finance and are protected by applicable intellectual property laws.",
        },
        {
          type: "p",
          text: "Nothing in these Terms grants you any right, title, or interest in our intellectual property. You may not reproduce, distribute, modify, or create derivative works from any part of the Platform without our prior written consent.",
        },
      ],
    },
    {
      title: "Disclaimer of Warranties",
      blocks: [
        {
          type: "p",
          text: `The Platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.`,
        },
        { type: "p", text: "Klario does not warrant that:" },
        {
          type: "list",
          items: [
            "The Platform will be uninterrupted, error-free, or free of viruses or harmful components",
            "Financial insights generated by KlarioAI constitute professional financial advice",
            "The accuracy of third-party financial data retrieved from your banks",
          ],
        },
        {
          type: "p",
          text: "KlarioAI insights are for informational purposes only and should not be relied upon as a substitute for professional financial advice.",
        },
      ],
    },
    {
      title: "Limitation of Liability",
      blocks: [
        {
          type: "p",
          text: "To the fullest extent permitted by applicable law, Klario Finance, its directors, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:",
        },
        {
          type: "list",
          items: [
            "Your use of or inability to use the Platform",
            "Unauthorised access to your account resulting from your failure to maintain credential security",
            "Inaccuracies in third-party financial data",
            "Actions or omissions of our banking or infrastructure partners",
          ],
        },
        {
          type: "p",
          text: "In no event shall our total cumulative liability exceed the total subscription fees paid by you to Klario in the three months immediately preceding the claim.",
        },
      ],
    },
    {
      title: "Indemnification",
      blocks: [
        {
          type: "p",
          text: "You agree to indemnify, defend, and hold harmless Klario Finance and its officers, directors, employees, and partners from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from:",
        },
        {
          type: "list",
          items: [
            "Your use of the Platform",
            "Your violation of these Terms",
            "Your violation of any third-party rights",
            "Any content you submit through the Platform",
          ],
        },
      ],
    },
    {
      title: "Termination",
      blocks: [
        { type: "subhead", text: "11.1 Termination by You" },
        {
          type: "p",
          text: `You may terminate your account at any time by selecting "Delete Account" in the app settings. Upon deletion, your data will be permanently removed within 30 days.`,
        },
        { type: "subhead", text: "11.2 Termination by Klario" },
        {
          type: "p",
          text: "We reserve the right to suspend or permanently terminate your account, with or without notice, if we determine that you have:",
        },
        {
          type: "list",
          items: [
            "Violated any provision of these Terms",
            "Engaged in fraudulent, abusive, or illegal activity",
            "Created risk or legal exposure for Klario or its users",
          ],
        },
        { type: "subhead", text: "11.3 Effect of Termination" },
        {
          type: "p",
          text: "Upon termination, your right to access the Platform ceases immediately. Provisions that by their nature should survive termination shall do so, including intellectual property, limitation of liability, indemnification, and governing law.",
        },
      ],
    },
    {
      title: "Governing Law and Dispute Resolution",
      blocks: [
        {
          type: "p",
          text: "These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.",
        },
        {
          type: "p",
          text: "Any dispute arising from or relating to these Terms or your use of the Platform shall first be subject to good-faith negotiation between the parties. If unresolved within 30 days, the dispute shall be referred to mediation or arbitration under Nigerian law.",
        },
      ],
    },
    {
      title: "Changes to These Terms",
      blocks: [
        {
          type: "p",
          text: "We reserve the right to update these Terms at any time. Material changes will be communicated via email or prominent in-app notification at least 14 days before taking effect.",
        },
        {
          type: "p",
          text: "Your continued use of the Platform following notification of changes constitutes your acceptance of the revised Terms.",
        },
      ],
    },
    {
      title: "Contact",
      blocks: [
        {
          type: "p",
          text: "For questions or concerns regarding these Terms:",
        },
        { type: "subhead", text: "Klario Finance" },
        { type: "p", text: "Powered by Raavon Limited — RC-9537604" },
        { type: "p", text: "Email: legal@klario.finance" },
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

export const COOKIES: LegalPage = {
  slug: "cookies",
  title: "Cookie Policy",
  ...dates,
  preamble: [
    {
      type: "p",
      text: `This Cookie Policy explains how Klario Finance ("Klario", "we", "us", or "our") uses cookies and similar tracking technologies on the klario.finance website (the "Website").`,
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
        { type: "p", text: "Powered by Raavon Limited — RC-9537604" },
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

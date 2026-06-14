This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Klario admin

The admin area runs the private beta: it stores form submissions and the beta
list in Supabase, and sends email through Resend. It lives at the obfuscated
path **`/p@ss1`** (rewritten to `/admin` in `next.config.ts`).

### What it does

- **Subscribers** (`/p@ss1/subscribers`): the owned beta list (`beta_signups`).
  Search, filter by status, import a contacts CSV, and send the beta welcome
  email to selected people or per row. Sends are idempotent (already-invited
  people are skipped unless you choose Resend).
- **Submissions** (`/p@ss1/submissions`): every beta / ambassador / contact form
  fill, with a detail drawer and CSV export.
- **Beta invite** (`/p@ss1/email`): live preview of the welcome email, editable
  subject + CTA URL (saved to a `settings` row), a single-address test send, and
  a Resend deliverability checklist.
- **Compose mail** (`/p@ss1/newsletters/new`): pick an HTML template, edit it
  (including raw HTML), insert images, preview live, and send to the whole list.

Public form routes (`/api/beta`, `/api/newsletter`, `/api/ambassador`,
`/api/contact`) upsert into `beta_signups`, log to `submissions`, send a branded
confirmation, and notify `ADMIN_NOTIFY_EMAIL`.

### Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key, **server only**, bypasses RLS |
| `ADMIN_EMAILS` | Comma-separated allowlist of admin emails |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM` | From address, e.g. `Klario <hello@klario.finance>` |
| `RESEND_REPLY_TO` | Reply-to address |
| `ADMIN_NOTIFY_EMAIL` | Inbox for new-submission notifications |
| `EMAIL_LINK_SECRET` | Signs unsubscribe links (falls back to the service role key) |

### One-time Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL editor**, run `supabase/migrations/0001_init.sql`. This creates
   `beta_signups`, `submissions`, `email_log`, `newsletters`, and `settings`,
   all with RLS enabled and no policies (the service role key bypasses RLS; the
   public key can never read these tables).
3. **Storage**: create a public bucket named `email-assets` (Storage → New
   bucket → public). This is where composed-email images are uploaded.
4. **Auth**: turn off public sign-ups (Authentication → Providers → Email →
   disable "Allow new users to sign up"), then add each admin under
   Authentication → Users → Add user (email + password). Put the same emails in
   `ADMIN_EMAILS`. Anyone not in the allowlist is redirected away even if signed in.
5. Copy the project URL and both keys from Project Settings → API into `.env`.

### Resend domain setup (required before sending to real people)

1. In Resend, add **klario.finance** under [Domains](https://resend.com/domains).
2. Publish the **SPF**, **DKIM**, and **DMARC** DNS records Resend gives you and
   wait for the domain to show **Verified**.
3. Send from `hello@klario.finance` on that verified domain.
4. Until then, use only the **test send** on the Beta invite page. The
   deliverability panel there tracks this with a confirmation toggle.

### Run locally

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

Visit [http://localhost:3000/p@ss1](http://localhost:3000/p@ss1) and sign in with
an `ADMIN_EMAILS` account.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

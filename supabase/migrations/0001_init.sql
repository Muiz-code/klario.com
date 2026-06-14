-- Klario admin schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI) once per project.
--
-- Notes on security:
--   All reads and writes happen server side with the service role key, which
--   bypasses Row Level Security. We still enable RLS on every table with no
--   policies, so the public anon key can never read or write these tables even
--   if it leaks. Do not add permissive policies unless you mean to.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- beta_signups: the owned mailing list / waitlist. Source of truth.
-- ---------------------------------------------------------------------------
create table if not exists public.beta_signups (
  id          uuid primary key default gen_random_uuid(),
  first_name  text,
  last_name   text,
  email       text not null unique,
  status      text not null default 'pending'
              check (status in ('pending', 'invited', 'active', 'unsubscribed')),
  source      text,
  phone       text,
  device      text,
  banks       text,
  invited_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists beta_signups_status_idx  on public.beta_signups (status);
create index if not exists beta_signups_created_idx  on public.beta_signups (created_at desc);

-- ---------------------------------------------------------------------------
-- submissions: append-only log of every public form fill (incl. contact /
-- ambassador notes that are not necessarily mailing-list subscribers).
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('beta', 'ambassador', 'contact', 'newsletter')),
  email        text,
  name         text,
  phone        text,
  banks        text,
  device       text,
  role         text,
  institution  text,
  why          text,
  topic        text,
  message      text,
  created_at   timestamptz not null default now()
);

create index if not exists submissions_kind_idx    on public.submissions (kind);
create index if not exists submissions_created_idx  on public.submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- email_log: one row per recipient per send attempt.
-- ---------------------------------------------------------------------------
create table if not exists public.email_log (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  type       text not null,
  resend_id  text,
  status     text not null default 'sent' check (status in ('sent', 'failed')),
  error      text,
  sent_at    timestamptz not null default now()
);

create index if not exists email_log_sent_idx  on public.email_log (sent_at desc);
create index if not exists email_log_type_idx  on public.email_log (type);

-- ---------------------------------------------------------------------------
-- newsletters: campaign history (batch sent to the owned list).
-- ---------------------------------------------------------------------------
create table if not exists public.newsletters (
  id               uuid primary key default gen_random_uuid(),
  subject          text not null,
  html             text not null,
  status           text not null default 'draft'
                   check (status in ('draft', 'sending', 'sent', 'failed')),
  recipient_count  integer not null default 0,
  sent_count       integer not null default 0,
  sent_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists newsletters_created_idx on public.newsletters (created_at desc);

-- ---------------------------------------------------------------------------
-- settings: single config row keyed 'default'. Holds the editable welcome
-- subject + CTA, and the deliverability acknowledgement flag.
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id                       text primary key default 'default',
  welcome_subject          text not null default 'Welcome to the Klario beta',
  welcome_cta_url          text not null default 'https://www.klario.finance',
  deliverability_confirmed boolean not null default false,
  updated_at               timestamptz not null default now()
);

insert into public.settings (id) values ('default')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Lock everything down: RLS on, no policies. Service role bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.beta_signups enable row level security;
alter table public.submissions  enable row level security;
alter table public.email_log    enable row level security;
alter table public.newsletters  enable row level security;
alter table public.settings     enable row level security;

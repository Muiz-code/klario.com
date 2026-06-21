-- ===========================================================================
-- Klario — full schema setup (migrations 0001-0014, consolidated).
-- Paste this whole file into the Supabase SQL editor and run it once on a fresh
-- database. Every statement is idempotent (create ... if not exists /
-- add column if not exists), so it is safe to re-run.
--
-- Security model: all reads/writes go through the server with the service-role
-- key (bypasses RLS). RLS is enabled on every table with NO policies, so the
-- public anon key can never touch these tables even if it leaks.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --- beta_signups: owned mailing list / waitlist --------------------------
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

-- --- submissions: append-only log of every public form fill ----------------
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
  level        text,
  why          text,
  topic        text,
  message      text,
  created_at   timestamptz not null default now()
);
-- Backfill for databases created before `level` existed.
alter table public.submissions add column if not exists level text;
create index if not exists submissions_kind_idx     on public.submissions (kind);
create index if not exists submissions_created_idx   on public.submissions (created_at desc);

-- --- email_log: one row per recipient per send -----------------------------
create table if not exists public.email_log (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  type       text not null,
  resend_id  text,
  status     text not null default 'sent',
  error      text,
  sent_at    timestamptz not null default now()
);
create index if not exists email_log_sent_idx  on public.email_log (sent_at desc);
create index if not exists email_log_type_idx  on public.email_log (type);

-- --- newsletters: campaign history -----------------------------------------
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

-- --- settings: single config row -------------------------------------------
create table if not exists public.settings (
  id                       text primary key default 'default',
  welcome_subject          text not null default 'Welcome to the Klario beta',
  welcome_cta_url          text not null default 'https://www.klario.finance',
  deliverability_confirmed boolean not null default false,
  updated_at               timestamptz not null default now()
);
insert into public.settings (id) values ('default') on conflict (id) do nothing;

-- --- audit_log (0002) ------------------------------------------------------
create table if not exists public.audit_log (
  id               uuid primary key default gen_random_uuid(),
  action           text not null,
  actor            text,
  subject          text,
  template         text,
  segment          text,
  recipient_count  integer not null default 0,
  sent_count       integer not null default 0,
  failed_count     integer not null default 0,
  delivered_count  integer not null default 0,
  bounced_count    integer not null default 0,
  meta             jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_action_idx  on public.audit_log (action);
alter table public.audit_log
  add column if not exists opened_count  integer not null default 0,
  add column if not exists clicked_count integer not null default 0;

-- --- email_log extensions (0002 + 0003) ------------------------------------
alter table public.email_log
  add column if not exists audit_id     uuid references public.audit_log(id) on delete set null,
  add column if not exists delivered_at timestamptz,
  add column if not exists opened_at    timestamptz,
  add column if not exists clicked_at   timestamptz;
create index if not exists email_log_audit_idx  on public.email_log (audit_id);
create index if not exists email_log_resend_idx on public.email_log (resend_id);
alter table public.email_log drop constraint if exists email_log_status_check;
alter table public.email_log
  add constraint email_log_status_check
  check (status in ('sent', 'failed', 'delivered', 'bounced', 'complained'));

-- --- automations (0004) ----------------------------------------------------
create table if not exists public.automations (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  name         text not null,
  enabled      boolean not null default false,
  delay_hours  integer not null default 0,
  subject      text not null default '',
  body         text not null default '',
  sent_count   integer not null default 0,
  last_run_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.automation_runs (
  id            uuid primary key default gen_random_uuid(),
  automation_id uuid not null references public.automations(id) on delete cascade,
  signup_id     uuid not null references public.beta_signups(id) on delete cascade,
  email         text not null,
  status        text not null default 'sent',
  created_at    timestamptz not null default now(),
  unique (automation_id, signup_id)
);
create index if not exists automation_runs_automation_idx on public.automation_runs (automation_id);

-- --- segments (0005) -------------------------------------------------------
create table if not exists public.segments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  match_type  text not null default 'all' check (match_type in ('all', 'any')),
  rules       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists segments_created_idx on public.segments (created_at desc);

-- --- email_templates (0006) ------------------------------------------------
create table if not exists public.email_templates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text not null default '',
  subject      text not null default '',
  html         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists email_templates_created_idx on public.email_templates (created_at desc);

-- --- beta_responses (0007) + all beta columns (0008-0014) ------------------
create table if not exists public.beta_responses (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  ref                text unique,
  name               text,
  email              text not null unique,
  phone              text,
  method             text,
  pain               text[] not null default '{}',
  sheetlife          text,
  trust              integer check (trust between 1 and 5),
  features           text[] not null default '{}',
  price              text,
  dream              text,
  user_agent         text,
  referrer           text,
  confirmation_sent  boolean not null default false
);
create index if not exists beta_responses_created_idx on public.beta_responses (created_at desc);

alter table public.beta_responses
  add column if not exists referred_by_ref text,
  add column if not exists referred_by_id  uuid references public.beta_responses(id) on delete set null,
  add column if not exists ip              text,
  add column if not exists verified        boolean not null default false,
  add column if not exists verified_at     timestamptz,
  add column if not exists ai_risk         integer,
  add column if not exists ai_level        text,
  add column if not exists ai_reasons      text[] not null default '{}',
  add column if not exists ai_checked_at   timestamptz,
  add column if not exists fingerprint     text,
  add column if not exists occupation      text,
  add column if not exists notes           jsonb not null default '{}'::jsonb;

create index if not exists beta_responses_referred_by_idx on public.beta_responses (referred_by_id);
create index if not exists beta_responses_ip_idx          on public.beta_responses (ip);
create index if not exists beta_responses_fingerprint_idx on public.beta_responses (fingerprint);

-- --- Lock everything down: RLS on, no policies -----------------------------
alter table public.beta_signups     enable row level security;
alter table public.submissions      enable row level security;
alter table public.email_log        enable row level security;
alter table public.newsletters      enable row level security;
alter table public.settings         enable row level security;
alter table public.audit_log        enable row level security;
alter table public.automations      enable row level security;
alter table public.automation_runs  enable row level security;
alter table public.segments         enable row level security;
alter table public.email_templates  enable row level security;
alter table public.beta_responses   enable row level security;

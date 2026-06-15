-- Automations: rule-based auto-sends (welcome, re-engage, win-back).
-- Run this in the Supabase SQL editor after 0003_engagement.sql.
--
-- Each automation is one row keyed by a stable `key`. The engine (cron) finds
-- eligible subscribers, sends, and records one automation_runs row per
-- (automation, subscriber) — the UNIQUE constraint there makes sends idempotent
-- so nobody is ever double-sent.

create table if not exists public.automations (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,        -- 'welcome' | 'reengage' | 'winback'
  name         text not null,
  enabled      boolean not null default false,
  delay_hours  integer not null default 0,  -- how long after the trigger to send
  subject      text not null default '',
  body         text not null default '',    -- used by reengage/winback (welcome uses its own template)
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

create index if not exists automation_runs_automation_idx
  on public.automation_runs (automation_id);

alter table public.automations     enable row level security;
alter table public.automation_runs enable row level security;

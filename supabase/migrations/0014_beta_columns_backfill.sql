-- Consolidated, idempotent backfill of every beta_responses column added in
-- migrations 0008-0013. Safe to run any time (and on a DB that already has some
-- of them). Run this in the Supabase SQL editor if /beta submissions fail with
-- "Could not save your response" — that means the DB is missing these columns.

alter table public.beta_responses
  add column if not exists referred_by_ref text,
  add column if not exists referred_by_id  uuid references public.beta_responses(id),
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

create index if not exists beta_responses_ip_idx
  on public.beta_responses (ip);
create index if not exists beta_responses_fingerprint_idx
  on public.beta_responses (fingerprint);

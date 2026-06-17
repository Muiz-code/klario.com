-- Beta questionnaire responses (public /beta wizard).
-- Run this in the Supabase SQL editor after 0006_templates.sql.
--
-- All reads/writes go through the server with the service role key, which
-- bypasses RLS. RLS is enabled with no policies, so the public anon key can
-- never read or write this table even if it leaks. The public submission route
-- inserts/updates server-side; the admin reads server-side.

create table if not exists public.beta_responses (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  ref                text unique,                 -- KLR-XXXXX
  name               text,
  email              text not null unique,        -- upsert key (stored lowercased)
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

create index if not exists beta_responses_created_idx
  on public.beta_responses (created_at desc);

alter table public.beta_responses enable row level security;

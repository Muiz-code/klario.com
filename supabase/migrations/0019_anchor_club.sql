-- Anchor Club registrations (public /anchor-club wizard).
-- Run this in the Supabase SQL editor after 0018_signup_unsubscribed_at.sql.
--
-- Same security model as beta_responses: all reads/writes go through the server
-- with the service role key (bypasses RLS). RLS is enabled with no policies, so
-- the public anon key can never read or write this table even if it leaks.

create table if not exists public.anchor_club (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  ref                text unique,                 -- KLR-XXXXX
  name               text,
  email              text not null unique,        -- upsert key (stored lowercased)
  phone              text,                         -- WhatsApp
  institution        text,
  level              text,                         -- e.g. "200 Level"
  area               text,                         -- area they want to grow in
  why                text,                         -- why they want to join
  excites            text[] not null default '{}', -- what excites them (checkboxes)
  challenge          text,                         -- biggest current challenge
  notes              jsonb not null default '{}',  -- free-text "other" per question
  pledge             boolean not null default false, -- pledged to participate
  guidelines         boolean not null default false, -- agreed to community guidelines
  user_agent         text,
  referrer           text,
  confirmation_sent  boolean not null default false
);

create index if not exists anchor_club_created_idx
  on public.anchor_club (created_at desc);

alter table public.anchor_club enable row level security;

-- Anti-fraud / security fields for the beta questionnaire.
-- Run this in the Supabase SQL editor after 0008_beta_referrals.sql.
--
--   ip          -- submitter IP (clustering: many "people" on one IP = suspect)
--   verified    -- did they confirm their email? Referrals only count when true.
--   verified_at -- when they confirmed.

alter table public.beta_responses
  add column if not exists ip          text,
  add column if not exists verified    boolean not null default false,
  add column if not exists verified_at timestamptz;

create index if not exists beta_responses_ip_idx on public.beta_responses (ip);

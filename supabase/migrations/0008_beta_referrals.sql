-- Referrals for the beta questionnaire.
-- Run this in the Supabase SQL editor after 0007_beta_responses.sql.
--
-- A respondent can enter the beta reference (KLR-XXXXX) of whoever invited them.
-- We keep the raw code they typed (referred_by_ref) and, when it matches an
-- existing response, a link to that referrer's row (referred_by_id).

alter table public.beta_responses
  add column if not exists referred_by_ref text,
  add column if not exists referred_by_id  uuid
    references public.beta_responses(id) on delete set null;

create index if not exists beta_responses_referred_by_idx
  on public.beta_responses (referred_by_id);

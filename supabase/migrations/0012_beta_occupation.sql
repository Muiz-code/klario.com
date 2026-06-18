-- What the respondent does (occupation). Run in the Supabase SQL editor after
-- 0011_beta_fingerprint.sql.
--
-- Drives who sees the referral program: only students are invited to refer.
-- Values: 'student' | 'business' | 'employed' | 'freelancer' (free text, but the
-- form only sends those).

alter table public.beta_responses
  add column if not exists occupation text;

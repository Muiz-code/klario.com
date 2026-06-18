-- Device fingerprint for the beta questionnaire (fraud clustering).
-- Run this in the Supabase SQL editor after 0010_beta_ai_fraud.sql.
--
-- A coarse hash of the browser/device (user agent, language, screen, timezone,
-- etc.). Many "different people" sharing one fingerprint = one person farming
-- referrals from the same device, even across networks/emails.

alter table public.beta_responses
  add column if not exists fingerprint text;

create index if not exists beta_responses_fingerprint_idx
  on public.beta_responses (fingerprint);

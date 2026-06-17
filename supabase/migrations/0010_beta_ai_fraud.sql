-- AI fraud-assessment fields for the beta questionnaire.
-- Run this in the Supabase SQL editor after 0009_beta_security.sql.
--
-- Populated by an admin-triggered Claude (Haiku) classifier that scores each
-- response against its answers + computed fraud signals.
--
--   ai_risk       -- 0-100 risk score (higher = more likely fraudulent)
--   ai_level      -- 'low' | 'medium' | 'high'
--   ai_reasons    -- short bullet reasons behind the score
--   ai_checked_at -- when the AI last assessed this row

alter table public.beta_responses
  add column if not exists ai_risk       integer,
  add column if not exists ai_level      text,
  add column if not exists ai_reasons    text[] not null default '{}',
  add column if not exists ai_checked_at timestamptz;

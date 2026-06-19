-- Free-text "other" notes per question: a small map of question key -> the text
-- the respondent typed in addition to the preset options. Run in the Supabase
-- SQL editor after 0012_beta_occupation.sql.
--
-- Keys: method, pain, sheetlife, trust, features, occupation.

alter table public.beta_responses
  add column if not exists notes jsonb not null default '{}'::jsonb;

-- Student level for ambassador submissions (100 Level, 200 Level, … Postgraduate).
alter table public.submissions add column if not exists level text;

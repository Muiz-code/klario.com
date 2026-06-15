-- Saved custom segments: named, reusable audience filters.
-- Run this in the Supabase SQL editor after 0004_automations.sql.
--
-- Built-in segments (by status / source / device / engagement) are computed on
-- the fly and not stored. Only admin-defined custom segments live here. `rules`
-- is a JSON array of { field, op, value }; `match_type` combines them.

create table if not exists public.segments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  match_type  text not null default 'all' check (match_type in ('all', 'any')),
  rules       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists segments_created_idx on public.segments (created_at desc);

alter table public.segments enable row level security;

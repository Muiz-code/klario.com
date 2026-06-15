-- Custom email templates: admin-created, reusable layouts.
-- Run this in the Supabase SQL editor after 0005_segments.sql.
--
-- The four starter templates (editorial, announcement, simple, welcome) are
-- code-defined and not stored here. Only admin-created templates live in this
-- table; they appear alongside the starters in the Templates library and in the
-- Compose template gallery.

create table if not exists public.email_templates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text not null default '',
  subject      text not null default '',
  html         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists email_templates_created_idx
  on public.email_templates (created_at desc);

alter table public.email_templates enable row level security;

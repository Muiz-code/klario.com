-- First-party website analytics: one row per pageview or click. Public writes
-- go through the server (service role); RLS on with no policies keeps it private.
create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('pageview', 'click')),
  path        text,
  label       text,
  href        text,
  referrer    text,
  session     text,
  created_at  timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_type_idx     on public.analytics_events (type, created_at desc);
alter table public.analytics_events enable row level security;

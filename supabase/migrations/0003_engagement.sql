-- Open + click tracking.
-- Run this in the Supabase SQL editor after 0002_audit_log.sql.
--
-- Opens and clicks happen after delivery, so they are stored as their own
-- timestamps rather than overwriting the delivery status. A recipient can be
-- delivered AND opened AND clicked at the same time.

alter table public.email_log
  add column if not exists opened_at  timestamptz,
  add column if not exists clicked_at timestamptz;

alter table public.audit_log
  add column if not exists opened_count  integer not null default 0,
  add column if not exists clicked_count integer not null default 0;

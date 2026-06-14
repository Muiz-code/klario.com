-- Audit log + delivery tracking.
-- Run this in the Supabase SQL editor after 0001_init.sql.

-- ---------------------------------------------------------------------------
-- audit_log: one row per admin email action (a send, a test, an import).
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id               uuid primary key default gen_random_uuid(),
  action           text not null,        -- beta_invite | newsletter | test_send | import
  actor            text,                 -- admin email that triggered it
  subject          text,                 -- email / campaign subject
  template         text,                 -- template or compose mode used
  segment          text,                 -- audience targeted (all/new/existing/choose)
  recipient_count  integer not null default 0,
  sent_count       integer not null default 0,
  failed_count     integer not null default 0,
  delivered_count  integer not null default 0,
  bounced_count    integer not null default 0,
  meta             jsonb,                -- extra detail (failures, import stats)
  created_at       timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_action_idx  on public.audit_log (action);

alter table public.audit_log enable row level security;

-- ---------------------------------------------------------------------------
-- email_log: link rows to an audit event and record delivery outcomes so the
-- audit page can roll up sent vs delivered vs bounced per send.
-- ---------------------------------------------------------------------------
alter table public.email_log
  add column if not exists audit_id     uuid references public.audit_log(id) on delete set null,
  add column if not exists delivered_at timestamptz;

create index if not exists email_log_audit_idx on public.email_log (audit_id);
create index if not exists email_log_resend_idx on public.email_log (resend_id);

-- Expand the status check to include delivery outcomes from the webhook.
alter table public.email_log drop constraint if exists email_log_status_check;
alter table public.email_log
  add constraint email_log_status_check
  check (status in ('sent', 'failed', 'delivered', 'bounced', 'complained'));

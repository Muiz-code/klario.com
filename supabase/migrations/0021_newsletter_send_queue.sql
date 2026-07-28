-- Background send queue: one row per (newsletter, recipient). A cron worker
-- drains 'pending' rows in chunks, so a send resumes after any interruption
-- (no more "stopped at 154") and scales to very large audiences. "Not sent yet"
-- for a newsletter is simply its rows still in 'pending'.

create table if not exists public.newsletter_send_queue (
  id             uuid primary key default gen_random_uuid(),
  newsletter_id  uuid not null references public.newsletters(id) on delete cascade,
  email          text not null,
  first_name     text,
  signup_id      uuid,
  status         text not null default 'pending'
                 check (status in ('pending', 'sent', 'failed')),
  error          text,
  created_at     timestamptz not null default now(),
  sent_at        timestamptz,
  unique (newsletter_id, email)
);

-- Fast "next pending chunk for this newsletter" lookups.
create index if not exists nsq_pending_idx
  on public.newsletter_send_queue (newsletter_id, status)
  where status = 'pending';
create index if not exists nsq_newsletter_idx
  on public.newsletter_send_queue (newsletter_id);

alter table public.newsletter_send_queue enable row level security;

-- The audit event a queued send logs its email_log rows against, so reports and
-- resend-failed keep working while the cron drains the queue.
alter table public.newsletters
  add column if not exists send_audit_id uuid;

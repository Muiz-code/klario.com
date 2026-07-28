-- Atomic claiming for the send queue: prevents duplicate sends when more than
-- one worker (the progress modal, the /resume worker, the cron) processes the
-- same newsletter at once. A row is "claimed" (claimed_at set) before it is
-- sent; only the worker whose UPDATE actually set claimed_at sends it. Stale
-- claims (a worker that died mid-send) are reset back to unclaimed after a few
-- minutes so the row still gets sent.

alter table public.newsletter_send_queue
  add column if not exists claimed_at timestamptz;

create index if not exists nsq_claimable_idx
  on public.newsletter_send_queue (newsletter_id, status, claimed_at)
  where status = 'pending';

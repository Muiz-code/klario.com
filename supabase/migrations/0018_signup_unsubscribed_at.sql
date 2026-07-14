-- Record when a subscriber unsubscribed, so the admin can show the date.
alter table public.beta_signups add column if not exists unsubscribed_at timestamptz;

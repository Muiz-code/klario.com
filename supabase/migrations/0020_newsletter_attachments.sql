-- Attachments for newsletters (e.g. a PDF). Stored as a jsonb array of
-- { filename, url } where url points at the public email-assets bucket. The
-- send path attaches these to each email (Resend `attachments` with `path`).

alter table public.newsletters
  add column if not exists attachments jsonb not null default '[]'::jsonb;

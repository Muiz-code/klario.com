-- Anchor Club: which phone the applicant uses.
--
-- Asked on the public /anchor-club form so we know the iOS/Android split of the
-- cohort before they're on the app (the app itself only learns this once they
-- install). Nullable: registrations taken before this question existed keep a
-- null, and the form tolerates an older client that doesn't send it.

alter table public.anchor_club
  add column if not exists device text
  check (device in ('ios', 'android'));

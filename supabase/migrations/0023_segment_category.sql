-- Categories for custom segments: an optional label used to group segments in
-- the admin. "Creating a category" is just typing a new name here — the UI
-- groups segments by their distinct category values.

alter table public.segments
  add column if not exists category text;

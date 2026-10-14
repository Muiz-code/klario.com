-- ─────────────────────────────────────────────────────────────────────────────
-- rate_limits: the public forms and endpoints (contact, newsletter, beta,
-- ambassador, anchor, unsubscribe, track, blog views) are open to anyone, so
-- each call is counted per IP (and per email where there is one) and refused
-- past a limit. Same shape as the app's own rate_limits.
--
-- Vercel runs many instances that share no memory, so the count lives here.
-- Service-role only: RLS on, no policies, nothing granted to anon.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.rate_limits (
  id      bigserial   primary key,
  bucket  text        not null,
  key     text        not null,
  hit_at  timestamptz not null default now()
);
create index if not exists rate_limits_bucket_key_hit_idx on public.rate_limits (bucket, key, hit_at desc);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Records the hit and says whether the caller is within the limit. Old rows
-- (over a day) are pruned as it goes.
create or replace function public.check_rate_limit(p_bucket text, p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  delete from public.rate_limits where hit_at < now() - interval '24 hours';
  select count(*) into v_count from public.rate_limits
   where bucket = p_bucket and key = p_key and hit_at > now() - (p_window_seconds || ' seconds')::interval;
  if v_count >= p_max then
    return false;
  end if;
  insert into public.rate_limits (bucket, key) values (p_bucket, p_key);
  return true;
end;
$$;
revoke all on function public.check_rate_limit(text, text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, int, int) to service_role;

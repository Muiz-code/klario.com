-- Role-based admin access. Env ADMIN_EMAILS remain break-glass superadmins;
-- these tables add invitable members with scoped roles, a temp-password invite
-- flow (forced change on first login), and an activity audit.
create table if not exists public.admin_roles (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  capabilities   text[] not null default '{}',
  is_superadmin  boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.admin_members (
  id                    uuid primary key default gen_random_uuid(),
  email                 text not null unique,
  role_id               uuid references public.admin_roles(id) on delete set null,
  status                text not null default 'active' check (status in ('active', 'disabled')),
  -- Forces the change-password screen after logging in with the temp password.
  must_change_password  boolean not null default true,
  invited_by            text,
  invited_at            timestamptz not null default now(),
  last_login_at         timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists admin_members_email_idx on public.admin_members (lower(email));

-- Every meaningful action a member takes, for the "who did what" audit.
create table if not exists public.admin_activity (
  id           uuid primary key default gen_random_uuid(),
  actor_email  text not null,
  action       text not null,
  target       text,
  meta         jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists admin_activity_created_idx on public.admin_activity (created_at desc);
create index if not exists admin_activity_actor_idx   on public.admin_activity (lower(actor_email), created_at desc);

-- A starter full-access role (superadmin ignores the capabilities list).
insert into public.admin_roles (name, capabilities, is_superadmin)
  values ('Superadmin', '{}', true)
  on conflict (name) do nothing;

-- Locked down: service role only (consistent with every other table).
alter table public.admin_roles    enable row level security;
alter table public.admin_members  enable row level security;
alter table public.admin_activity enable row level security;

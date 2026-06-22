-- Admin-authored blog posts. Public reads go through the server (service role);
-- RLS on with no policies keeps the table private to the service role.
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text not null default '',
  category     text not null default 'Money Tips',
  image        text,
  body         text not null default '',
  author_name  text not null default 'Klario Team',
  author_role  text not null default 'Product',
  read_time    text,
  published    boolean not null default false,
  views        integer not null default 0,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);
alter table public.blog_posts enable row level security;

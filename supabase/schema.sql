-- Lost & Found: the two tables the app uses, plus row-level security.
-- Run this in the Supabase SQL Editor (or paste it into a migration). It is safe to re-run.
-- If the tables already exist, the "create table" statements do nothing.
-- It covers everything the app needs in the database: tables (profiles, tasks, radar_links), API permissions and row-level security.
-- (Auth settings such as email confirmation and redirect URLs are not SQL; see the README.)

create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  selected_sky text not null default 'default',
  created_at   timestamptz not null default now()
);

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null,
  description  text,
  due_date     date,
  category     text check (category in ('Build', 'Learn', 'Career', 'Creative', 'Health')),
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

-- Student Radar: links each user wants to keep close. Only http(s) links are accepted.
create table if not exists public.radar_links (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 120),
  url        text not null check (url ~* '^https?://' and char_length(url) <= 2048),
  note       text check (char_length(note) <= 280),
  created_at timestamptz not null default now()
);

-- The Mission Board form has a description field. Add the column if your table predates it.
alter table public.tasks add column if not exists description text;

-- One profile per user. (If this fails, you have duplicate profile rows for a user; delete the extras first.)
create unique index if not exists profiles_user_id_key on public.profiles (user_id);

-- ===== Row-level security: every user can only touch their own rows =====
alter table public.profiles enable row level security;
alter table public.tasks    enable row level security;
alter table public.radar_links enable row level security;

drop policy if exists "profiles: own rows" on public.profiles;
create policy "profiles: own rows" on public.profiles
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks: own rows" on public.tasks;
create policy "tasks: own rows" on public.tasks
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "radar_links: own rows" on public.radar_links;
create policy "radar_links: own rows" on public.radar_links
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ===== API permissions =====
-- Supabase projects created from May 30, 2026 no longer expose new public tables to the API
-- automatically, so without these grants the app fails with "permission denied for table ...".
-- Only logged-in users get access (anon gets none), and the RLS policies above still limit
-- each user to their own rows. Harmless on older projects that already have these grants.
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.tasks    to authenticated;
grant select, insert, update, delete on public.radar_links to authenticated;
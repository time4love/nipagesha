-- Profiles table: 1:1 with auth.users. Created automatically on signup via trigger.
-- Used for display name, avatar, and privacy on the Help Board and elsewhere.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  is_anonymous boolean not null default true,
  privacy_level text not null default 'registered_only' check (privacy_level in ('public', 'registered_only')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Public/registered read: allow reading profiles when privacy_level allows (enforced in app).
create policy "Anyone can read public profiles"
  on public.profiles for select
  using (privacy_level = 'public');

create index if not exists idx_profiles_privacy_level on public.profiles(privacy_level);

-- Trigger: create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, is_anonymous, privacy_level)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''), true, 'registered_only');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional: backfill existing users who don't have a profile yet
insert into public.profiles (id, display_name, is_anonymous, privacy_level)
select id, coalesce(raw_user_meta_data->>'display_name', ''), true, 'registered_only'
from auth.users
on conflict (id) do nothing;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

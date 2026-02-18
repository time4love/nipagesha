-- Songs table: music videos for estranged parents (שירי הורים).
-- Content managed via Supabase Dashboard. Public read, admin write.

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lyrics text,
  youtube_url text not null,
  artist_name text,
  created_at timestamptz not null default now(),
  is_published boolean not null default true
);

-- RLS: public read (anon can select published), insert/update only for admins (via Dashboard/service role).
alter table public.songs enable row level security;

create policy "Anyone can read published songs"
  on public.songs
  for select
  to anon, authenticated
  using (is_published = true);

-- Insert/update/delete: no policy for anon/auth → only service role (Dashboard) can modify.
-- Optional: add a policy later for authenticated users with admin role.

create index if not exists idx_songs_created_at on public.songs(created_at desc);

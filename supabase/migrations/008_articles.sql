-- Articles table: blog-style content with optional video (YouTube) or image media.
-- Public read for published rows; admin write via application (admin email check).

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  media_type text not null check (media_type in ('video', 'image')),
  media_url text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.articles enable row level security;

create policy "Anyone can read published articles"
  on public.articles
  for select
  to anon, authenticated
  using (is_published = true);

create policy "Authenticated users can manage articles"
  on public.articles
  for all
  to authenticated
  using (true)
  with check (true);

create index if not exists idx_articles_created_at on public.articles(created_at desc);

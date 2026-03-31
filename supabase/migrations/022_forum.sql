-- Community forum: posts and comments.
-- Read: anon + authenticated. Write: authenticated, own rows only.

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null
    check (category in ('תמיכה רגשית', 'ייעוץ משפטי', 'סיפורי הצלחה', 'כללי')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forum_posts enable row level security;

create policy "Anyone can read forum_posts"
  on public.forum_posts for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert own forum_posts"
  on public.forum_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own forum_posts"
  on public.forum_posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own forum_posts"
  on public.forum_posts for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_forum_posts_user_id on public.forum_posts(user_id);
create index if not exists idx_forum_posts_category on public.forum_posts(category);
create index if not exists idx_forum_posts_created_at on public.forum_posts(created_at desc);

drop trigger if exists forum_posts_updated_at on public.forum_posts;
create trigger forum_posts_updated_at
  before update on public.forum_posts
  for each row execute function public.set_updated_at();

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.forum_comments enable row level security;

create policy "Anyone can read forum_comments"
  on public.forum_comments for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert own forum_comments"
  on public.forum_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own forum_comments"
  on public.forum_comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own forum_comments"
  on public.forum_comments for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_forum_comments_post_id on public.forum_comments(post_id);
create index if not exists idx_forum_comments_user_id on public.forum_comments(user_id);
create index if not exists idx_forum_comments_created_at on public.forum_comments(created_at);

-- Forum post likes (upvotes): one per user per post.

create table if not exists public.forum_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_forum_post_likes_post_id on public.forum_post_likes(post_id);
create index if not exists idx_forum_post_likes_user_id on public.forum_post_likes(user_id);

alter table public.forum_post_likes enable row level security;

create policy "Anyone can read forum_post_likes"
  on public.forum_post_likes for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert own forum_post_likes"
  on public.forum_post_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own forum_post_likes"
  on public.forum_post_likes for delete
  to authenticated
  using (auth.uid() = user_id);

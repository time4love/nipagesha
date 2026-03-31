-- Forum feed preview: first image URL extracted from post HTML at insert time.
alter table public.forum_posts
  add column if not exists thumbnail_url text;

comment on column public.forum_posts.thumbnail_url is 'First <img> src from content; used in feed cards.';

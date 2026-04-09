-- Optional link to a Facebook post for embedded preview in forum posts.

alter table public.forum_posts
  add column if not exists facebook_link text null;

comment on column public.forum_posts.facebook_link is 'Optional URL of a Facebook post; rendered via official embed on post page.';

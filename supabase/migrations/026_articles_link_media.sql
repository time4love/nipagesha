-- Allow external-link articles (VOD / blocked embeds) and optional thumbnail URL.

alter table public.articles
  drop constraint if exists articles_media_type_check;

alter table public.articles
  add constraint articles_media_type_check
  check (media_type in ('video', 'image', 'link'));

alter table public.articles
  add column if not exists link_thumbnail text;

comment on column public.articles.link_thumbnail is
  'Optional image URL for link-type articles (card preview).';

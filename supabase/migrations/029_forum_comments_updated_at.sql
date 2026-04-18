-- Track edits on forum comments for "(נערך)" and updated_at trigger.

alter table public.forum_comments
  add column if not exists updated_at timestamptz;

update public.forum_comments
set updated_at = created_at
where updated_at is null;

alter table public.forum_comments
  alter column updated_at set not null,
  alter column updated_at set default now();

drop trigger if exists forum_comments_updated_at on public.forum_comments;

create trigger forum_comments_updated_at
  before update on public.forum_comments
  for each row execute function public.set_updated_at();

comment on column public.forum_comments.updated_at is 'Set on insert; refreshed on update via trigger.';

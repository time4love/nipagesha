-- Threaded forum replies: at most one level (reply to post or to a top-level comment).

alter table public.forum_comments
  add column if not exists parent_id uuid references public.forum_comments(id) on delete cascade;

create index if not exists idx_forum_comments_parent_id on public.forum_comments(parent_id)
  where parent_id is not null;

comment on column public.forum_comments.parent_id is
  'Null = comment on the post; non-null = reply to that top-level comment (no deeper nesting).';

create or replace function public.forum_comments_enforce_parent_rules()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is null then
    return new;
  end if;
  if tg_op = 'update' then
    if new.parent_id is not distinct from old.parent_id then
      return new;
    end if;
  end if;
  if not exists (
    select 1
    from public.forum_comments p
    where p.id = new.parent_id
      and p.post_id = new.post_id
      and p.parent_id is null
  ) then
    raise exception 'forum_comments: parent must be a top-level comment in the same post';
  end if;
  return new;
end;
$$;

drop trigger if exists forum_comments_parent_rules on public.forum_comments;

create trigger forum_comments_parent_rules
  before insert or update of parent_id on public.forum_comments
  for each row execute function public.forum_comments_enforce_parent_rules();

-- User role: parent (default) or volunteer. Drives nav label and dashboard content.
alter table public.profiles
  add column if not exists role text not null default 'parent'
  check (role in ('parent', 'volunteer'));

comment on column public.profiles.role is 'parent = הורה (see my requests, create card); volunteer = מתנדב (see my offers).';

-- Parent role: אבא/אמא. Used when the child sees the message so they know who wrote it (critical in parental alienation).
alter table public.profiles
  add column if not exists parent_role text check (parent_role is null or parent_role in ('dad', 'mom'));

comment on column public.profiles.parent_role is 'dad = אבא, mom = אמא. Shown to child on message/reply UI.';

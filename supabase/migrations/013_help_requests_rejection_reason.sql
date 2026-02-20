-- When a moderator rejects a help request, they must provide a short explanation for the parent.
alter table public.help_requests
  add column if not exists rejection_reason text;

comment on column public.help_requests.rejection_reason is 'Explanation shown to the parent when status is rejected. Set by moderator.';

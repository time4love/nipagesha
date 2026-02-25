-- Registered Help Offers: help_requests can be either a request or an offer.
-- Offers use the same table; contact goes to the user's account email (no extra columns).

alter table public.help_requests
  add column if not exists post_type text not null default 'request'
  check (post_type in ('request', 'offer'));

comment on column public.help_requests.post_type is 'request = parent asking for help; offer = volunteer offering help.';

create index if not exists idx_help_requests_post_type on public.help_requests(post_type);

-- Profiles: add bio for volunteers; remove parent_role (sender name is per-card/security, not global).
alter table public.profiles
  add column if not exists bio text;

comment on column public.profiles.bio is 'Short bio for volunteers (e.g. professional background). Shown on help offer cards.';

alter table public.profiles
  drop column if exists parent_role;

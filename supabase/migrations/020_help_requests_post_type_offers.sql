  -- Proactive Offers: post_type (request | offer), contact fields for offerers, anon insert for offers.

  -- Add post_type: default 'request' for existing rows
  alter table public.help_requests
    add column if not exists post_type text not null default 'request';

  update public.help_requests set post_type = 'request' where post_type is null or post_type = '';

  alter table public.help_requests
    drop constraint if exists help_requests_post_type_check;

  alter table public.help_requests
    add constraint help_requests_post_type_check
    check (post_type in ('request', 'offer'));

  -- Contact details for offer creators (private; used when parent expresses interest)
  alter table public.help_requests
    add column if not exists contact_email text,
    add column if not exists contact_phone text;

  comment on column public.help_requests.contact_email is 'Offer creator email; only used to forward parent interest, not shown publicly.';
  comment on column public.help_requests.contact_phone is 'Offer creator phone; only used to forward parent interest, not shown publicly.';

  -- Allow user_id to be null for anonymous offerers (offers only)
  alter table public.help_requests
    alter column user_id drop not null;

  -- Requests must have user_id; offers may have null user_id
  alter table public.help_requests
    drop constraint if exists help_requests_user_id_request_check;

  alter table public.help_requests
    add constraint help_requests_user_id_when_request
    check (
      (post_type = 'request' and user_id is not null) or
      (post_type = 'offer')
    );

  -- RLS: allow anonymous insert for offers (no user_id)
  create policy "Anonymous can insert help_requests when offer"
    on public.help_requests for insert
    to anon
    with check (post_type = 'offer' and user_id is null);

  -- Existing "Authenticated users can insert own help_requests" remains (auth.uid() = user_id)
  -- Select: public still sees only approved; owner sees own. No change to select policies.

  create index if not exists idx_help_requests_post_type on public.help_requests(post_type);

-- Allow parent to see when they have new help offers (like child reply "הודעה חדשה!").
alter table public.help_offers
  add column if not exists seen_by_owner boolean not null default false;

comment on column public.help_offers.seen_by_owner is 'Set to true when the request owner views the offers list.';

-- Request owner can update seen_by_owner on their request's offers (to mark as seen).
create policy "Request owner can update help_offers for own request"
  on public.help_offers for update
  to authenticated
  using (
    exists (
      select 1 from public.help_requests hr
      where hr.id = help_offers.request_id and hr.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.help_requests hr
      where hr.id = help_offers.request_id and hr.user_id = auth.uid()
    )
  );

create index if not exists idx_help_offers_seen_by_owner on public.help_offers(request_id, seen_by_owner);

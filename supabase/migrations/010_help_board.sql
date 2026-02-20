-- Help Board: community requests and offers.
-- help_requests: public read; insert/update own only.
-- help_offers: insert by anyone; read only by request owner.

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  location text not null default '',
  status text not null default 'open' check (status in ('open', 'fulfilled', 'closed')),
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.help_requests enable row level security;

create policy "Public can read help_requests"
  on public.help_requests for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert own help_requests"
  on public.help_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own help_requests"
  on public.help_requests for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own help_requests"
  on public.help_requests for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_help_requests_user_id on public.help_requests(user_id);
create index if not exists idx_help_requests_status on public.help_requests(status);
create index if not exists idx_help_requests_category on public.help_requests(category);
create index if not exists idx_help_requests_created_at on public.help_requests(created_at desc);

-- updated_at trigger for help_requests
drop trigger if exists help_requests_updated_at on public.help_requests;
create trigger help_requests_updated_at
  before update on public.help_requests
  for each row execute function public.set_updated_at();

-- help_offers: one per offer; helper can be anonymous (helper_id null) or registered (helper_id set)
create table if not exists public.help_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.help_requests(id) on delete cascade,
  helper_id uuid references auth.users(id) on delete set null,
  helper_name text not null,
  helper_contact text not null,
  message text not null default '',
  created_at timestamptz not null default now()
);

alter table public.help_offers enable row level security;

-- Anyone (anon or authenticated) can insert an offer
create policy "Anyone can insert help_offers"
  on public.help_offers for insert
  to anon, authenticated
  with check (true);

-- Only the owner of the related request can read offers for that request
create policy "Request owner can read help_offers for own request"
  on public.help_offers for select
  to authenticated
  using (
    exists (
      select 1 from public.help_requests hr
      where hr.id = help_offers.request_id and hr.user_id = auth.uid()
    )
  );

create index if not exists idx_help_offers_request_id on public.help_offers(request_id);

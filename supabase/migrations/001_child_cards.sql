-- Child cards table: parents create cards with encrypted messages for their children.
-- RLS: users can only see/insert/update/delete their own rows.

create table if not exists public.child_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_first_name text not null,
  child_last_name text not null,
  birth_year smallint not null,
  security_question text not null,
  encrypted_message text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.child_cards enable row level security;

create policy "Users can manage own child_cards"
  on public.child_cards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for listing by user
create index if not exists idx_child_cards_user_id on public.child_cards(user_id);

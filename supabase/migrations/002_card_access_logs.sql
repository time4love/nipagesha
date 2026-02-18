-- Access log for child cards: success/failure attempts, anonymized IP only.
-- Parents can see if their card was read and count of recent failed attempts.

-- Add is_read to child_cards (set when message is successfully decrypted)
alter table public.child_cards
  add column if not exists is_read boolean not null default false;

-- card_access_logs: never store raw IP, only HMAC hash
create table if not exists public.card_access_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.child_cards(id) on delete cascade,
  attempt_type text not null check (attempt_type in ('success', 'failure')),
  anonymized_ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_card_access_logs_card_id on public.card_access_logs(card_id);
create index if not exists idx_card_access_logs_created_at on public.card_access_logs(created_at);

alter table public.card_access_logs enable row level security;

-- INSERT: allow anyone (anon + authenticated) to log attempts (child is not logged in)
create policy "Allow insert for access logging"
  on public.card_access_logs
  for insert
  with check (true);

-- SELECT: only the card owner (parent) can read logs for their cards
create policy "Card owner can read own card logs"
  on public.card_access_logs
  for select
  using (
    card_id in (
      select id from public.child_cards where user_id = auth.uid()
    )
  );

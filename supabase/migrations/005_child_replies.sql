-- Child replies: anonymous child can send a message back to the parent after decrypting the card.
-- parent_id is duplicated from child_cards.user_id for simple RLS (auth.uid() = parent_id).

create table if not exists public.child_replies (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.child_cards(id) on delete cascade,
  parent_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  contact_info text,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

create index if not exists idx_child_replies_card_id on public.child_replies(card_id);
create index if not exists idx_child_replies_parent_id on public.child_replies(parent_id);
create index if not exists idx_child_replies_created_at on public.child_replies(created_at);

alter table public.child_replies enable row level security;

-- INSERT: allow anon and authenticated (child may be anonymous when replying)
create policy "Allow insert child replies"
  on public.child_replies
  for insert
  with check (true);

-- SELECT: only the parent can read replies to their cards
create policy "Parent can read own child replies"
  on public.child_replies
  for select
  using (auth.uid() = parent_id);

-- UPDATE: only parent can update (e.g. mark as read)
create policy "Parent can update own child replies"
  on public.child_replies
  for update
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

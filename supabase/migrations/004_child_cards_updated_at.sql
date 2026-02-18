-- Add updated_at to child_cards for edit tracking
alter table public.child_cards
  add column if not exists updated_at timestamptz default now();

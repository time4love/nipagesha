-- Add sender_name to child_cards: how the child knows the sender (e.g. "Dad", "Mom", "Grandma").
-- Used in search to disambiguate when multiple cards match the same child name + birth year.

alter table public.child_cards
  add column if not exists sender_name text not null default 'הורה';

comment on column public.child_cards.sender_name is 'How the child knows the sender (e.g. אבא, אמא, סבא יוסי). Shown in search when multiple cards match.';

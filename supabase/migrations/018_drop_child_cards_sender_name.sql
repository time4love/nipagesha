-- Remove sender_name from child_cards. Security question is the identifier for multiple results.

alter table public.child_cards
  drop column if exists sender_name;

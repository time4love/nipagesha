-- Child card identification refactor: First Name + Exact Date of Birth only.
-- Destructive: wipes existing child_cards and removes last name + birth year.

-- CASCADE truncates child_cards and all tables that reference it (card_access_logs, child_replies).
truncate table public.child_cards cascade;

alter table public.child_cards
  drop column if exists child_last_name,
  drop column if exists birth_year;

alter table public.child_cards
  add column birth_date date not null;

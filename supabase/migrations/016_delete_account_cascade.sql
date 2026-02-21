-- GDPR / Right to be forgotten: ensure all user-related data is removed when auth.users row is deleted.
-- profiles, child_cards, help_requests already have ON DELETE CASCADE (from initial migrations).
-- child_replies and card_access_logs already cascade from child_cards.
-- Here we fix the two tables that currently use ON DELETE SET NULL.

-- help_offers.helper_id: when the helper (user) is deleted, remove their offers (full erasure).
alter table public.help_offers
  drop constraint if exists help_offers_helper_id_fkey;

alter table public.help_offers
  add constraint help_offers_helper_id_fkey
  foreign key (helper_id) references auth.users(id) on delete cascade;

-- contact_submissions.user_id: when the user is deleted, remove their submissions (full erasure).
alter table public.contact_submissions
  drop constraint if exists contact_submissions_user_id_fkey;

alter table public.contact_submissions
  add constraint contact_submissions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

comment on table public.help_offers is 'Help offers; helper_id CASCADE so account deletion removes their offers.';
comment on table public.contact_submissions is 'Contact/report submissions; user_id CASCADE for GDPR account deletion.';

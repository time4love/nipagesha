-- Allow contact form category "song_request" (בקשה לשיר).

alter table public.contact_submissions
  drop constraint contact_submissions_category_check;

alter table public.contact_submissions
  add constraint contact_submissions_category_check
  check (category in (
    'general',
    'support',
    'bug',
    'report_abuse',
    'report_content',
    'song_request'
  ));

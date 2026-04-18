-- Forum email notification preferences (opt-out in profile). Default true for existing users.

alter table public.profiles
  add column if not exists forum_email_notify_post_reply boolean not null default true,
  add column if not exists forum_email_notify_comment_reply boolean not null default true;

comment on column public.profiles.forum_email_notify_post_reply is
  'When true, send email when someone posts a top-level comment on the user''s forum post.';
comment on column public.profiles.forum_email_notify_comment_reply is
  'When true, send email when someone replies to the user''s forum comment.';

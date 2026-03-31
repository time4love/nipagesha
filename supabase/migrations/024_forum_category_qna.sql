-- Replace forum category "ייעוץ משפטי" with "שאלות ותשובות".

alter table public.forum_posts drop constraint if exists forum_posts_category_check;

update public.forum_posts
set category = 'שאלות ותשובות', updated_at = now()
where category = 'ייעוץ משפטי';

alter table public.forum_posts
  add constraint forum_posts_category_check
  check (category in ('תמיכה רגשית', 'שאלות ותשובות', 'סיפורי הצלחה', 'כללי'));

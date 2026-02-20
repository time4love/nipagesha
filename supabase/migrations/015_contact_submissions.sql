-- Contact & reporting: submissions from contact form and report dialogs.
-- Public can insert; only service role (admin app) can select/update.

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  category text not null check (category in (
    'general', 'support', 'bug', 'report_abuse', 'report_content'
  )),
  subject text not null,
  message text not null,
  reference_id text,
  reference_type text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

create index contact_submissions_status_created_at_idx
  on public.contact_submissions (status, created_at desc);
create index contact_submissions_category_idx on public.contact_submissions (category);

alter table public.contact_submissions enable row level security;

-- Anyone (anon or authenticated) can insert a submission.
create policy "Anyone can insert contact_submissions"
  on public.contact_submissions for insert
  to anon, authenticated
  with check (true);

-- No SELECT/UPDATE for anon or authenticated → only service role (admin) can read/update.
-- So we do not create any SELECT or UPDATE policies for anon/authenticated.

comment on table public.contact_submissions is 'Contact form and report submissions; admin manages via service role.';

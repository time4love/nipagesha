-- Help Board moderation: status pending/approved/rejected/closed.
-- Public sees only approved; owner sees own regardless; admin uses service role in app.

-- Migrate existing status values to new semantics
update public.help_requests
set status = case
  when status = 'open' then 'approved'
  when status = 'fulfilled' then 'closed'
  else 'closed'
end
where status in ('open', 'fulfilled', 'closed');

-- Replace status constraint and default
alter table public.help_requests
  drop constraint if exists help_requests_status_check;

alter table public.help_requests
  add constraint help_requests_status_check
  check (status in ('pending', 'approved', 'rejected', 'closed'));

alter table public.help_requests
  alter column status set default 'pending';

-- RLS: replace public read with "approved only" and add "owner sees own"
drop policy if exists "Public can read help_requests" on public.help_requests;

create policy "Public can read approved help_requests"
  on public.help_requests for select
  to anon, authenticated
  using (status = 'approved');

create policy "Owner can read own help_requests"
  on public.help_requests for select
  to authenticated
  using (auth.uid() = user_id);

-- Insert: still only own (unchanged)
-- Update: only own (unchanged) — admin will use service role for approve/reject
-- Delete: only own (unchanged)

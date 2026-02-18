-- Allow authenticated users to manage songs (application enforces admin email in server actions).
-- Public (anon) can still only SELECT published rows via existing policy.

create policy "Authenticated users can manage songs"
  on public.songs
  for all
  to authenticated
  using (true)
  with check (true);

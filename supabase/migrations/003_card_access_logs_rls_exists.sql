-- Optional: use EXISTS for SELECT policy if parent cannot see logs (RLS with IN subquery can fail in some setups)
drop policy if exists "Card owner can read own card logs" on public.card_access_logs;

create policy "Card owner can read own card logs"
  on public.card_access_logs
  for select
  using (
    exists (
      select 1 from public.child_cards c
      where c.id = card_access_logs.card_id and c.user_id = auth.uid()
    )
  );

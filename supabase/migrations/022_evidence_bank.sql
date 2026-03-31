-- Evidence Bank: sources (documents/media) and evidence_items (quotes & analysis).
-- Public read-only for site visitors; populate via SQL editor or service role.

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  publication_date date,
  official_url text
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources (id) on delete cascade,
  evidence_number integer not null,
  evidence_title text not null,
  category text not null,
  speaker text,
  exact_location text,
  thesis text,
  smoking_gun text,
  verbatim_quote text,
  forensic_analysis text,
  media_asset_url text,
  unique (source_id, evidence_number)
);

create index if not exists idx_evidence_items_source_id on public.evidence_items (source_id);
create index if not exists idx_evidence_items_category on public.evidence_items (category);
create index if not exists idx_evidence_items_number on public.evidence_items (evidence_number);

alter table public.sources enable row level security;
alter table public.evidence_items enable row level security;

create policy "Anyone can read sources"
  on public.sources
  for select
  to anon, authenticated
  using (true);

create policy "Anyone can read evidence_items"
  on public.evidence_items
  for select
  to anon, authenticated
  using (true);

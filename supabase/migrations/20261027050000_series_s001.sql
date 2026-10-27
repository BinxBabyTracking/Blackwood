-- Connected case series. Series S001, The Judas Principle: six cases played in
-- order, sharing a rolling cork board that carries the evidence the player
-- chooses to keep from case to case.
--
-- 1. Series case ids (S001C01 ...) alongside the standalone ones (C001 ...).
-- 2. A case can belong to a series, at a position in it.
-- 3. series_progress: the rolling board and the series deductions, one row per
--    investigator per series. Kept apart from any one case's save, which a
--    replay wipes and a closed case freezes.
-- 4. S01 C01 The Ledger: Coming Soon, early access for the test accounts.
-- Nothing here names anyone responsible.

alter table public.cases drop constraint if exists cases_id_check;
alter table public.cases add constraint cases_id_check check (id ~ '^(C[0-9]{3}|S[0-9]{3}C[0-9]{2})$');

alter table public.cases add column if not exists series_id text;
alter table public.cases add column if not exists series_order smallint;

create table if not exists public.series_progress (
  user_id     uuid not null references auth.users (id) on delete cascade,
  series_id   text not null,
  board       jsonb not null default '{"items": [], "connections": []}'::jsonb,
  deductions  text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, series_id)
);

alter table public.series_progress enable row level security;

drop policy if exists "Investigators read their own series progress" on public.series_progress;
create policy "Investigators read their own series progress" on public.series_progress
  for select to authenticated using (user_id = (select auth.uid()));
-- Writes go through the server (service role) only, like save_games.

insert into public.cases (
  id, case_number, title, classification, location, year, synopsis, summary,
  difficulty, tier_id, est_minutes, min_investigators, max_investigators,
  status, is_preview, catalog_order, cover_image_url, series_id, series_order
) values (
  'S001C01', 'S01-C01', 'The Ledger', 'Homicide', 'Carroway, Pennsylvania', 2018,
  'A charity accountant is found dead in his office. The police call it a burglary gone wrong. His daughter says he was afraid of something in the numbers.',
  'In November 2018 Martin Keller, controller of the Carroway Community Foundation in western Pennsylvania, is found dead in his office the morning he was due to meet an outside auditor. The office has been searched, a drawer forced, and the police are calling it a burglary. His daughter Hannah does not believe it, and hires Blackwood. The first case of The Judas Principle: a complete murder of its own, and the start of something larger.',
  3, 'tier2', 150, 1, 6,
  'coming_soon', false, 101, '/art/live/s001_c01_cover', 'S001', 1
)
on conflict (id) do update set
  case_number = excluded.case_number,
  title = excluded.title,
  classification = excluded.classification,
  location = excluded.location,
  year = excluded.year,
  synopsis = excluded.synopsis,
  summary = excluded.summary,
  difficulty = excluded.difficulty,
  tier_id = excluded.tier_id,
  est_minutes = excluded.est_minutes,
  min_investigators = excluded.min_investigators,
  max_investigators = excluded.max_investigators,
  status = excluded.status,
  is_preview = excluded.is_preview,
  catalog_order = excluded.catalog_order,
  cover_image_url = excluded.cover_image_url,
  series_id = excluded.series_id,
  series_order = excluded.series_order;

-- Early access for the agency's own test accounts.
insert into public.case_entitlements (user_id, case_id, source)
select u.id, 'S001C01', 'grant'
from auth.users u
where lower(u.email) in ('imbush89@gmail.com', 'bundleofbushes@gmail.com')
on conflict (user_id, case_id) do update set source = 'grant';

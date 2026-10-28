-- HALLOW001 The Thirteenth Guest: Blackwood's first Halloween case and first
-- strictly multiplayer case (4 to 10 investigators). $4.99 (Tier 2, 2 to 3 hours),
-- shown as Coming Soon. Only accounts with an early-access grant can open it.
-- Nothing here names the murderer, the veiled woman, or how the study was locked.

-- Holiday case ids: HALLOW001 and on.
alter table public.cases drop constraint if exists cases_id_check;
alter table public.cases add constraint cases_id_check
  check (id ~ '^(C[0-9]{3}|S[0-9]{3}C[0-9]{2}|HALLOW[0-9]{3})$');

-- Multiplayer cases can list up to 10 investigators. Sessions stay capped at 6
-- until the multiplayer build raises that limit too.
alter table public.cases drop constraint if exists cases_max_investigators_check;
alter table public.cases add constraint cases_max_investigators_check
  check (max_investigators between 1 and 10);

insert into public.cases (
  id, case_number, title, classification, location, year, synopsis, summary,
  difficulty, tier_id, est_minutes, min_investigators, max_investigators,
  status, is_preview, catalog_order, cover_image_url
) values (
  'HALLOW001', 'HALLOW001', 'The Thirteenth Guest', 'Locked-room homicide', 'Blackthorn Estate, Massachusetts', 2018,
  'Halloween night, 10:13 PM. The lights go out at a private masquerade dinner, and the host is found dead in a study locked from the inside. The table was set for thirteen. Only twelve guests were invited.',
  'Antiquarian Edmund Blackthorn gathered twelve people connected to a Halloween party held at his estate twenty years earlier, the night a seventeen-year-old girl vanished and was written off as a runaway. He promised a revelation over dinner. Before he could make it, the power failed and he died behind a locked door. Several guests remember a woman in a black mourning veil. Others swear she was never there. Blackwood arrives at 10:32 PM, and whoever killed Edmund is still in the house, watching what you find. Blackwood''s first multiplayer case: 4 to 10 investigators, one shared estate, one killer who adapts to you.',
  3, 'tier2', 150, 4, 10,
  'coming_soon', false, 7, '/art/live/hallow001_cover'
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
  cover_image_url = excluded.cover_image_url;

-- Early access for the agency's own test accounts.
insert into public.case_entitlements (user_id, case_id, source)
select u.id, 'HALLOW001', 'grant'
from auth.users u
where lower(u.email) in ('imbush89@gmail.com', 'bundleofbushes@gmail.com')
on conflict (user_id, case_id) do update set source = 'grant';

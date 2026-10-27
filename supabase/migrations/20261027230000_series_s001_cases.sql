-- S001, The Judas Principle: catalog rows for S01 C02 to S01 C06, Coming Soon,
-- with early access for the agency's own test accounts (as S01 C01 has in
-- 20261027050000_series_s001.sql, which must run first).
-- Player-facing and spoiler-safe: nothing here hints at a later case.

insert into public.cases (
  id, case_number, title, classification, location, year, synopsis, summary,
  difficulty, tier_id, est_minutes, min_investigators, max_investigators,
  status, is_preview, catalog_order, cover_image_url, series_id, series_order
) values
(
  'S001C02', 'S01-C02', 'Room 614', 'Missing person', 'Washington, D.C.', 2018,
  'A government contractor vanishes from a Washington hotel the night before he is due to testify. His sister says he would never have walked away.',
  'On Sunday night, November 18, 2018, Jonathan Ellery, a defense contractor due to sit down with federal investigators the next morning, disappears from Room 614 of the Ashcroft Hotel in Washington. His shoes and his wallet are still in the room. The police think he left on his own. His sister does not, and brings the case to Blackwood. The second case of The Judas Principle.',
  3, 'tier2', 180, 1, 6, 'coming_soon', false, 102, '/art/live/s001_c02_cover', 'S001', 2
),
(
  'S001C03', 'S01-C03', 'Dead Freight', 'Homicide', 'Baltimore, Maryland', 2018,
  'A Baltimore dockworker is killed after flagging cargo that does not match its paperwork. The police are calling it a robbery.',
  'In December 2018 Hector Navarro, a cargo checker at East Harbor Terminal, is found dead behind a stack of flat racks in a restricted staging area. His wallet is empty and his phone is gone. His wife says he was scared of something at work and wrote it all down. The third case of The Judas Principle.',
  3, 'tier2', 180, 1, 6, 'coming_soon', false, 103, '/art/live/s001_c03_cover', 'S001', 3
),
(
  'S001C04', 'S01-C04', 'The Informant', 'Missing person', 'Alexandria, Virginia', 2018,
  'A former insider offers to explain everything. She never arrives.',
  'In December 2018 a former records analyst writes to Blackwood that she can explain what the agency has been looking at, and asks to meet at a cafe in Alexandria. She never comes. Her apartment is neat, her phone is off, and the people who knew her each tell a different story. The fourth case of The Judas Principle.',
  4, 'tier2', 200, 1, 6, 'coming_soon', false, 104, '/art/live/s001_c04_cover', 'S001', 4
),
(
  'S001C05', 'S01-C05', 'The Benefactor', 'Homicide', 'New York, New York', 2018,
  'A financial adviser is found dead during an exclusive New York charity gala.',
  'On the night of December 20, 2018, during the Lockhart Foundation''s Winter Gala at the Belgrave Grand Hotel, financial adviser Nathaniel Ogden is found dead in a private conference suite and his briefcase is gone. The hostess asks Blackwood to find out what happened, in front of everyone. The fifth case of The Judas Principle.',
  4, 'tier2', 210, 1, 6, 'coming_soon', false, 105, '/art/live/s001_c05_cover', 'S001', 5
),
(
  'S001C06', 'S01-C06', 'The Architect', 'Conspiracy', 'Washington, D.C., and the East Coast', 2018,
  'Witnesses are disappearing and the last records are burning. Prove who built it.',
  'In the last days of December 2018 a records facility burns, a witness disappears, and the final evidence of five investigations is running out of time. The finale of The Judas Principle: everything you have kept on the rolling board comes back to the table.',
  5, 'tier2', 330, 1, 6, 'coming_soon', false, 106, '/art/live/s001_c06_cover', 'S001', 6
)
on conflict (id) do update set
  case_number = excluded.case_number, title = excluded.title, classification = excluded.classification,
  location = excluded.location, year = excluded.year, synopsis = excluded.synopsis, summary = excluded.summary,
  difficulty = excluded.difficulty, tier_id = excluded.tier_id, est_minutes = excluded.est_minutes,
  min_investigators = excluded.min_investigators, max_investigators = excluded.max_investigators,
  status = excluded.status, is_preview = excluded.is_preview, catalog_order = excluded.catalog_order,
  cover_image_url = excluded.cover_image_url, series_id = excluded.series_id, series_order = excluded.series_order;

-- Early access for the agency's own test accounts.
insert into public.case_entitlements (user_id, case_id, source)
select u.id, c.id, 'grant'
from auth.users u
cross join (values ('S001C02'), ('S001C03'), ('S001C04'), ('S001C05'), ('S001C06')) as c(id)
where lower(u.email) in ('imbush89@gmail.com', 'bundleofbushes@gmail.com')
on conflict (user_id, case_id) do update set source = 'grant';

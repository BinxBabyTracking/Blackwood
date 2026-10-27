-- C006 The Hollow Creek Murders: catalog details, $12.99 (Tier 4, 8 to 12 hours), shown as Coming Soon.
-- Only accounts with an early-access grant can open it while it is Coming Soon
-- (see src/lib/assignment.ts and startInvestigation in src/game/persistence.ts).
-- Nothing here names anyone responsible or says how the crimes connect.

insert into public.cases (
  id, case_number, title, classification, location, year, synopsis, summary,
  difficulty, tier_id, est_minutes, min_investigators, max_investigators,
  status, is_preview, catalog_order
) values (
  'C006', '006', 'The Hollow Creek Murders', 'Cold case and active homicide', 'Hollow Creek, Pennsylvania', 2018,
  'In 1996 a nineteen-year-old girl drove to the edge of town and was never seen again. Twenty-two years later she is found in a welded-shut room at the old steel mill, and the town''s past starts killing people again.',
  'In August 1996 Emily Lasko left her mother''s house in Hollow Creek, Pennsylvania, and was written off as a runaway. In October 2018 three teenagers find her remains in a sealed tool room at the abandoned East Mill. Her sister hires Blackwood. Emily had spent her last summer asking questions about three men who died at the plant that June. Now someone is asking the same questions, and someone else wants them to stop. Blackwood''s first long-form case: six chapters, about eight hours, saved as you go.',
  4, 'tier4', 480, 1, 6,
  'coming_soon', false, 6
)
on conflict (id) do update set
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
  catalog_order = excluded.catalog_order;

-- Early access for the agency's own test accounts.
insert into public.case_entitlements (user_id, case_id, source)
select u.id, 'C006', 'grant'
from auth.users u
where lower(u.email) in ('imbush89@gmail.com', 'bundleofbushes@gmail.com')
on conflict (user_id, case_id) do update set source = 'grant';

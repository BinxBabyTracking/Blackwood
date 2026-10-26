-- C002 A Short Trip: catalog details, $4.99 (Tier 2), shown as Coming Soon.
-- Only accounts with an early-access grant can open it while it is Coming Soon
-- (see src/lib/assignment.ts and startInvestigation in src/game/persistence.ts).

update public.cases set
  title = 'A Short Trip',
  classification = 'Reported kidnapping',
  location = 'Mariposa Bay, California',
  year = 1988,
  synopsis = 'A schoolteacher is taken from her boyfriend''s home in the middle of the night, by his account. The police think the boyfriend is lying. Her sister thinks nobody is looking for her.',
  summary = 'Early on a Monday in October 1988, Laura Kessler disappears from her boyfriend''s house in Mariposa Bay. Tom Hale says a masked man drugged them both and took her. He waited ten hours to call the police, and the police have stopped looking past him. Laura''s sister has hired Blackwood Investigations to find out what happened, and to find Laura.',
  difficulty = 2,
  tier_id = 'tier2',
  est_minutes = 120,
  status = 'coming_soon',
  is_preview = false
where id = 'C002';

-- Early access for the agency's own test accounts.
insert into public.case_entitlements (user_id, case_id, source)
select u.id, 'C002', 'grant'
from auth.users u
where lower(u.email) in ('imbush89@gmail.com', 'bundleofbushes@gmail.com')
on conflict (user_id, case_id) do update set source = 'grant';

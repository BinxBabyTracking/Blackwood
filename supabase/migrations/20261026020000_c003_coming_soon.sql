-- C003 The Witness on Alder Street: catalog details, $4.99 (Tier 2), shown as Coming Soon.
-- Only accounts with an early-access grant can open it while it is Coming Soon
-- (see src/lib/assignment.ts and startInvestigation in src/game/persistence.ts).
-- Nothing here mentions the second crime: it must stay unknown until it happens in play.

update public.cases set
  title = 'The Witness on Alder Street',
  classification = 'Double homicide',
  location = 'Bellwether, Pennsylvania',
  year = 2018,
  synopsis = 'A couple is shot dead on a quiet street in a Pennsylvania steel town, their five-year-old asleep in the back seat. The police call it a robbery. Nothing was taken but a bag.',
  summary = 'On a Friday night in September 2018, Jenna Kowalski and Ethan Cole were shot on Alder Street in Bellwether, Pennsylvania, while their daughter slept in the back seat. Six weeks later the police still call it a robbery gone wrong, though the only thing missing is the bag Ethan carried everywhere that week. Jenna''s sister has hired Blackwood Investigations to find out what Ethan was afraid of, and who was waiting for them that night.',
  difficulty = 2,
  tier_id = 'tier2',
  est_minutes = 120,
  status = 'coming_soon',
  is_preview = false
where id = 'C003';

-- Early access for the agency's own test accounts.
insert into public.case_entitlements (user_id, case_id, source)
select u.id, 'C003', 'grant'
from auth.users u
where lower(u.email) in ('imbush89@gmail.com', 'bundleofbushes@gmail.com')
on conflict (user_id, case_id) do update set source = 'grant';

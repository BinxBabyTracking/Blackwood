-- C004 The Last Broadcast: catalog details, $4.99 (Tier 2), shown as Coming Soon.
-- Only accounts with an early-access grant can open it while it is Coming Soon
-- (see src/lib/assignment.ts and startInvestigation in src/game/persistence.ts).
-- Nothing here mentions the warehouse or who is responsible.

update public.cases set
  title = 'The Last Broadcast',
  classification = 'Homicide (Historical Case File)',
  location = 'Chicago, Illinois',
  year = 1927,
  synopsis = 'Chicago''s favorite radio voice is found dead behind his own barred studio door, twenty-five minutes after half the city heard him say good evening. The police like his partner for it. His sister thinks the station is hiding something.',
  summary = 'On a rainy Friday night in October 1927, Arthur Vale opened his program on WCRB at a quarter past ten. At twenty to eleven he was found dead in Studio A, the door barred from inside. The police have settled on his business partner, who shouted at him over money that evening and lied about where he went. Vale''s sister has hired the Ashby and Lowe Detective Bureau, whose closed files Blackwood now holds, to find out what her brother meant to announce at 10:35, and who made sure he never did.',
  difficulty = 3,
  tier_id = 'tier2',
  est_minutes = 120,
  status = 'coming_soon',
  is_preview = false
where id = 'C004';

-- Early access for the agency's own test accounts.
insert into public.case_entitlements (user_id, case_id, source)
select u.id, 'C004', 'grant'
from auth.users u
where lower(u.email) in ('imbush89@gmail.com', 'bundleofbushes@gmail.com')
on conflict (user_id, case_id) do update set source = 'grant';

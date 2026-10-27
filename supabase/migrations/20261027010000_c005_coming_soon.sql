-- C005 The Abbey of Silent Bells: catalog details, $4.99 (Tier 2), shown as Coming Soon.
-- Only accounts with an early-access grant can open it while it is Coming Soon
-- (see src/lib/assignment.ts and startInvestigation in src/game/persistence.ts).
-- Nothing here names the killer or says what became of the novice.

update public.cases set
  title = 'The Abbey of Silent Bells',
  classification = 'Historical case file: murder',
  location = 'Saint Aldwyn''s Abbey, northern England',
  year = 1327,
  synopsis = 'A scholar monk lies dead behind a barred door, and the charter he was copying is gone. The abbot calls it a seizure. You are the archdeacon''s examiner.',
  summary = 'On a Monday evening in October 1327, Brother Edmund of Saint Aldwyn''s is found dead in the abbey''s book room, the door barred from within. The abbot insists his heart failed. The infirmarian who washed the body does not agree, and an old writing about the abbey''s lands has vanished from Edmund''s keeping. A historical case file reconstructed by Blackwood: no telephones, no laboratories, only what eyes, records and testimony can show, and the order of the abbey''s bells.',
  difficulty = 3,
  tier_id = 'tier2',
  est_minutes = 150,
  status = 'coming_soon',
  is_preview = false
where id = 'C005';

-- Early access for the agency's own test accounts.
insert into public.case_entitlements (user_id, case_id, source)
select u.id, 'C005', 'grant'
from auth.users u
where lower(u.email) in ('imbush89@gmail.com', 'bundleofbushes@gmail.com')
on conflict (user_id, case_id) do update set source = 'grant';

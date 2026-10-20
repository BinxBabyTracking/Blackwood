-- Blackwood Investigations, Phase 2: open Case C001 for play.
-- Run once in the Supabase SQL Editor after the Phase 1 setup.

update public.cases set
  title = 'The Whitmore File',
  classification = 'Homicide',
  synopsis = 'Eleanor Whitmore, a respected member of her community, is discovered murdered in her home following a small gathering. Four people attended that evening, and their statements appear straightforward.',
  summary = 'Eleanor Whitmore, a respected member of her community, is discovered murdered in her home following a small gathering. Four people attended that evening. Their statements appear straightforward, but the physical evidence suggests a more complicated sequence of events. Blackwood Investigations has been asked to independently review the circumstances surrounding her death: examine the scene, interview the witnesses, analyse the evidence and determine what happened.',
  difficulty = 1,
  est_minutes = 20,
  min_investigators = 1,
  max_investigators = 6,
  status = 'available',
  released_at = coalesce(released_at, now())
where id = 'C001';

-- First rank promotion: Junior Investigator after one closed case.
update public.agency_ranks set min_cases_closed = 1 where level = 2;

-- Retire the "being prepared" notice and announce the opening.
update public.agency_notices set is_published = false where title = 'Case 001 is being prepared';
insert into public.agency_notices (category, title, body, published_at, is_published) values
  ('assignment', 'Case 001 is open: The Whitmore File',
   'The agency''s introductory assignment is now open to every investigator. Review the file in Available Assignments and accept it to begin.',
   now(), true);

create index if not exists investigation_sessions_case_status on public.investigation_sessions (case_id, status);

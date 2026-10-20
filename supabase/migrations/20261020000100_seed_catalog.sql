-- Blackwood Investigations, Phase 1 seed: pricing tiers, ranks, cases, commendations, notices.
-- Everything here is platform content. Edit freely from the Supabase dashboard.

insert into public.pricing_tiers (id, label, duration_label, min_minutes, max_minutes, price_cents, sort_order) values
  ('intro', 'Introductory', 'Approximately 20 minutes',   15,   30,    0, 0),
  ('tier1', 'Tier 1',       'Approximately 1 hour',       45,   75,  299, 1),
  ('tier2', 'Tier 2',       'Approximately 2–3 hours',   120,  180,  499, 2),
  ('tier3', 'Tier 3',       'Approximately 4–6 hours',   240,  360,  899, 3),
  ('tier4', 'Tier 4',       'Approximately 8–12 hours',  480,  720, 1299, 4),
  ('tier5', 'Tier 5',       'Approximately 20–30 hours',1200, 1800, 1799, 5),
  ('tier6', 'Tier 6',       'Approximately 40–60 hours',2400, 3600, 2500, 6)
on conflict (id) do update set
  label = excluded.label, duration_label = excluded.duration_label,
  min_minutes = excluded.min_minutes, max_minutes = excluded.max_minutes,
  price_cents = excluded.price_cents, sort_order = excluded.sort_order, updated_at = now();

insert into public.agency_ranks (level, title, description) values
  (1, 'Probationary Investigator', 'Newly recruited. Works introductory assignments under agency review.'),
  (2, 'Junior Investigator',       'Cleared for standard assignments after a first closed case.'),
  (3, 'Investigator',              'A dependable record of closed cases and sound findings.'),
  (4, 'Senior Investigator',       'Trusted with long-form investigations and joint assignments.'),
  (5, 'Lead Investigator',         'Directs joint investigations and complex case work.'),
  (6, 'Chief Investigator',        'The agency''s most accomplished investigators.')
on conflict (level) do update set title = excluded.title, description = excluded.description;

insert into public.cases (
  id, case_number, title, classification, location, year, synopsis, summary,
  difficulty, tier_id, est_minutes, min_investigators, max_investigators,
  status, is_preview, is_introductory, catalog_order
) values (
  'C001', '001', 'The Last Guest', 'Homicide', 'Los Angeles, California', 1985,
  'Following a small gathering at Eleanor Whitmore''s home, she is found murdered. The circumstances surrounding her death raise questions about the people who attended that evening.',
  'In August 1985, Eleanor Whitmore hosted a small gathering at her Los Angeles home. By the following morning she was dead. The circumstances surrounding her death raise questions about each of the people who attended that evening, and the agency has opened a file to establish what happened in the hours after the last guest arrived.',
  1, 'intro', 20, 1, 6,
  'coming_soon', false, true, 1
)
on conflict (id) do update set
  title = excluded.title, synopsis = excluded.synopsis, summary = excluded.summary,
  status = excluded.status, tier_id = excluded.tier_id;

-- Placeholder files that show the shape of the archive. They carry no story
-- content, are marked as previews and can never be purchased.
insert into public.cases (
  id, case_number, title, classification, location, year, synopsis, summary,
  difficulty, tier_id, est_minutes, min_investigators, max_investigators,
  status, is_preview, catalog_order
) values
  ('C002', '002', 'Sealed file', 'Unassigned', null, null,
   'This file is still being prepared by the archive. Details will be released when the case opens.',
   'This file is still being prepared by the archive. Details will be released when the case opens.',
   null, 'tier1', 60, 1, 4, 'in_development', true, 2),
  ('C003', '003', 'Sealed file', 'Unassigned', null, null,
   'This file is still being prepared by the archive. Details will be released when the case opens.',
   'This file is still being prepared by the archive. Details will be released when the case opens.',
   null, 'tier2', 150, 1, 6, 'in_development', true, 3),
  ('C004', '004', 'Sealed file', 'Unassigned', null, null,
   'This file is still being prepared by the archive. Details will be released when the case opens.',
   'This file is still being prepared by the archive. Details will be released when the case opens.',
   null, 'tier3', 300, 1, 1, 'in_development', true, 4),
  ('C005', '005', 'Sealed file', 'Unassigned', null, null,
   'This file is still being prepared by the archive. Details will be released when the case opens.',
   'This file is still being prepared by the archive. Details will be released when the case opens.',
   null, 'tier4', 600, 2, 6, 'in_development', true, 5)
on conflict (id) do nothing;

insert into public.achievements (id, title, description, criteria, sort_order) values
  ('first_case_closed',      'First Case Closed',      'Closed your first investigation for the agency.',           'Close any case with an accepted finding.', 1),
  ('thorough_investigator',  'Thorough Investigator',  'Left no part of a scene unexamined.',                         'Examine every evidence item in a single case.', 2),
  ('evidence_specialist',    'Evidence Specialist',    'Built a finding on a complete chain of evidence.',          'Submit a finding supported by every key piece of evidence.', 3),
  ('exceptional_deduction',  'Exceptional Deduction',  'Reached the truth with no incorrect accusations.',            'Close a case with a perfect accuracy score.', 4),
  ('joint_operation',        'Joint Operation',        'Closed a case as part of a joint investigation.',            'Close a case in a joint investigation with at least one other investigator.', 5)
on conflict (id) do update set title = excluded.title, description = excluded.description, criteria = excluded.criteria;

insert into public.agency_notices (category, title, body, published_at, is_published) values
  ('assignment', 'Case 001 is being prepared',
   'The Last Guest is the agency''s introductory assignment. Its file is in preparation and will open to all investigators when the investigation desk goes live.',
   now(), true),
  ('announcement', 'New case management portal',
   'Headquarters now runs on a new case management system. Your personnel file, service record and settings are kept here.',
   now(), true),
  ('archive', 'Archive intake under way',
   'Additional files are being catalogued. Sealed files appear in Available Assignments as previews until they are ready.',
   now(), true);

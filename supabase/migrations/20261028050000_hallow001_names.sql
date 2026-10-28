-- HALLOW001's cast was renamed to avoid clashes with other cases (docs/HALLOW001-timeline.md): the victim is Ambrose Blackthorn.
update public.cases
set summary = replace(replace(summary, 'Antiquarian Edmund Blackthorn', 'Antiquarian Ambrose Blackthorn'), 'whoever killed Edmund', 'whoever killed Ambrose')
where id = 'HALLOW001';

-- Nobody denies the veiled woman was there; nobody will say who she was.
update public.cases
set summary = replace(summary, 'Others swear she was never there.', 'Nobody will say who she was.')
where id = 'HALLOW001';

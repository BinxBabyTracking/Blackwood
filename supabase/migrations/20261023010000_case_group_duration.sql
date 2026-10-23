-- How long a case takes with friends (a joint investigation), beside the solo
-- estimate. Shown as "About 1 hour solo, 20 minutes with friends".
alter table public.cases add column if not exists est_minutes_group integer check (est_minutes_group is null or est_minutes_group > 0);

-- C001, timed by real players: about an hour alone, about 20 minutes as a group.
update public.cases set est_minutes = 60, est_minutes_group = 20 where id = 'C001';
update public.pricing_tiers set duration_label = 'About 1 hour solo, 20 minutes with friends' where id = 'intro';

notify pgrst, 'reload schema';

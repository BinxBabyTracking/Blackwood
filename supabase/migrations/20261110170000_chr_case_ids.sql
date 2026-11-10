-- Christmas case ids: CHR001 and on (CHR001 The Christmas That Never Happened).
-- Only the id rule changes here. The CHR001 catalog row (Coming Soon,
-- available_month 12, 4 to 10 investigators) is added when the case should
-- appear on the site; until then it exists only on the Admin page.
alter table public.cases drop constraint if exists cases_id_check;
alter table public.cases add constraint cases_id_check
  check (id ~ '^(C[0-9]{3}|S[0-9]{3}C[0-9]{2}|HALLOW[0-9]{3}|CHR[0-9]{3})$');

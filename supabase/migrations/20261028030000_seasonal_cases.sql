-- Seasonal cases: available_month is the only month (1 to 12, Eastern time) a
-- case can be started. Outside it the card shows "Returns <Month> 1"; open
-- investigations can still be finished. The agency's test accounts are exempt
-- (src/lib/season.ts). Null means available all year.

alter table public.cases add column if not exists available_month smallint
  check (available_month is null or available_month between 1 and 12);

-- The HALLOW cases run in October.
update public.cases set available_month = 10 where id like 'HALLOW%';

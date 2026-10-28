-- Early access requests for Coming Soon cases.
--
-- Once the agency's owner (imbush89@gmail.com) has solved a Coming Soon case,
-- it opens for requests: its page shows the leaderboard and a Request early
-- access button. Admin approves (an early-access grant, so the case can be
-- played now) or denies (the player waits for release and buys it then).

alter table public.cases add column if not exists early_access_open boolean not null default false;

create table if not exists public.early_access_requests (
  id          bigint generated always as identity primary key,
  case_id     text not null references public.cases (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at  timestamptz not null default now(),
  decided_at  timestamptz,
  unique (case_id, user_id)
);
-- Server only: read and written with the service role.
alter table public.early_access_requests enable row level security;

-- The owner's solve opens a Coming Soon case for requests.
create or replace function public.open_early_access_on_owner_solve()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if exists (select 1 from auth.users u where u.id = new.user_id and lower(u.email) = 'imbush89@gmail.com') then
    update public.cases set early_access_open = true where id = new.case_id and status = 'coming_soon';
  end if;
  return new;
end;
$$;

drop trigger if exists open_early_access on public.case_completions;
create trigger open_early_access
after insert or update on public.case_completions
for each row execute function public.open_early_access_on_owner_solve();

revoke all on function public.open_early_access_on_owner_solve() from public, anon, authenticated;

-- Cases the owner has already solved.
update public.cases c set early_access_open = true
where c.status = 'coming_soon'
  and exists (
    select 1 from public.case_completions cc join auth.users u on u.id = cc.user_id
    where cc.case_id = c.id and lower(u.email) = 'imbush89@gmail.com'
  );

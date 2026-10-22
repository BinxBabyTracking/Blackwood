-- Paste this whole file into Supabase: SQL Editor > New query > Run.
-- It applies the two migrations not yet on the live database. Safe to run more than once.

-- Step 8: case resolution and agency progression.
--
-- A successful final report closes the investigation and updates the
-- investigator's career in one idempotent transaction. Submitting the same
-- report twice, revisiting the conclusion, or closing a replay can never
-- count the same case twice or award a commendation twice.

-- The final report filed for each investigation (original or replay).
alter table public.investigation_sessions add column if not exists final_report jsonb;

-- The first time each investigator closed each case. Replays add to `completions`
-- but never to Cases Closed.
create table if not exists public.case_completions (
  user_id            uuid not null references auth.users (id) on delete cascade,
  case_id            text not null references public.cases (id),
  first_session_id   uuid not null references public.investigation_sessions (id),
  first_completed_at timestamptz not null default now(),
  accuracy           numeric(5, 2),
  attempts           integer not null default 1,
  completions        integer not null default 1,
  last_completed_at  timestamptz not null default now(),
  primary key (user_id, case_id)
);

alter table public.case_completions enable row level security;

drop policy if exists "Investigators read their own completions" on public.case_completions;
create policy "Investigators read their own completions" on public.case_completions
  for select to authenticated using (user_id = (select auth.uid()));

-- Rank thresholds, kept as data so they can be tuned without code.
update public.agency_ranks set min_cases_closed = 1, min_accuracy = null where level = 2;
update public.agency_ranks set min_cases_closed = 3, min_accuracy = 60 where level = 3;
update public.agency_ranks set min_cases_closed = 6, min_accuracy = 70 where level = 4;
update public.agency_ranks set min_cases_closed = 10, min_accuracy = 75 where level = 5;
update public.agency_ranks set min_cases_closed = 15, min_accuracy = 80 where level = 6;

/*
 * Records a successful investigation. Called only by the server (service role)
 * after the case engine has accepted the report. Locks the session row so two
 * concurrent submissions cannot both pass the "already closed" check.
 *
 * Returns { recorded, first, awarded[], rank_level }.
 */
create or replace function public.record_case_completion(
  p_user uuid,
  p_case text,
  p_session uuid,
  p_report jsonb,
  p_seconds integer,
  p_accuracy numeric,
  p_attempts integer,
  p_awards text[]
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.investigation_sessions%rowtype;
  v_first boolean;
  v_record public.service_records%rowtype;
  v_closed integer;
  v_accuracy numeric;
  v_awarded text[];
  v_target smallint;
  v_rank smallint;
begin
  select * into v_session from public.investigation_sessions where id = p_session and case_id = p_case for update;
  if not found then
    raise exception 'Unknown investigation';
  end if;
  if not exists (select 1 from public.investigation_participants where session_id = p_session and user_id = p_user) then
    raise exception 'Not your investigation';
  end if;

  -- Already closed: nothing changes, however many times this is called.
  if v_session.status = 'closed' then
    select rank_level into v_rank from public.detective_profiles where id = p_user;
    return jsonb_build_object('recorded', false, 'first', false, 'awarded', '[]'::jsonb, 'rank_level', v_rank);
  end if;

  update public.investigation_sessions
     set status = 'closed', completed_at = now(), progress = 100, last_activity_at = now(), final_report = p_report
   where id = p_session;

  insert into public.case_completions (user_id, case_id, first_session_id, accuracy, attempts)
  values (p_user, p_case, p_session, p_accuracy, p_attempts)
  on conflict (user_id, case_id) do update
     set completions = public.case_completions.completions + 1,
         last_completed_at = now()
  returning (xmax = 0) into v_first;

  select * into v_record from public.service_records where user_id = p_user for update;
  if v_first then
    v_closed := coalesce(v_record.cases_closed, 0) + 1;
    v_accuracy := case
      when v_record.accuracy is null then p_accuracy
      else round((v_record.accuracy * coalesce(v_record.cases_closed, 0) + p_accuracy) / v_closed, 2)
    end;
    update public.service_records
       set cases_closed = v_closed,
           accuracy = v_accuracy,
           total_investigation_seconds = coalesce(total_investigation_seconds, 0) + greatest(p_seconds, 0),
           updated_at = now()
     where user_id = p_user;
  else
    -- A replay adds the time spent, not another closed case.
    v_closed := coalesce(v_record.cases_closed, 0);
    v_accuracy := v_record.accuracy;
    update public.service_records
       set total_investigation_seconds = coalesce(total_investigation_seconds, 0) + greatest(p_seconds, 0),
           updated_at = now()
     where user_id = p_user;
  end if;

  with ins as (
    insert into public.user_achievements (user_id, achievement_id)
    select p_user, a from unnest(coalesce(p_awards, '{}')) as a
     where exists (select 1 from public.achievements where id = a)
    on conflict do nothing
    returning achievement_id
  )
  select coalesce(array_agg(achievement_id), '{}') into v_awarded from ins;

  select max(level) into v_target from public.agency_ranks
   where min_cases_closed is not null
     and v_closed >= min_cases_closed
     and (min_accuracy is null or coalesce(v_accuracy, 0) >= min_accuracy);
  update public.detective_profiles set rank_level = v_target, updated_at = now()
   where id = p_user and v_target is not null and v_target > rank_level;
  select rank_level into v_rank from public.detective_profiles where id = p_user;

  return jsonb_build_object('recorded', true, 'first', v_first, 'awarded', to_jsonb(v_awarded), 'rank_level', v_rank);
end;
$$;

revoke execute on function public.record_case_completion(uuid, text, uuid, jsonb, integer, numeric, integer, text[]) from public, anon, authenticated;
grant execute on function public.record_case_completion(uuid, text, uuid, jsonb, integer, numeric, integer, text[]) to service_role;

-- Investigations closed before this migration count as first completions.
insert into public.case_completions (user_id, case_id, first_session_id, first_completed_at, last_completed_at)
select distinct on (p.user_id, s.case_id) p.user_id, s.case_id, s.id, coalesce(s.completed_at, s.last_activity_at), coalesce(s.completed_at, s.last_activity_at)
  from public.investigation_sessions s
  join public.investigation_participants p on p.session_id = s.id
 where s.status = 'closed'
 order by p.user_id, s.case_id, s.completed_at
on conflict do nothing;

-- Invite-only sign-up while Blackwood is in testing.
--
-- A trigger on auth.users refuses any new account whose email is not on the
-- invitation list, so it holds however the sign-up arrives (the site's form or
-- a direct call to Supabase Auth). Existing accounts are not affected.
--
-- Invite a tester:    insert into public.signup_invites (email, note) values ('name@example.com', 'tester');
-- Open sign-up to all: update public.site_settings set value = 'false' where key = 'invite_only';

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
-- No policies: only the service role (the server) and the dashboard read or change settings.

insert into public.site_settings (key, value) values ('invite_only', 'true')
on conflict (key) do nothing;

create table if not exists public.signup_invites (
  email text primary key check (position('@' in email) > 1),
  note text,
  invited_at timestamptz not null default now()
);
alter table public.signup_invites enable row level security;
-- No policies: the list of invited emails is never readable from the browser.

-- Emails are stored trimmed and lower-case, however they are typed in.
create or replace function public.normalize_signup_invite()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end;
$$;
revoke execute on function public.normalize_signup_invite() from public, anon, authenticated;
drop trigger if exists normalize_signup_invite on public.signup_invites;
create trigger normalize_signup_invite
  before insert or update on public.signup_invites
  for each row execute function public.normalize_signup_invite();

create or replace function public.enforce_signup_invite()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  closed boolean;
begin
  select coalesce((value)::text::boolean, false) into closed from public.site_settings where key = 'invite_only';
  if coalesce(closed, false)
     and not exists (select 1 from public.signup_invites i where i.email = lower(btrim(coalesce(new.email, '')))) then
    raise exception 'BLACKWOOD_INVITE_ONLY' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_signup_invite() from public, anon, authenticated;

drop trigger if exists enforce_signup_invite on auth.users;
create trigger enforce_signup_invite
  before insert on auth.users
  for each row execute function public.enforce_signup_invite();

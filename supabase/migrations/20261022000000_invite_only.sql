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

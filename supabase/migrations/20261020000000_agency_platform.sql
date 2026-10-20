-- Blackwood Investigations, Phase 1: agency platform schema
-- Run in the Supabase SQL editor, or with `supabase db push`.
--
-- Conventions
--   * Catalog data (pricing tiers, ranks, cases, commendations, notices) is public-read
--     and only writable with the service role (dashboard / future admin tooling).
--   * Player data is readable by its owner. Anything that affects progression,
--     entitlements or session membership is written only by SECURITY DEFINER
--     functions or the service role, never directly by the client.


-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table public.pricing_tiers (
  id            text primary key,                 -- 'intro', 'tier1' ... 'tier6'
  label         text not null,                    -- 'Introductory', 'Tier 1'
  duration_label text not null,                   -- 'Approximately 1 hour'
  min_minutes   integer not null check (min_minutes > 0),
  max_minutes   integer not null check (max_minutes >= min_minutes),
  price_cents   integer not null check (price_cents >= 0),
  currency      text not null default 'USD',
  sort_order    integer not null,
  is_active     boolean not null default true,
  updated_at    timestamptz not null default now()
);

create table public.agency_ranks (
  level             smallint primary key,
  title             text not null unique,
  description       text not null,
  -- Advancement criteria are deliberately nullable until the investigation
  -- engine reports real results. Null means "criteria not yet published".
  min_cases_closed  integer,
  min_accuracy      numeric(5,2)
);

create type public.case_status as enum ('in_development', 'coming_soon', 'available', 'retired');

create table public.cases (
  id               text primary key check (id ~ '^C[0-9]{3}$'),   -- stable id, e.g. C001
  case_number      text not null unique,                        -- '001'
  title            text not null,
  classification   text not null,                               -- 'Homicide'
  location         text,
  year             integer,
  synopsis         text not null,                               -- short card text
  summary          text not null,                               -- case file page text
  difficulty       smallint check (difficulty between 1 and 5),     -- null = not yet rated
  tier_id          text not null references public.pricing_tiers(id),
  est_minutes      integer not null check (est_minutes > 0),
  min_investigators smallint not null default 1 check (min_investigators >= 1),
  max_investigators smallint not null default 1 check (max_investigators between 1 and 6),
  status           public.case_status not null default 'in_development',
  is_preview       boolean not null default false,  -- placeholder card, never purchasable
  is_introductory  boolean not null default false,
  cover_image_url  text,
  hero_image_url   text,
  released_at      timestamptz,
  catalog_order    integer not null default 100,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (max_investigators >= min_investigators)
);

create table public.achievements (
  id          text primary key,             -- 'first_case_closed'
  title       text not null,
  description text not null,
  criteria    text not null,                 -- human readable unlock condition
  sort_order  integer not null default 100
);

create type public.notice_category as enum ('assignment', 'archive', 'announcement');

create table public.agency_notices (
  id           uuid primary key default gen_random_uuid(),
  category     public.notice_category not null,
  title        text not null,
  body         text not null,
  published_at timestamptz not null default now(),
  expires_at   timestamptz,
  is_published boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Investigators
-- ---------------------------------------------------------------------------

create type public.investigation_preference as enum ('solo', 'collaborative');

create table public.detective_profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  display_name             text check (char_length(display_name) between 2 and 40),
  avatar_url               text,
  investigation_preference public.investigation_preference,
  rank_level               smallint not null default 1 references public.agency_ranks(level),
  onboarded_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table public.service_records (
  user_id                     uuid primary key references auth.users(id) on delete cascade,
  cases_closed                integer not null default 0,
  cases_investigated          integer not null default 0,
  total_investigation_seconds bigint  not null default 0,
  accuracy                    numeric(5,2),          -- null until a case is closed
  updated_at                  timestamptz not null default now()
);

create table public.user_achievements (
  user_id        uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id),
  awarded_at     timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create type public.text_size as enum ('standard', 'large', 'x_large');
create type public.color_vision as enum ('default', 'protanopia', 'deuteranopia', 'tritanopia');

create table public.user_settings (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  master_volume           smallint not null default 80 check (master_volume between 0 and 100),
  music_volume            smallint not null default 70 check (music_volume between 0 and 100),
  dialogue_volume         smallint not null default 90 check (dialogue_volume between 0 and 100),
  sfx_volume              smallint not null default 75 check (sfx_volume between 0 and 100),
  subtitles               boolean  not null default true,
  text_size               public.text_size not null default 'standard',
  reduced_motion          boolean  not null default false,
  high_contrast           boolean  not null default false,
  color_vision            public.color_vision not null default 'default',
  notify_announcements    boolean  not null default true,
  notify_new_assignments  boolean  not null default true,
  notify_joint_invites    boolean  not null default true,
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Entitlements and investigations
-- ---------------------------------------------------------------------------

create type public.entitlement_source as enum ('free', 'purchase', 'grant');

create table public.case_entitlements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  case_id    text not null references public.cases(id),
  source     public.entitlement_source not null,
  -- Reference to the payment provider record once purchases exist.
  external_ref text,
  granted_at timestamptz not null default now(),
  unique (user_id, case_id)
);

create type public.session_mode as enum ('solo', 'joint');
create type public.session_status as enum ('forming', 'active', 'closed', 'archived', 'abandoned');

create table public.investigation_sessions (
  id               uuid primary key default gen_random_uuid(),
  case_id          text not null references public.cases(id),
  host_user_id     uuid not null references auth.users(id) on delete cascade,
  mode             public.session_mode not null,
  status           public.session_status not null default 'forming',
  invite_code      text unique check (invite_code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  max_participants smallint not null default 6 check (max_participants between 1 and 6),
  progress         smallint not null default 0 check (progress between 0 and 100),
  started_at       timestamptz,
  last_activity_at timestamptz not null default now(),
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);
create index on public.investigation_sessions (case_id);

create type public.participant_role as enum ('host', 'investigator');

create table public.investigation_participants (
  session_id uuid not null references public.investigation_sessions(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.participant_role not null default 'investigator',
  is_ready   boolean not null default false,
  joined_at  timestamptz not null default now(),
  primary key (session_id, user_id)
);
create index on public.investigation_participants (user_id);

create table public.save_games (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.investigation_sessions(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  schema_version integer not null default 1,
  state          jsonb not null default '{}'::jsonb,   -- owned by the Phase 2 engine
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on public.save_games (session_id, user_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger detective_profiles_touch before update on public.detective_profiles
  for each row execute function public.touch_updated_at();
create trigger user_settings_touch before update on public.user_settings
  for each row execute function public.touch_updated_at();
create trigger cases_touch before update on public.cases
  for each row execute function public.touch_updated_at();

-- Every new auth user gets an empty profile, service record and default settings.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.detective_profiles (id) values (new.id);
  insert into public.service_records (user_id) values (new.id);
  insert into public.user_settings (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Membership check used by RLS (security definer avoids policy recursion).
create or replace function public.is_session_member(p_session uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.investigation_participants
    where session_id = p_session and user_id = auth.uid()
  );
$$;

create or replace function public.shares_session_with(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.investigation_participants mine
    join public.investigation_participants theirs using (session_id)
    where mine.user_id = auth.uid() and theirs.user_id = p_user
  );
$$;

-- Users may only change these profile columns; rank and onboarding stamp are server-owned.
create or replace function public.guard_profile_update() returns trigger
language plpgsql as $$
begin
  if auth.role() = 'authenticated' then
    new.rank_level := old.rank_level;
    new.created_at := old.created_at;
    if old.onboarded_at is not null then
      new.onboarded_at := old.onboarded_at;
    elsif new.onboarded_at is not null then
      new.onboarded_at := now();
    end if;
  end if;
  return new;
end $$;

create trigger detective_profiles_guard before update on public.detective_profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- Joint investigation RPCs (server-side authorization)
-- ---------------------------------------------------------------------------

create or replace function public.generate_invite_code() returns text
language plpgsql as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.investigation_sessions where invite_code = code);
  end loop;
  return code;
end $$;

-- Opens a joint investigation. Only succeeds for an available case the caller is entitled to.
create or replace function public.open_joint_investigation(p_case_id text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_case public.cases;
  v_session uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_case from public.cases where id = p_case_id;
  if not found then
    raise exception 'case_not_found' using errcode = 'P0002';
  end if;
  if v_case.status <> 'available' or v_case.is_preview then
    raise exception 'case_not_open' using errcode = 'P0001';
  end if;
  if v_case.max_investigators < 2 then
    raise exception 'case_solo_only' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.case_entitlements where user_id = auth.uid() and case_id = p_case_id) then
    raise exception 'not_entitled' using errcode = '42501';
  end if;

  insert into public.investigation_sessions (case_id, host_user_id, mode, invite_code, max_participants)
  values (p_case_id, auth.uid(), 'joint', public.generate_invite_code(), least(v_case.max_investigators, 6))
  returning id into v_session;

  insert into public.investigation_participants (session_id, user_id, role)
  values (v_session, auth.uid(), 'host');

  return v_session;
end $$;

-- Joins a forming joint investigation by invite code, enforcing capacity.
create or replace function public.join_joint_investigation(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_session public.investigation_sessions;
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_session from public.investigation_sessions
  where invite_code = upper(trim(p_code)) and mode = 'joint'
  for update;

  if not found or v_session.status <> 'forming' then
    raise exception 'session_not_found' using errcode = 'P0002';
  end if;

  if exists (select 1 from public.investigation_participants where session_id = v_session.id and user_id = auth.uid()) then
    return v_session.id;
  end if;

  select count(*) into v_count from public.investigation_participants where session_id = v_session.id;
  if v_count >= v_session.max_participants then
    raise exception 'session_full' using errcode = 'P0001';
  end if;

  insert into public.investigation_participants (session_id, user_id) values (v_session.id, auth.uid());
  return v_session.id;
end $$;

create or replace function public.set_investigator_ready(p_session uuid, p_ready boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.investigation_participants
     set is_ready = p_ready
   where session_id = p_session and user_id = auth.uid();
  if not found then
    raise exception 'not_a_member' using errcode = '42501';
  end if;
end $$;

create or replace function public.leave_joint_investigation(p_session uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_host uuid;
begin
  select host_user_id into v_host from public.investigation_sessions where id = p_session and status = 'forming';
  if not found then
    raise exception 'session_not_found' using errcode = 'P0002';
  end if;
  if v_host = auth.uid() then
    -- Host leaving closes the forming session for everyone.
    update public.investigation_sessions set status = 'abandoned', last_activity_at = now() where id = p_session;
  else
    delete from public.investigation_participants where session_id = p_session and user_id = auth.uid();
  end if;
end $$;

revoke all on function public.open_joint_investigation(text) from public, anon;
revoke all on function public.join_joint_investigation(text) from public, anon;
revoke all on function public.set_investigator_ready(uuid, boolean) from public, anon;
revoke all on function public.leave_joint_investigation(uuid) from public, anon;
grant execute on function public.open_joint_investigation(text) to authenticated;
grant execute on function public.join_joint_investigation(text) to authenticated;
grant execute on function public.set_investigator_ready(uuid, boolean) to authenticated;
grant execute on function public.leave_joint_investigation(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.pricing_tiers            enable row level security;
alter table public.agency_ranks             enable row level security;
alter table public.cases                    enable row level security;
alter table public.achievements             enable row level security;
alter table public.agency_notices           enable row level security;
alter table public.detective_profiles       enable row level security;
alter table public.service_records          enable row level security;
alter table public.user_achievements        enable row level security;
alter table public.user_settings            enable row level security;
alter table public.case_entitlements        enable row level security;
alter table public.investigation_sessions   enable row level security;
alter table public.investigation_participants enable row level security;
alter table public.save_games               enable row level security;

-- Public catalog
create policy "catalog: read tiers"   on public.pricing_tiers  for select using (is_active);
create policy "catalog: read ranks"   on public.agency_ranks   for select using (true);
create policy "catalog: read cases"   on public.cases          for select using (true);
create policy "catalog: read achievements" on public.achievements for select using (true);
create policy "catalog: read notices" on public.agency_notices for select
  using (is_published and published_at <= now() and (expires_at is null or expires_at > now()));

-- Profiles: owner reads and updates; fellow session members can read.
create policy "profiles: read own or teammates" on public.detective_profiles for select to authenticated
  using (id = auth.uid() or public.shares_session_with(id));
create policy "profiles: update own" on public.detective_profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Service record and commendations: owner read only. Written by the engine with the service role.
create policy "service record: read own" on public.service_records for select to authenticated
  using (user_id = auth.uid());
create policy "commendations: read own" on public.user_achievements for select to authenticated
  using (user_id = auth.uid());

-- Settings: owner reads and updates.
create policy "settings: read own" on public.user_settings for select to authenticated
  using (user_id = auth.uid());
create policy "settings: update own" on public.user_settings for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Entitlements: owner read only. Granted server-side (payments / free claims in Phase 2).
create policy "entitlements: read own" on public.case_entitlements for select to authenticated
  using (user_id = auth.uid());

-- Sessions and participants: members read. Mutations go through the RPCs above.
create policy "sessions: members read" on public.investigation_sessions for select to authenticated
  using (public.is_session_member(id));
create policy "participants: members read" on public.investigation_participants for select to authenticated
  using (public.is_session_member(session_id));

-- Save games: owner read only. Written by the Phase 2 engine.
create policy "saves: read own" on public.save_games for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Avatar storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars: public read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars: owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

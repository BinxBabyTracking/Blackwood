-- Joint investigations played in the same room.
--
-- The host (signed in) opens a lobby for a case and shows a QR code. Anyone
-- who scans it joins as a guest with just a name, no account, and helps the
-- host: every guest action is applied to the host's own investigation. Guests
-- can add to the final report; only the host can file it.
--
-- Server only: read and written with the service role. No browser access.

create table if not exists public.party_lobbies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  -- The secret in the QR link; the short code alone is not enough to join.
  join_key text not null,
  host_user_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  status text not null default 'lobby' check (status in ('lobby', 'started', 'ended')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  expires_at timestamptz not null default now() + interval '12 hours'
);

create index if not exists party_lobbies_host on public.party_lobbies (host_user_id, status);

create table if not exists public.party_guests (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.party_lobbies (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists party_guests_lobby on public.party_guests (lobby_id);

alter table public.party_lobbies enable row level security;
alter table public.party_guests enable row level security;
-- No policies: only the server reads and writes lobbies and guests.

-- Case leaderboards. A first solve of a case can be put on that case's board,
-- solo or as a named group (a joint investigation). Server only, like the rest
-- of the game data: read and written with the service role.

create table if not exists public.leaderboard_entries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  case_id text not null,
  -- One entry per investigation, and only for a player's first solve of the case.
  session_id uuid not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('solo', 'group')),
  name text not null check (char_length(name) between 2 and 30),
  group_size smallint not null default 1 check (group_size between 1 and 6),
  active_seconds integer not null check (active_seconds >= 0),
  questions integer not null check (questions >= 0),
  returned integer not null check (returned >= 0),
  score integer not null check (score between 0 and 1000),
  hidden boolean not null default false
);

create index if not exists leaderboard_case on public.leaderboard_entries (case_id, mode, hidden, score desc);
create index if not exists leaderboard_user on public.leaderboard_entries (user_id, case_id);

alter table public.leaderboard_entries enable row level security;
-- No policies: only the server reads and writes the board.

-- Joint investigations: the group's name, the investigation it played, and the largest table it had.
alter table public.party_lobbies add column if not exists group_name text check (char_length(group_name) <= 30);
alter table public.party_lobbies add column if not exists session_id uuid;
alter table public.party_lobbies add column if not exists max_size smallint not null default 1;
create index if not exists party_lobbies_session on public.party_lobbies (session_id);

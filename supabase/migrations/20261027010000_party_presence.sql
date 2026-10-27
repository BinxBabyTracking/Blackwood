-- Joint investigations: when each screen at the table was last heard from, so a
-- case can tell whether a player has dropped out (C004's captivity). Written by
-- the server on each sync, at most every 20 seconds per screen; never the save.
alter table public.party_guests add column if not exists last_seen timestamptz;
alter table public.party_lobbies add column if not exists host_last_seen timestamptz;

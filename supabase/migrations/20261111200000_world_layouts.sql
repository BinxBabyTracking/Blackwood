-- A walkable room as Ian arranged it in the world walk's Edit mode (furniture moved, turned, scaled, copied or
-- removed, and the room's size). Replaces the generated layout for that room until reset.
create table if not exists public.world_layouts (
  room_id text primary key,
  layout jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.world_layouts enable row level security;

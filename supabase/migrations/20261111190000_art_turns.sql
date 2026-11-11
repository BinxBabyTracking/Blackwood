-- How far to turn a 3D model (degrees, clockwise from above) because Meshy built it facing the wrong way.
-- Applies to every copy of that model in every room. Set from the world walk's Edit mode.
create table if not exists public.art_turns (
  image_id text primary key,
  turn integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.art_turns enable row level security;
insert into public.art_turns (image_id, turn) values ('chr001_jingle_office_model_chair', 180) on conflict (image_id) do update set turn = excluded.turn, updated_at = now();

-- 3D models (Meshy GLB files) for the walkable rooms, uploaded on Admin's Artwork tab.
-- Each "model" entry in art/manifest.json can have uploaded GLB versions; art_images.live_model
-- is the one the game uses. Files live in the private "art" bucket as art/<id>-<version>.glb
-- and are served by /art/gen/<id>-<version>.glb. Server only.

create table if not exists public.art_models (
  id bigint generated always as identity primary key,
  image_id text not null,
  version integer not null,
  created_at timestamptz not null default now(),
  size_bytes bigint not null default 0,
  unique (image_id, version)
);

create index if not exists art_models_image on public.art_models (image_id, version desc);

alter table public.art_models enable row level security;
-- No policies: only the server reads and writes it (the browser uploads with a signed upload).

alter table public.art_images add column if not exists live_model integer;

-- The bucket takes GLB files as well as pictures, up to 50 MB each.
update storage.buckets
set allowed_mime_types = array['image/webp', 'model/gltf-binary', 'application/octet-stream'],
    file_size_limit = 52428800
where id = 'art';

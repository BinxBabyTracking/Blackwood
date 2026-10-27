-- Artwork made from the Admin page with OpenAI's image model.
-- Each image in art/manifest.json can have generated versions; one of them may be live,
-- replacing the painting committed in public/art. Files live in the private "narration"
-- bucket under art/ and are served by /art/gen/<id>-<version>.webp. Server only.

create table if not exists public.art_images (
  id text primary key,
  live_version integer,
  -- The subject line used instead of the manifest's, when edited on Admin.
  subject text check (char_length(subject) <= 4000),
  updated_at timestamptz not null default now()
);

create table if not exists public.art_versions (
  id bigint generated always as identity primary key,
  image_id text not null,
  version integer not null,
  created_at timestamptz not null default now(),
  source text not null check (source in ('generated', 'uploaded')),
  model text,
  prompt text,
  cost_usd numeric(8, 4) not null default 0,
  unique (image_id, version)
);

create index if not exists art_versions_image on public.art_versions (image_id, version desc);

alter table public.art_images enable row level security;
alter table public.art_versions enable row level security;
-- No policies: only the server reads and writes these.

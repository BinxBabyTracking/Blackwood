-- Admin voice casting: voices designed with ElevenLabs Voice Design from a
-- character's description, and the one chosen for each character. A chosen
-- voice replaces the case's built-in voice for every player. Server-only:
-- RLS on, no policies; read and written with the service key.
create table if not exists public.voice_casting (
  case_id text not null,
  character_id text not null,
  -- The description used to design voices; null means the case's own direction.
  description text,
  -- The chosen ElevenLabs voice; null means the case's built-in voice.
  voice_id text,
  generated_voice_id text,
  updated_at timestamptz not null default now(),
  primary key (case_id, character_id)
);
alter table public.voice_casting enable row level security;

create table if not exists public.voice_previews (
  id uuid primary key default gen_random_uuid(),
  case_id text not null,
  character_id text not null,
  generated_voice_id text not null,
  description text not null,
  sample_text text not null,
  audio_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists voice_previews_character on public.voice_previews (case_id, character_id, created_at desc);
alter table public.voice_previews enable row level security;

-- The ElevenLabs voice a sample was saved as, so choosing it again never uses another voice slot.
alter table public.voice_previews add column if not exists saved_voice_id text;

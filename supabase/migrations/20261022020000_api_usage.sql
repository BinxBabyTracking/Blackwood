-- Spending ledger: one row for every paid call the game makes (or avoids by
-- reusing a saved answer or recording), with the case and playthrough it
-- belongs to. Costs are worked out when the Spending page is viewed, from the
-- rates in site_settings 'cost_rates', so changing a rate re-prices history.
--
-- Server only: written and read with the service role. No browser access.

create table if not exists public.api_usage (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  session_id uuid,
  case_id text not null,
  character_id text,
  -- 'claude' interview model, 'tts' ElevenLabs voices, 'stt' ElevenLabs transcription.
  service text not null check (service in ('claude', 'tts', 'stt')),
  purpose text not null,
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  characters integer not null default 0,
  audio_seconds numeric(8, 2) not null default 0,
  -- True when a saved answer or recording was reused instead: no charge.
  saved boolean not null default false
);

create index if not exists api_usage_case on public.api_usage (case_id, at desc);
create index if not exists api_usage_session on public.api_usage (session_id);

alter table public.api_usage enable row level security;
-- No policies: only the server writes and reads the ledger.

-- Starting rates in US dollars (October 2026 list prices; edit them on the Spending page).
insert into public.site_settings (key, value) values
  ('cost_rates', '{"claude_input_per_mtok": 0.10, "claude_output_per_mtok": 0.50, "tts_per_1k_chars": 0.10, "stt_per_hour": 0.22, "target_margin": 0.7}')
on conflict (key) do nothing;

-- Who may open the Spending page (user ids). Empty until set.
insert into public.site_settings (key, value) values ('admins', '[]')
on conflict (key) do nothing;

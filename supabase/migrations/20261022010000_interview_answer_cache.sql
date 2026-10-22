-- Saved interview answers, shared by all players.
--
-- When a question in the player's own words has been understood once (routed
-- to an authored answer, or answered by the character in their own words), the
-- result is saved here. A later question on the same subject, to the same
-- character, at the same point in the investigation, reuses it instead of
-- calling the interview model again. The spoken audio is already cached by its
-- exact text, so a reused answer also reuses its recording.
--
-- Server only: written and read with the service role. No browser access.

create table if not exists public.interview_answer_cache (
  id bigint generated always as identity primary key,
  case_id text not null,
  character_id text not null,
  -- 'entry': the question means this authored answer. 'answer': the character's own words.
  kind text not null check (kind in ('entry', 'answer')),
  -- For 'answer': a fingerprint of exactly what the character knew, so an answer is
  -- never given to a player who has not reached that point. Empty for 'entry'.
  knowledge_key text not null default '',
  question text not null,
  question_norm text not null,
  -- The question's subject words, sorted, as the built-in matcher reads them.
  concepts text[] not null default '{}',
  entry_id text,
  answer text,
  facts integer[] not null default '{}',
  hits integer not null default 0,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  unique (case_id, character_id, kind, knowledge_key, question_norm)
);

create index if not exists interview_answer_cache_lookup
  on public.interview_answer_cache (case_id, character_id, kind, knowledge_key);

alter table public.interview_answer_cache enable row level security;
-- No policies: only the server (service role) reads and writes saved answers.

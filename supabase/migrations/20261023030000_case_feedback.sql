-- Player feedback on cases: end-of-case reviews and in-game problem reports.
-- Server only (service role); players never read it.
create table if not exists public.case_feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  case_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  -- A guest at a joint investigation has no account; their name is kept instead.
  guest_name text,
  session_id uuid,
  kind text not null check (kind in ('review', 'report')),
  rating smallint check (rating between 1 and 5),
  difficulty text check (difficulty in ('too_easy', 'about_right', 'too_hard')),
  stuck text check (char_length(stuck) <= 500),
  message text check (char_length(message) <= 4000),
  -- For reports: where the player was and what had just been said.
  context jsonb
);
create index if not exists case_feedback_case on public.case_feedback (case_id, kind, created_at desc);
create index if not exists case_feedback_user on public.case_feedback (user_id, case_id);
alter table public.case_feedback enable row level security;
notify pgrst, 'reload schema';

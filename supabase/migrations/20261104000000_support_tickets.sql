-- Support tickets: a player (signed in or not) opens a ticket on /support and
-- the agency answers it on Admin > Support. Each ticket has a secret token: its
-- page, /support/<token>, is how a signed-out player gets back to it.
-- Server only: read and written with the service role.

create table if not exists public.support_tickets (
  id              bigint generated always as identity primary key,
  token           text not null unique,
  user_id         uuid references auth.users (id) on delete set null,
  email           text not null,
  name            text,
  category        text not null default 'other' check (category in ('account', 'billing', 'bug', 'case', 'other')),
  case_id         text,
  subject         text not null,
  status          text not null default 'open' check (status in ('open', 'answered', 'closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  player_seen_at  timestamptz not null default now(),
  staff_seen_at   timestamptz
);
create index if not exists support_tickets_user on public.support_tickets (user_id, updated_at desc);
create index if not exists support_tickets_status on public.support_tickets (status, updated_at desc);
alter table public.support_tickets enable row level security;

create table if not exists public.support_messages (
  id          bigint generated always as identity primary key,
  ticket_id   bigint not null references public.support_tickets (id) on delete cascade,
  author      text not null check (author in ('player', 'staff')),
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists support_messages_ticket on public.support_messages (ticket_id, created_at);
alter table public.support_messages enable row level security;

-- Run this once in the Supabase SQL editor.
create table if not exists public.pays (
  id text primary key,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.messages (
  id text primary key,
  "applicationId" text not null,
  "senderId" text not null,
  "senderName" text not null,
  "senderRole" text not null,
  message text not null,
  timestamp timestamptz not null default now(),
  read boolean not null default false
);

create index if not exists messages_application_id_timestamp_idx
  on public.messages ("applicationId", timestamp);

create table if not exists public.settings (
  id text primary key,
  payload jsonb not null default '{}'::jsonb
);

alter table public.pays enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;

-- The server uses the secret key and bypasses these policies.
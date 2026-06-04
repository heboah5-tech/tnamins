-- Supabase schema for cax-becare (migrated from Firebase).
-- Each "collection" is a table with a text primary key + a jsonb `data` column.

create table if not exists public.pays (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Full row data in realtime UPDATE/DELETE payloads.
alter table public.pays replica identity full;
alter table public.messages replica identity full;

-- Enable Realtime on both tables.
alter publication supabase_realtime add table public.pays;
alter publication supabase_realtime add table public.messages;

-- Privileges for the anon/publishable client.
grant all on table public.pays to anon, authenticated;
grant all on table public.messages to anon, authenticated;

-- RLS mirrors the previous open Firebase rules (public read/write).
alter table public.pays enable row level security;
alter table public.messages enable row level security;

drop policy if exists "public access pays" on public.pays;
drop policy if exists "public access messages" on public.messages;

create policy "public access pays" on public.pays
  for all using (true) with check (true);
create policy "public access messages" on public.messages
  for all using (true) with check (true);

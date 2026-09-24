-- =====================================================================
-- Taverna Inicial — esquema do banco (Supabase)
-- Idempotente: pode rodar em um banco que já tem profiles, characters,
-- rooms e tokens. Cria o que falta e adiciona colunas ausentes.
-- Supabase → SQL Editor → cole tudo → Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- ---------- characters (fichas) ----------
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid()
);
alter table public.characters add column if not exists owner_id uuid default auth.uid() references auth.users(id) on delete cascade;
alter table public.characters add column if not exists name text not null default 'Novo personagem';
alter table public.characters add column if not exists race text;
alter table public.characters add column if not exists class text;
alter table public.characters add column if not exists level int not null default 1;
alter table public.characters add column if not exists abilities jsonb not null
  default '{"str":10,"dex":10,"con":10,"int":10,"wis":10,"cha":10}'::jsonb;
alter table public.characters add column if not exists hp_current int not null default 10;
alter table public.characters add column if not exists hp_max int not null default 10;
alter table public.characters add column if not exists ac int not null default 10;
alter table public.characters add column if not exists speed int not null default 9;
alter table public.characters add column if not exists inventory jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists spells jsonb not null default '[]'::jsonb;
alter table public.characters add column if not exists notes text;
alter table public.characters add column if not exists created_at timestamptz not null default now();
alter table public.characters add column if not exists updated_at timestamptz not null default now();

-- ---------- rooms (mesas) ----------
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid()
);
alter table public.rooms add column if not exists owner_id uuid default auth.uid() references auth.users(id) on delete cascade;
alter table public.rooms add column if not exists name text not null default 'Nova mesa';
alter table public.rooms add column if not exists cols int not null default 24;
alter table public.rooms add column if not exists rows int not null default 16;
alter table public.rooms add column if not exists background_url text;
alter table public.rooms add column if not exists created_at timestamptz not null default now();

-- ---------- tokens ----------
create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid()
);
alter table public.tokens add column if not exists room_id uuid references public.rooms(id) on delete cascade;
alter table public.tokens add column if not exists owner_id uuid default auth.uid() references auth.users(id) on delete cascade;
alter table public.tokens add column if not exists character_id uuid references public.characters(id) on delete set null;
alter table public.tokens add column if not exists label text not null default 'Token';
alter table public.tokens add column if not exists color text not null default '#1d5fa8';
alter table public.tokens add column if not exists x int not null default 0;
alter table public.tokens add column if not exists y int not null default 0;
alter table public.tokens add column if not exists created_at timestamptz not null default now();

create index if not exists characters_owner_idx on public.characters(owner_id);
create index if not exists rooms_owner_idx on public.rooms(owner_id);
create index if not exists tokens_room_idx on public.tokens(room_id);

-- ---------- perfil automático no cadastro ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',   -- Google
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  ))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.profiles   enable row level security;
alter table public.characters enable row level security;
alter table public.rooms      enable row level security;
alter table public.tokens     enable row level security;

-- profiles: todos logados leem; cada um edita o seu
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update" on public.profiles for update to authenticated using (id = auth.uid());

-- characters: só o dono
drop policy if exists "characters_owner_all" on public.characters;
create policy "characters_owner_all" on public.characters for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- rooms: qualquer logado com o link entra; só o mestre (dono) altera
drop policy if exists "rooms_select" on public.rooms;
drop policy if exists "rooms_insert" on public.rooms;
drop policy if exists "rooms_update" on public.rooms;
drop policy if exists "rooms_delete" on public.rooms;
create policy "rooms_select" on public.rooms for select to authenticated using (true);
create policy "rooms_insert" on public.rooms for insert to authenticated with check (owner_id = auth.uid());
create policy "rooms_update" on public.rooms for update to authenticated using (owner_id = auth.uid());
create policy "rooms_delete" on public.rooms for delete to authenticated using (owner_id = auth.uid());

-- tokens: todos da mesa veem; dono do token ou mestre movem/removem
drop policy if exists "tokens_select" on public.tokens;
drop policy if exists "tokens_insert" on public.tokens;
drop policy if exists "tokens_update" on public.tokens;
drop policy if exists "tokens_delete" on public.tokens;
create policy "tokens_select" on public.tokens for select to authenticated using (true);
create policy "tokens_insert" on public.tokens for insert to authenticated with check (owner_id = auth.uid());
create policy "tokens_update" on public.tokens for update to authenticated using (
  owner_id = auth.uid()
  or exists (select 1 from public.rooms r where r.id = tokens.room_id and r.owner_id = auth.uid())
);
create policy "tokens_delete" on public.tokens for delete to authenticated using (
  owner_id = auth.uid()
  or exists (select 1 from public.rooms r where r.id = tokens.room_id and r.owner_id = auth.uid())
);

-- Realtime: a mesa usa Broadcast + Presence (canais públicos),
-- então não é preciso adicionar tabelas à publication supabase_realtime.

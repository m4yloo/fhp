-- ============================================================
-- FHP — Fazúľové Herné Poklady
-- Supabase schema (paste into SQL Editor and run once)
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
-- One row per user, auto-created on signup via trigger.
create table public.profiles (
  id          uuid not null references auth.users(id) on delete cascade primary key,
  username    text not null,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Games (catalog) ────────────────────────────────────────
-- Seeded via scripts/seed-supabase.js; world-readable.
create table public.games (
  id                   integer primary key,
  title                text not null,
  platform             text not null default 'Steam',
  available            boolean not null default true,
  image                text not null,
  genre                text not null,
  year                 integer not null,
  description          text not null default '',
  long_description     text not null default '',
  features             jsonb not null default '[]'::jsonb,
  developer            text not null default '',
  publisher            text not null default '',
  rating               text not null default '',
  size                 text not null default '',
  tags                 jsonb not null default '[]'::jsonb,
  sys_requirements_min jsonb not null default '{}'::jsonb,
  sys_requirements_rec jsonb not null default '{}'::jsonb
);

alter table public.games enable row level security;

create policy "Games are world-readable"
  on public.games for select
  using (true);


-- ── Passes (membership plans) ───────────────────────────────
create table public.passes (
  id                 uuid not null default gen_random_uuid() primary key,
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  redemptions_total  integer not null default 12,
  redemptions_used   integer not null default 0,
  expires_at         timestamptz not null,
  status             text not null default 'active' check (status in ('active','expired','revoked')),
  created_at         timestamptz default now() not null
);

alter table public.passes enable row level security;

create policy "Users can read own passes"
  on public.passes for select
  using (auth.uid() = user_id);

create policy "Users can update own passes"
  on public.passes for update
  using (auth.uid() = user_id);


-- ── User Games (your library) ──────────────────────────────
-- A row here means the user has received this game (replaces keys).
create table public.user_games (
  id          uuid not null default gen_random_uuid() primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  game_id     integer not null references public.games(id),
  acquired_at timestamptz default now() not null,
  status      text not null default 'doručené' check (status in ('doručené','vrátené')),
  unique (user_id, game_id)
);

alter table public.user_games enable row level security;

create policy "Users can read own games"
  on public.user_games for select
  using (auth.uid() = user_id);

create policy "Users can insert own games"
  on public.user_games for insert
  with check (auth.uid() = user_id);

create policy "Users can update own games"
  on public.user_games for update
  using (auth.uid() = user_id);


-- ── Transactions (ledger) ───────────────────────────────────
create table public.transactions (
  id          uuid not null default gen_random_uuid() primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('Získanie','Nákup','Vrátenie')),
  item        text not null,
  amount      text not null default '',
  status      text not null default 'doručené',
  hash        text not null default gen_random_uuid()::text,
  created_at  timestamptz default now() not null
);

alter table public.transactions enable row level security;

create policy "Users can read own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);


-- ── Helper: function to request a game ─────────────────────
-- Checks active pass, inserts user_game + transaction, decrements pass.
create or replace function public.request_game(p_game_id integer)
returns uuid as $$
declare
  v_pass_id   uuid;
  v_user_game uuid;
  v_txn_id    uuid;
begin
  -- Must be authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Find an active, non-expired pass with remaining redemptions
  select id into v_pass_id
  from public.passes
  where user_id = auth.uid()
    and status = 'active'
    and expires_at > now()
    and redemptions_used < redemptions_total
  order by expires_at desc
  limit 1;

  if v_pass_id is null then
    raise exception 'No active pass available';
  end if;

  -- Check user doesn't already own the game
  if exists (
    select 1 from public.user_games
    where user_id = auth.uid() and game_id = p_game_id
  ) then
    raise exception 'Game already in library';
  end if;

  -- Insert user_game
  insert into public.user_games (user_id, game_id)
  values (auth.uid(), p_game_id)
  returning id into v_user_game;

  -- Insert transaction
  insert into public.transactions (user_id, type, item, amount, status)
  values (auth.uid(), 'Získanie',
    (select title from public.games where id = p_game_id),
    '-1 hra', 'doručené')
  returning id into v_txn_id;

  -- Decrement pass
  update public.passes
  set redemptions_used = redemptions_used + 1
  where id = v_pass_id;

  return v_user_game;
end;
$$ language plpgsql security definer;

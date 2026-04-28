create type skill_tier as enum ('beginner', 'intermediate', 'advanced');
create type user_role as enum ('player', 'drawmaster', 'club_admin');
create type season_state as enum ('registration_open', 'teams_finalized', 'season_active', 'season_complete');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  phone text,
  skill_tier skill_tier not null,
  role user_role not null default 'player',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read all profiles"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  state season_state not null default 'registration_open',
  sheet_count int,
  week_count int,
  created_at timestamptz not null default now()
);

alter table public.seasons enable row level security;

create policy "Anyone can read seasons"
  on public.seasons for select using (true);

create policy "Drawmasters can manage seasons"
  on public.seasons for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('drawmaster', 'club_admin')
    )
  );

create table public.league_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  season_id uuid references public.seasons on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, season_id)
);

alter table public.league_registrations enable row level security;

create policy "Users can read all registrations"
  on public.league_registrations for select using (true);

create policy "Users can manage their own registration"
  on public.league_registrations for all using (auth.uid() = user_id);

create table public.teammate_preferences (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references public.profiles on delete cascade not null,
  preferred_user_id uuid references public.profiles on delete cascade not null,
  season_id uuid references public.seasons on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (from_user_id, preferred_user_id, season_id),
  check (from_user_id != preferred_user_id)
);

alter table public.teammate_preferences enable row level security;

create policy "Users can read all teammate preferences"
  on public.teammate_preferences for select using (true);

create policy "Users can manage their own preferences"
  on public.teammate_preferences for all using (auth.uid() = from_user_id);

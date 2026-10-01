create table if not exists public.mood_checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  mood text not null check (mood in ('great','good','okay','worried','sad','stressed','heavy')),
  factor text check (factor is null or factor in ('study','family','friends','sleep','health','relationships','other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, checkin_date)
);

alter table public.mood_checkins enable row level security;
drop policy if exists "Users can read own mood checkins" on public.mood_checkins;
create policy "Users can read own mood checkins"
  on public.mood_checkins for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "Users can create own mood checkins" on public.mood_checkins;
create policy "Users can create own mood checkins"
  on public.mood_checkins for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "Users can update own mood checkins" on public.mood_checkins;
create policy "Users can update own mood checkins"
  on public.mood_checkins for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users can delete own mood checkins" on public.mood_checkins;
create policy "Users can delete own mood checkins"
  on public.mood_checkins for delete to authenticated
  using (user_id = auth.uid());

create index if not exists mood_checkins_user_date_idx
  on public.mood_checkins (user_id, checkin_date desc);

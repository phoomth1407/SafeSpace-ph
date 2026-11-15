-- Store user-controlled account identity and keep named Community content in sync.
alter table public.users
  add column if not exists username text,
  add column if not exists username_changed_at timestamptz;

-- Keep date of birth outside the admin-readable public.users profile table.
create table if not exists private.user_birthdates (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date not null,
  birth_date_changed_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table private.user_birthdates enable row level security;
revoke all on table private.user_birthdates from public, anon, authenticated;

-- Give existing accounts a stable username before enforcing uniqueness.
update public.users
set username = coalesce(
  nullif(left(regexp_replace(lower(split_part(coalesce(email, ''), '@', 1)), '[^a-z0-9_]', '', 'g'), 13), ''),
  'member'
) || '_' || substr(replace(id::text, '-', ''), 1, 6)
where username is null or btrim(username) = '';

alter table public.users alter column username set not null;
create unique index if not exists users_username_ci_unique on public.users (lower(username));
alter table public.users drop constraint if exists users_username_format;
alter table public.users add constraint users_username_format
  check (username ~ '^[A-Za-z0-9_]{3,20}$');

-- Prevent direct table updates from bypassing the profile RPC's cooldowns.
revoke update on table public.users from authenticated;

-- The auth.users profile bootstrap may omit fields added by this migration.
create or replace function private.ensure_user_username()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.username is null or btrim(new.username) = '' then
    new.username := coalesce(
      nullif(left(regexp_replace(lower(split_part(coalesce(new.email, ''), '@', 1)), '[^a-z0-9_]', '', 'g'), 13), ''),
      'member'
    ) || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  return new;
end;
$$;
revoke all on function private.ensure_user_username() from public, anon, authenticated;
drop trigger if exists users_ensure_username on public.users;
create trigger users_ensure_username before insert on public.users
for each row execute function private.ensure_user_username();

-- The RPC is the only client path for setting DOB/username. It verifies ownership,
-- validates both values, enforces change intervals, and refreshes named history.
create or replace function public.save_my_profile(p_username text, p_birth_date date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.users%rowtype;
  v_birthdate private.user_birthdates%rowtype;
  v_has_birthdate boolean := false;
  v_username text := btrim(coalesce(p_username, ''));
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if v_username !~ '^[A-Za-z0-9_]{3,20}$' then
    raise exception using errcode = '22023', message = 'Username must be 3–20 letters, numbers, or underscores.';
  end if;
  if p_birth_date is null or p_birth_date > current_date
     or age(current_date, p_birth_date) < interval '13 years'
     or age(current_date, p_birth_date) > interval '120 years' then
    raise exception using errcode = '22023', message = 'A valid birthdate for an account age of 13–120 is required.';
  end if;

  select * into v_profile from public.users where id = v_user_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Account profile not found.';
  end if;

  if v_profile.username is distinct from v_username
     and v_profile.username_changed_at is not null
     and v_profile.username_changed_at > now() - interval '30 days' then
    raise exception using errcode = '22023', message = 'Username can only be changed once every 30 days.';
  end if;
  select * into v_birthdate from private.user_birthdates where user_id = v_user_id for update;
  v_has_birthdate := found;
  if v_has_birthdate and v_birthdate.birth_date is distinct from p_birth_date
     and v_birthdate.birth_date_changed_at is not null
     and v_birthdate.birth_date_changed_at > now() - interval '365 days' then
    raise exception using errcode = '22023', message = 'Birthdate can only be changed once every 365 days.';
  end if;
  if exists (select 1 from public.users where lower(username) = lower(v_username) and id <> v_user_id) then
    raise exception using errcode = '23505', message = 'That username is already taken.';
  end if;

  update public.users
  set username = v_username,
      username_changed_at = case when username is distinct from v_username then now() else username_changed_at end,
      updated_date = now()
  where id = v_user_id
  returning * into v_profile;

  insert into private.user_birthdates as stored (user_id, birth_date, birth_date_changed_at, updated_at)
  values (
    v_user_id,
    p_birth_date,
    case when not v_has_birthdate or v_birthdate.birth_date is distinct from p_birth_date then now() else v_birthdate.birth_date_changed_at end,
    now()
  )
  on conflict (user_id) do update
  set birth_date = excluded.birth_date,
      birth_date_changed_at = case when stored.birth_date is distinct from excluded.birth_date then now() else stored.birth_date_changed_at end,
      updated_at = now();

  update public.community_posts
  set author_name = v_profile.username
  where created_by_id = v_user_id::text
    and lower(coalesce(author_name, '')) <> 'anonymous'
    and is_announcement = false;
  update public.community_comments
  set author_name = v_profile.username
  where created_by_id = v_user_id::text
    and lower(coalesce(author_name, '')) <> 'anonymous';

  return;
end;
$$;

revoke all on function public.save_my_profile(text, date) from public, anon;
grant execute on function public.save_my_profile(text, date) to authenticated;

-- The signed-in owner can read only their own DOB; the admin user list cannot.
create or replace function public.get_my_private_profile()
returns table(birth_date date, birth_date_changed_at timestamptz)
language sql
security definer
set search_path = ''
as $$
  select detail.birth_date, detail.birth_date_changed_at
  from private.user_birthdates as detail
  where detail.user_id = auth.uid();
$$;
revoke all on function public.get_my_private_profile() from public, anon;
grant execute on function public.get_my_private_profile() to authenticated;

-- Never accept a caller-supplied display name for named Community content.
create or replace function private.apply_community_username()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
begin
  select username into v_username
  from public.users where id = auth.uid();
  if v_username is null or not exists (
    select 1 from private.user_birthdates where user_id = auth.uid()
  ) then
    raise exception using errcode = '42501', message = 'Complete your account profile before posting or commenting.';
  end if;
  if tg_table_name = 'community_posts'
     and coalesce((pg_catalog.to_jsonb(new) ->> 'is_announcement')::boolean, false) then
    return new;
  end if;
  if lower(btrim(coalesce(new.author_name, ''))) = 'anonymous' then
    new.author_name := 'anonymous';
    return new;
  end if;
  new.author_name := v_username;
  return new;
end;
$$;

revoke all on function private.apply_community_username() from public, anon, authenticated;
drop trigger if exists community_posts_apply_username on public.community_posts;
create trigger community_posts_apply_username
before insert on public.community_posts
for each row execute function private.apply_community_username();
drop trigger if exists community_comments_apply_username on public.community_comments;
create trigger community_comments_apply_username
before insert on public.community_comments
for each row execute function private.apply_community_username();

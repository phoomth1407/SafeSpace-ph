-- Let signed-in users postpone their profile while still posting anonymously.
-- Named Community posts and comments remain blocked until a private birthdate exists.
create or replace function private.apply_community_username()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_username text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;

  select username into v_username
  from public.users where id = v_user_id;
  if v_username is null then
    raise exception using errcode = '42501', message = 'Account profile not found.';
  end if;

  if tg_table_name = 'community_posts'
     and coalesce((pg_catalog.to_jsonb(new) ->> 'is_announcement')::boolean, false) then
    return new;
  end if;

  if lower(btrim(coalesce(new.author_name, ''))) = 'anonymous' then
    new.author_name := 'anonymous';
    return new;
  end if;

  if not exists (
    select 1 from private.user_birthdates where user_id = v_user_id
  ) then
    raise exception using errcode = '42501', message = 'Complete your account profile before posting with a username.';
  end if;

  new.author_name := v_username;
  return new;
end;
$$;

revoke all on function private.apply_community_username() from public, anon, authenticated;


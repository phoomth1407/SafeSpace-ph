-- Enforce Community post creation through server-side RPCs.
-- Normal users use create_community_post, which atomically enforces
-- 2 successful non-announcement posts per rolling 30-minute window.
-- Admin announcements use create_community_announcement.
-- Direct INSERT access is revoked so the rolling limit cannot be bypassed
-- through the Supabase Data API.

create or replace function public.create_community_announcement(
  p_content text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_post public.community_posts%rowtype;
begin
  if v_user is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;

  select role into v_role
  from public.users
  where id = v_user;

  if v_role <> 'admin' then
    raise exception using errcode = '42501', message = 'admin required';
  end if;

  if p_content is null or length(btrim(p_content)) < 5 then
    raise exception using errcode = '22023', message = 'Content must be at least 5 characters.';
  end if;

  if length(p_content) > 10000 then
    raise exception using errcode = '22023', message = 'Content is too long.';
  end if;

  insert into public.community_posts (
    id, created_by_id, author_name, content, category, ai_response,
    ai_risk_flag, ai_enabled, is_announcement, hearts, bumps, hearted_by, bumped_by
  )
  values (
    gen_random_uuid()::text,
    v_user::text,
    'Admin',
    btrim(p_content),
    'other',
    '',
    'safe',
    false,
    true,
    0,
    0,
    '[]'::jsonb,
    '[]'::jsonb
  )
  returning * into v_post;

  return jsonb_build_object('allowed', true, 'post', to_jsonb(v_post));
end;
$function$;

revoke all on function public.create_community_announcement(text) from public;
revoke all on function public.create_community_announcement(text) from anon;
grant execute on function public.create_community_announcement(text) to authenticated;

revoke insert on table public.community_posts from authenticated;

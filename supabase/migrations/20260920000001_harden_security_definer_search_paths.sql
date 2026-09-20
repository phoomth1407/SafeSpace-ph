-- Harden the two SECURITY DEFINER RPCs that are intentionally exposed to authenticated users.
-- They need SECURITY DEFINER because they write protected tables after the Data API
-- INSERT grants were removed. Pin the search_path to prevent caller-controlled
-- objects from being resolved with the function owner's privileges.
-- Supabase recommends SECURITY INVOKER by default and an empty search_path when
-- SECURITY DEFINER is required.

create or replace function public.consume_rate_limit(
  p_endpoint text,
  p_window_seconds integer default 60,
  p_max_requests integer default 5
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_window timestamptz;
  v_count integer;
begin
  if v_user is null then
    return false;
  end if;

  if p_window_seconds < 1 or p_window_seconds > 3600 or p_max_requests < 1 or p_max_requests > 100 then
    return false;
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into public.edge_rate_limits(user_id, endpoint, window_start, request_count)
  values (v_user, left(p_endpoint, 100), v_window, 1)
  on conflict (user_id, endpoint, window_start)
  do update set request_count = public.edge_rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$function$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
revoke all on function public.consume_rate_limit(text, integer, integer) from anon;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;


create or replace function public.create_community_post(
  p_author_name text,
  p_content text,
  p_category text,
  p_ai_response text,
  p_ai_risk_flag text,
  p_ai_enabled boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_recent_count integer := 0;
  v_oldest timestamptz;
  v_post public.community_posts%rowtype;
begin
  if v_user is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;

  if p_content is null or length(btrim(p_content)) < 10 then
    raise exception using errcode = '22023', message = 'Content must be at least 10 characters.';
  end if;

  if length(p_content) > 10000 then
    raise exception using errcode = '22023', message = 'Content is too long.';
  end if;

  if p_author_name is not null and length(p_author_name) > 100 then
    raise exception using errcode = '22023', message = 'Author name is too long.';
  end if;

  if p_category is not null and length(p_category) > 100 then
    raise exception using errcode = '22023', message = 'Category is too long.';
  end if;

  if p_ai_response is not null and length(p_ai_response) > 10000 then
    raise exception using errcode = '22023', message = 'AI response is too long.';
  end if;

  if p_ai_risk_flag is null or p_ai_risk_flag not in ('safe', 'moderate', 'high') then
    raise exception using errcode = '22023', message = 'Invalid AI risk flag.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  select count(*)::integer, min(created_date)
    into v_recent_count, v_oldest
  from public.community_posts
  where created_by_id = v_user::text
    and created_date > now() - interval '30 minutes';

  if v_recent_count >= 2 then
    return jsonb_build_object(
      'allowed', false,
      'post_count', v_recent_count,
      'next_allowed_at', v_oldest + interval '30 minutes'
    );
  end if;

  insert into public.community_posts (
    id, created_by_id, author_name, content, category, ai_response,
    ai_risk_flag, ai_enabled, is_announcement, hearts, bumps, hearted_by, bumped_by
  )
  values (
    gen_random_uuid()::text,
    v_user::text,
    coalesce(nullif(btrim(p_author_name), ''), 'anonymous'),
    btrim(p_content),
    coalesce(nullif(btrim(p_category), ''), 'other'),
    p_ai_response,
    p_ai_risk_flag,
    coalesce(p_ai_enabled, true),
    false,
    0,
    0,
    '[]'::jsonb,
    '[]'::jsonb
  )
  returning * into v_post;

  return jsonb_build_object(
    'allowed', true,
    'post_count', v_recent_count + 1,
    'next_allowed_at', null,
    'post', to_jsonb(v_post)
  );
end;
$function$;

revoke all on function public.create_community_post(text, text, text, text, text, boolean) from public;
revoke all on function public.create_community_post(text, text, text, text, text, boolean) from anon;
grant execute on function public.create_community_post(text, text, text, text, text, boolean) to authenticated;

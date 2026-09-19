-- Per-account community post limiter: 2 successful posts in a rolling 30-minute window.
-- Comments are intentionally unaffected. The tester account is exempt by email.
-- The check and insert happen in one transaction to prevent concurrent-click races.

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
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_recent_count integer := 0;
  v_oldest timestamptz;
  v_post public.community_posts%rowtype;
  v_is_tester boolean := false;
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

  select lower(email) into v_email from auth.users where id = v_user;
  v_is_tester := v_email = 'phoomth1407@gmail.com';

  if not v_is_tester then
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
    false, 0, 0, '[]'::jsonb, '[]'::jsonb
  )
  returning * into v_post;

  return jsonb_build_object(
    'allowed', true,
    'post_count', case when v_is_tester then 0 else v_recent_count + 1 end,
    'next_allowed_at', null,
    'post', to_jsonb(v_post)
  );
end;
$function$;

revoke all on function public.create_community_post(text, text, text, text, text, boolean) from public;
revoke all on function public.create_community_post(text, text, text, text, text, boolean) from anon;
grant execute on function public.create_community_post(text, text, text, text, text, boolean) to authenticated;

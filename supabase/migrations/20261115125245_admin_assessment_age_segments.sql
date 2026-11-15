create or replace function public.admin_list_shared_assessments_with_segments()
returns table(
  id text,
  created_date timestamptz,
  created_by_id text,
  risk_level text,
  risk_score numeric,
  screening_type text,
  analysis_source text,
  language text,
  age_13_19 boolean,
  age_19_plus boolean,
  is_foreigner boolean
)
language sql
security definer
set search_path = ''
as $$
  select
    a.id,
    a.created_date,
    a.created_by_id,
    a.risk_level,
    a.risk_score,
    a.screening_type,
    a.analysis_source,
    a.language,
    coalesce(a.age between 13 and 19, false),
    coalesce(a.age >= 19, false),
    coalesce(a.nationality = 'foreigner', false)
  from public.assessments as a
  where private.is_admin()
    and a.share_with_admin = true
    and exists (
      select 1
      from public.assessment_sharing_preferences as p
      where p.user_id::text = a.created_by_id
        and p.share_risk_score = true
    )
  order by a.created_date desc
  limit 200;
$$;

revoke all on function public.admin_list_shared_assessments_with_segments() from public, anon;
grant execute on function public.admin_list_shared_assessments_with_segments() to authenticated;

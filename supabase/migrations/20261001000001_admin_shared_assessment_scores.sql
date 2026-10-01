create or replace function public.admin_list_shared_assessments()
returns table(id text, created_date timestamptz, created_by_id text, risk_level text, risk_score numeric, screening_type text, analysis_source text, language text)
language sql security definer set search_path = public as $$
  select a.id, a.created_date, a.created_by_id, a.risk_level, a.risk_score, a.screening_type, a.analysis_source, a.language
  from public.assessments a
  where private.is_admin() and a.share_with_admin = true
    and exists (select 1 from public.assessment_sharing_preferences p where p.user_id::text = a.created_by_id and p.share_risk_score = true)
  order by a.created_date desc limit 200;
$$;
revoke all on function public.admin_list_shared_assessments() from public, anon;
grant execute on function public.admin_list_shared_assessments() to authenticated;

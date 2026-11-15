-- Apply a user's sharing choice atomically without granting client access to assessment rows.
create or replace function public.set_my_assessment_sharing(p_share_risk_score boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if p_share_risk_score is null then
    raise exception using errcode = '22023', message = 'A sharing choice is required.';
  end if;

  insert into public.assessment_sharing_preferences as preference (user_id, share_risk_score, updated_at)
  values (v_user_id, p_share_risk_score, now())
  on conflict (user_id) do update
  set share_risk_score = excluded.share_risk_score,
      updated_at = now();

  update public.assessments
  set share_with_admin = p_share_risk_score
  where created_by_id = v_user_id::text
    and share_with_admin is distinct from p_share_risk_score;
end;
$$;

revoke all on function public.set_my_assessment_sharing(boolean) from public, anon;
grant execute on function public.set_my_assessment_sharing(boolean) to authenticated;


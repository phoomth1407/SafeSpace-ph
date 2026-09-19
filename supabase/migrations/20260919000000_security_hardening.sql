-- SafeSpace security hardening
-- Keep this migration in source control so production and future environments match.

revoke all on table public.assessments from anon;
revoke all on table public.guest_assessments from anon;
revoke all on table public.reports from anon;
revoke all on table public.contact_requests from anon;
revoke all on table public.users from anon;

grant select, insert, update, delete on table public.assessments to authenticated;
grant select, update, delete on table public.guest_assessments to authenticated;
grant select, insert, update, delete on table public.reports to authenticated;
grant insert, select, update, delete on table public.contact_requests to authenticated;
grant select, update on table public.users to authenticated;

grant select on table public.community_posts to anon, authenticated;
grant select, insert, update, delete on table public.community_posts to authenticated;
grant select on table public.community_comments to anon, authenticated;
grant select, insert, update, delete on table public.community_comments to authenticated;
grant select on table public.emergency_resources to anon, authenticated;

drop policy if exists contact_requests_create on public.contact_requests;
create policy contact_requests_create
  on public.contact_requests
  for insert
  to authenticated
  with check (created_by_id = (select auth.uid())::text);

alter table public.assessments
  drop constraint if exists assessments_age_range;
alter table public.assessments
  add constraint assessments_age_range
  check (age is null or (age >= 1 and age <= 120));

alter table public.assessments
  drop constraint if exists assessments_risk_score_range;
alter table public.assessments
  add constraint assessments_risk_score_range
  check (risk_score is null or (risk_score >= 0 and risk_score <= 100));

alter table public.guest_assessments
  drop constraint if exists guest_assessments_age_range;
alter table public.guest_assessments
  add constraint guest_assessments_age_range
  check (age is null or (age >= 1 and age <= 120));

alter function private.is_admin() set search_path = pg_catalog, auth, private;

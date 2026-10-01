alter table public.assessments add column if not exists share_with_admin boolean not null default false;
create table if not exists public.assessment_sharing_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  share_risk_score boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.assessment_sharing_preferences enable row level security;
drop policy if exists "Users can read own assessment sharing preference" on public.assessment_sharing_preferences;
create policy "Users can read own assessment sharing preference" on public.assessment_sharing_preferences for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users can insert own assessment sharing preference" on public.assessment_sharing_preferences;
create policy "Users can insert own assessment sharing preference" on public.assessment_sharing_preferences for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users can update own assessment sharing preference" on public.assessment_sharing_preferences;
create policy "Users can update own assessment sharing preference" on public.assessment_sharing_preferences for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create or replace function public.set_assessment_sharing_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists assessment_sharing_preferences_updated_at on public.assessment_sharing_preferences;
create trigger assessment_sharing_preferences_updated_at before update on public.assessment_sharing_preferences for each row execute function public.set_assessment_sharing_updated_at();
create or replace function public.initialize_assessment_sharing_preference()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.assessment_sharing_preferences(user_id, share_risk_score)
  values (new.id, false) on conflict (user_id) do nothing;
  return new;
end; $$;
drop trigger if exists initialize_assessment_sharing_preference on auth.users;
create trigger initialize_assessment_sharing_preference after insert on auth.users for each row execute function public.initialize_assessment_sharing_preference();
create or replace function public.sync_assessment_share_choice()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.created_by_id is not null then
    select coalesce(share_risk_score, false) into new.share_with_admin
    from public.assessment_sharing_preferences where user_id::text = new.created_by_id;
    new.share_with_admin := coalesce(new.share_with_admin, false) and coalesce(new.share_with_admin, false);
    if not found then new.share_with_admin := false; end if;
  else new.share_with_admin := false; end if;
  return new;
end; $$;
drop trigger if exists assessments_sync_share_choice on public.assessments;
create trigger assessments_sync_share_choice before insert or update of share_with_admin, created_by_id on public.assessments for each row execute function public.sync_assessment_share_choice();
drop policy if exists assessments_read on public.assessments;
create policy assessments_read on public.assessments for select to authenticated
using ((created_by_id = auth.uid()::text) or (private.is_admin() and share_with_admin = true));

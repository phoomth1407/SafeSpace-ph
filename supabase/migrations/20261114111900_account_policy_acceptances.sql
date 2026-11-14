create table if not exists public.user_policy_acceptances (
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_key text not null check (policy_key in ('community', 'assessment')),
  policy_version text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, policy_key)
);

alter table public.user_policy_acceptances enable row level security;
revoke all on table public.user_policy_acceptances from anon, authenticated, public;
grant select, insert, update on table public.user_policy_acceptances to authenticated;

drop policy if exists "Users read own policy acceptances" on public.user_policy_acceptances;
create policy "Users read own policy acceptances"
  on public.user_policy_acceptances for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users create own policy acceptances" on public.user_policy_acceptances;
create policy "Users create own policy acceptances"
  on public.user_policy_acceptances for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own policy acceptances" on public.user_policy_acceptances;
create policy "Users update own policy acceptances"
  on public.user_policy_acceptances for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

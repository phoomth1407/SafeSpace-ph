create table if not exists public.guest_score_shares (
  id uuid primary key default gen_random_uuid(),
  risk_score integer not null check (risk_score between 0 and 100),
  risk_level text not null check (risk_level in ('low','moderate','high','severe')),
  language text not null default 'th' check (language in ('th','en')),
  claim_token_hash text not null unique check (length(claim_token_hash) = 64),
  claimed_by uuid references auth.users(id) on delete cascade,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint guest_score_claim_state check ((claimed_by is null and claimed_at is null) or (claimed_by is not null and claimed_at is not null))
);
alter table public.guest_score_shares enable row level security;
revoke all on table public.guest_score_shares from anon, authenticated;
grant all on table public.guest_score_shares to service_role;

create or replace function public.claim_guest_score(p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or p_token_hash is null or length(p_token_hash) <> 64 or p_token_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;
  update public.guest_score_shares
     set claimed_by = auth.uid(), claimed_at = now()
   where claim_token_hash = p_token_hash and claimed_by is null and claimed_at is null;
  return found;
end;
$$;
revoke all on function public.claim_guest_score(text) from public, anon;
grant execute on function public.claim_guest_score(text) to authenticated;
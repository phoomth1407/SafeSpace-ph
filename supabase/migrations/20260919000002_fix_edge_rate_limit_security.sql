drop function if exists public.consume_rate_limit(text, integer, integer);

drop policy if exists edge_rate_limits_insert_own on public.edge_rate_limits;
drop policy if exists edge_rate_limits_update_own on public.edge_rate_limits;

create policy edge_rate_limits_insert_own
  on public.edge_rate_limits
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy edge_rate_limits_update_own
  on public.edge_rate_limits
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant insert, update on table public.edge_rate_limits to authenticated;

create or replace function public.consume_rate_limit(
  p_endpoint text,
  p_window_seconds integer default 60,
  p_max_requests integer default 5
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public, auth
as $$
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

  v_window := to_timestamp(floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds);

  insert into public.edge_rate_limits(user_id, endpoint, window_start, request_count)
  values (v_user, left(p_endpoint, 100), v_window, 1)
  on conflict (user_id, endpoint, window_start)
  do update set request_count = public.edge_rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;

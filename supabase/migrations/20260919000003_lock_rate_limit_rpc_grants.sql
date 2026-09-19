-- Keep the rate-limit RPC callable only by signed-in users.
revoke execute on function public.consume_rate_limit(text, integer, integer) from anon;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;


-- Keep the RPC able to atomically update its protected counter table while still rejecting unauthenticated callers.
alter function public.consume_rate_limit(text, integer, integer)
  security definer
  set search_path = pg_catalog, public, auth;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
revoke all on function public.consume_rate_limit(text, integer, integer) from anon;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;

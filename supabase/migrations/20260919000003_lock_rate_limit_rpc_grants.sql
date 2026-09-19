-- Keep the rate-limit RPC callable only by signed-in users.
revoke execute on function public.consume_rate_limit(text, integer, integer) from anon;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;

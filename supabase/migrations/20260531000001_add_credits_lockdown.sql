-- SECURITY (critical): add_credits is security-definer, so PostgREST exposes it at
-- POST /rest/v1/rpc/add_credits and the default EXECUTE-to-PUBLIC grant let anon /
-- authenticated callers grant arbitrary credits to any user_id (free unlimited
-- credits, bypassing the paywall). Restrict execution to the service role — the
-- Stripe webhook (service-role key) is the only legitimate caller — and clamp the
-- amount as a backstop.

create or replace function public.add_credits(p_user_id uuid, p_credits int)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set quota_total = quota_total + p_credits
  where user_id = p_user_id and p_credits > 0 and p_credits <= 500;
$$;

revoke execute on function public.add_credits(uuid, int) from public;
revoke execute on function public.add_credits(uuid, int) from anon;
revoke execute on function public.add_credits(uuid, int) from authenticated;
grant execute on function public.add_credits(uuid, int) to service_role;

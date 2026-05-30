-- Phase 4: add_credits — atomically grant candidature credits on a pack purchase.
-- Credit packs accumulate into quota_total (credits never expire); the free tier
-- starts at quota_total = 3. Mirrors consume_quota (security definer, empty search_path).
create or replace function public.add_credits(p_user_id uuid, p_credits int)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set quota_total = quota_total + p_credits where user_id = p_user_id;
$$;

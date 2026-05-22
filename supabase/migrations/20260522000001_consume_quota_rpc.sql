-- Atomic single-slot quota consumption. Returns true if consumed.
create or replace function public.consume_quota(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated int;
begin
  update public.profiles
    set quota_used = quota_used + 1
    where user_id = p_user_id and quota_used < quota_total;
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;

revoke all on function public.consume_quota(uuid) from public, anon;
grant execute on function public.consume_quota(uuid) to service_role;

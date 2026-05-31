-- Phase 4 H1/M2: make pack credit grants idempotent per Stripe session.
--
-- H1 (critical): the webhook deduped on billing_events row-existence, recorded
-- BEFORE the grant ran. A grant that threw/crashed after the insert was swallowed
-- as a duplicate on Stripe's retry -> paid user, zero credits, permanently. We
-- now record the grant in a ledger keyed by the Stripe session id and only
-- increment quota when the ledger insert is new, so a retry is a safe no-op and a
-- recorded-but-ungranted event re-runs cleanly.
--
-- M2: raise on an invalid amount and on a missing profile (was a silent no-op).
-- Safe now that the webhook re-runs unprocessed events instead of swallowing them.

create table if not exists public.credit_grants (
  stripe_session_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  credits int not null,
  created_at timestamptz not null default now()
);

-- Only the security-definer add_credits function (runs as owner, bypasses RLS)
-- writes here; enabling RLS with no policy denies all direct anon/authenticated
-- access via PostgREST.
alter table public.credit_grants enable row level security;

-- Drop the old 2-arg overload so the only remaining surface is the 3-arg,
-- session-keyed function. (create or replace with a new signature would add an
-- overload, not replace it, leaving the 2-arg version callable.)
drop function if exists public.add_credits(uuid, int);

create or replace function public.add_credits(p_user_id uuid, p_credits int, p_session_id text)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted int;
  v_updated int;
begin
  if p_credits <= 0 or p_credits > 500 then
    raise exception 'add_credits: invalid credit amount %', p_credits;
  end if;

  insert into public.credit_grants (stripe_session_id, user_id, credits)
  values (p_session_id, p_user_id, p_credits)
  on conflict (stripe_session_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return 0; -- this session was already credited; idempotent no-op
  end if;

  update public.profiles set quota_total = quota_total + p_credits
  where user_id = p_user_id;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'add_credits: no profile for user %', p_user_id;
  end if;

  return p_credits;
end;
$$;

revoke execute on function public.add_credits(uuid, int, text) from public;
revoke execute on function public.add_credits(uuid, int, text) from anon;
revoke execute on function public.add_credits(uuid, int, text) from authenticated;
grant execute on function public.add_credits(uuid, int, text) to service_role;

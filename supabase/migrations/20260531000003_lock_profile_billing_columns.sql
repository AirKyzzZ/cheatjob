-- SECURITY (critical): profiles_update_own RLS allows the row owner to update ANY
-- column, and Supabase grants UPDATE on public tables to `authenticated` by
-- default. So any logged-in user could PATCH /rest/v1/profiles their own
-- quota_total to anything (confirmed: a test user set quota_total 3 -> 99999),
-- bypassing the paywall entirely — the same class of bug as the anon add_credits
-- exposure, but straight through the table. The add_credits lockdown is moot
-- without this.
--
-- Block client roles from mutating billing/plan columns via a BEFORE UPDATE
-- trigger. SECURITY INVOKER (the default) so current_user is the real caller:
-- PostgREST requests run as `authenticated`/`anon`; the service-role webhook runs
-- as `service_role`; the security-definer RPCs (add_credits/consume_quota) run as
-- their owner. Only the first two are restricted, so legitimate balance writes
-- keep working. NOTE: any NEW billing column added to profiles must be added here.

create or replace function public.tg_guard_profile_billing_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.quota_total          is distinct from old.quota_total
    or new.quota_used           is distinct from old.quota_used
    or new.quota_resets_at      is distinct from old.quota_resets_at
    or new.current_plan         is distinct from old.current_plan
    or new.plan_started_at      is distinct from old.plan_started_at
    or new.plan_ends_at         is distinct from old.plan_ends_at
    or new.stripe_customer_id   is distinct from old.stripe_customer_id
    or new.stripe_subscription_id is distinct from old.stripe_subscription_id then
      raise exception 'profiles: billing columns are not user-writable';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_billing_columns on public.profiles;
create trigger profiles_guard_billing_columns
  before update on public.profiles
  for each row execute function public.tg_guard_profile_billing_columns();

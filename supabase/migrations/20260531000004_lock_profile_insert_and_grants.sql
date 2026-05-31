-- SECURITY (defense in depth, follows ...000003): the BEFORE UPDATE guard closes
-- the UPDATE path, but profiles_insert_self had no column restriction and the
-- guard is UPDATE-only — so a client INSERT could seed an inflated quota_total.
-- Not reachable today (the SECURITY DEFINER signup trigger creates the row
-- in-transaction with quota_total = 3, and there is no DELETE policy on
-- profiles), but it's a landmine for any future account-delete / GDPR-erasure
-- flow. The app never client-inserts profiles (only the signup trigger, which
-- runs as owner and bypasses these grants), so drop the client INSERT surface
-- and pin client UPDATE to the self-service columns as a privilege-layer backstop
-- to the trigger. Billing columns (quota_*, current_plan, plan_*, stripe_*) are
-- intentionally absent from the grant, so a client UPDATE touching them is
-- rejected at the privilege layer before RLS or the trigger.

drop policy if exists "profiles_insert_self" on public.profiles;
revoke insert on public.profiles from anon, authenticated;

revoke update on public.profiles from anon, authenticated;
grant update (
  full_name, school, study_level, field_of_study,
  target_contract_types, target_role_keywords, about_me,
  cv_storage_path, cv_extracted, cv_uploaded_at, locale, onboarded_at
) on public.profiles to authenticated;

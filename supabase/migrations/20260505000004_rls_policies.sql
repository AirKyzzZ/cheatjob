-- Row Level Security policies. Every table is RLS-enabled from migration 1.

-- profiles: every authenticated user can read/write only their own row.
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- waitlist_entries: anonymous inserts allowed (the landing form is public).
-- No select/update/delete policies = service_role-only read access for the
-- founder dashboard or migration tooling.
alter table public.waitlist_entries enable row level security;

create policy "waitlist_anonymous_insert" on public.waitlist_entries
  for insert with check (true);

-- billing_events: locked. Only service_role (webhook handler) ever touches it.
alter table public.billing_events enable row level security;
-- intentionally no policies for authenticated users

-- Onboarding completion sentinel. Layout gate checks IS NOT NULL.
alter table public.profiles
  add column onboarded_at timestamptz;

-- Auto-create profile row on auth.users insert so onboarding always upserts an
-- existing row rather than inserting (simplifies action logic + race-free).
create or replace function public.tg_create_profile_on_signup()
returns trigger as $$
begin
  insert into public.profiles (user_id, locale, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'locale', 'fr'),
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger create_profile_on_signup
  after insert on auth.users
  for each row execute function public.tg_create_profile_on_signup();

-- Per-user profile, extends auth.users with app-specific identity + plan state.
-- Plan columns are placeholders; real plan rules are wired in Phase 4.

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  school text,
  study_level text check (study_level in ('L3','M1','M2','BTS2','DUT2','other') or study_level is null),
  field_of_study text,
  target_contract_types text[] default array[]::text[],
  target_role_keywords text[] default array[]::text[],
  about_me text,
  cv_storage_path text,
  cv_extracted jsonb,
  cv_uploaded_at timestamptz,
  current_plan text check (current_plan in ('free','sprint','mois','vie') or current_plan is null),
  plan_started_at timestamptz,
  plan_ends_at timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  quota_total int not null default 0,
  quota_used int not null default 0,
  quota_resets_at timestamptz,
  locale text not null default 'fr' check (locale in ('fr','en','es','de')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_locale_idx on public.profiles (locale);

-- Auto-update updated_at
create or replace function public.tg_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- Phase 1b: cold-outreach core tables + free-tier quota activation.

-- 1. candidatures -----------------------------------------------------------
create table public.candidatures (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  company_name             text not null,
  company_website          text,
  company_domain           text,
  target_role              text,
  manager_first_name       text,
  manager_last_name        text,
  manager_role             text,
  manager_linkedin_url     text,
  manager_email            text,
  manager_email_confidence text check (manager_email_confidence in
                             ('high','medium','low','not_found','manual')),
  manager_email_provider   text check (manager_email_provider in ('findymail','manual')),
  offer_url                text,
  offer_text               text,
  status                   text not null default 'draft'
                             check (status in ('draft','ready','sent','replied','closed')),
  wizard_step              int  not null default 1 check (wizard_step between 1 and 5),
  sent_at                  timestamptz,
  replied_at               timestamptz,
  closed_at                timestamptz,
  closed_reason            text check (closed_reason in ('won','rejected','gave_up','other')),
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index candidatures_user_status_idx  on public.candidatures (user_id, status);
create index candidatures_user_created_idx on public.candidatures (user_id, created_at desc);

create trigger candidatures_set_updated_at
  before update on public.candidatures
  for each row execute function public.tg_set_updated_at();

-- 2. messages ---------------------------------------------------------------
create table public.messages (
  id                  uuid primary key default gen_random_uuid(),
  candidature_id      uuid not null references public.candidatures(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  type                text not null default 'initial' check (type in ('initial')),
  subject             text not null,
  body                text not null,
  generated_by_model  text,
  prompt_version      text,
  generation_cost_usd numeric(10,4),
  edited_by_user      bool not null default false,
  user_edited_body    text,
  created_at          timestamptz not null default now()
);

create index messages_candidature_idx on public.messages (candidature_id, created_at desc);

-- 3. email_lookups ----------------------------------------------------------
create table public.email_lookups (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  candidature_id uuid references public.candidatures(id) on delete set null,
  query          jsonb not null,
  result_email   text,
  confidence     text,
  provider       text not null,
  cost_usd       numeric(10,4),
  raw_response   jsonb,
  created_at     timestamptz not null default now()
);

create index email_lookups_user_idx on public.email_lookups (user_id, created_at desc);

-- 4. RLS --------------------------------------------------------------------
alter table public.candidatures  enable row level security;
alter table public.messages      enable row level security;
alter table public.email_lookups enable row level security;

create policy candidatures_select on public.candidatures
  for select using (user_id = (select auth.uid()));
create policy candidatures_insert on public.candidatures
  for insert with check (user_id = (select auth.uid()));
create policy candidatures_update on public.candidatures
  for update using (user_id = (select auth.uid()));
create policy candidatures_delete on public.candidatures
  for delete using (user_id = (select auth.uid()));

create policy messages_select on public.messages
  for select using (user_id = (select auth.uid()));
create policy messages_delete on public.messages
  for delete using (user_id = (select auth.uid()));
-- INSERT/UPDATE: service role only (no policy => denied for anon/authenticated).

create policy email_lookups_select on public.email_lookups
  for select using (user_id = (select auth.uid()));
-- INSERT: service role only.

-- 5. Quota activation -------------------------------------------------------
update public.profiles
  set current_plan = 'free', quota_total = 3
  where current_plan is null;

create or replace function public.tg_create_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, locale, full_name, current_plan, quota_total, quota_used)
  values (
    new.id,
    case
      when new.raw_user_meta_data->>'locale' in ('fr','en','es','de')
        then new.raw_user_meta_data->>'locale'
      else 'fr'
    end,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    'free', 3, 0
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

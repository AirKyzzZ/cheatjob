-- Waitlist captures from the public landing form.
-- Anonymous insert is intentional (RLS policy in 0004); only service_role can read.

create table public.waitlist_entries (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  plan text check (plan in ('sprint','mois','vie') or plan is null),
  source text,
  utm jsonb,
  locale text not null default 'fr' check (locale in ('fr','en','es','de')),
  created_at timestamptz not null default now()
);

create index waitlist_entries_email_idx on public.waitlist_entries (lower(email));
create index waitlist_entries_locale_idx on public.waitlist_entries (locale);
create index waitlist_entries_created_at_idx on public.waitlist_entries (created_at desc);

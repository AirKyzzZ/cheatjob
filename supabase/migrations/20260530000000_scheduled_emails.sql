-- Phase 1c: scheduled_emails — queue for transactional sends (J+7 follow-up reminders).
-- Enqueued by markSent (service role), processed by the daily cron (service role).

create table if not exists public.scheduled_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  candidature_id uuid references public.candidatures (id) on delete cascade,
  kind text not null check (kind in ('follow_up')),
  send_after timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'cancelled', 'failed')),
  attempts int not null default 0,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists scheduled_emails_due_idx
  on public.scheduled_emails (status, send_after);

-- At most one pending follow-up per candidature → markSent enqueue is idempotent at the DB level.
create unique index if not exists scheduled_emails_one_pending_followup_idx
  on public.scheduled_emails (candidature_id, kind)
  where status = 'pending';

alter table public.scheduled_emails enable row level security;

-- Owners may read their own rows; all writes go through the service role (which bypasses RLS).
create policy "scheduled_emails_owner_select"
  on public.scheduled_emails for select
  using (auth.uid() = user_id);

-- Stripe webhook log. Source of truth for billing history.
-- Idempotency key: stripe_event_id (unique). Events are inserted on receipt
-- and marked processed_at after successful business-logic dispatch.

create table public.billing_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_event_id text not null unique,
  stripe_event_type text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text,
  amount_cents int,
  raw_event jsonb not null,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now()
);

create index billing_events_user_id_idx on public.billing_events (user_id);
create index billing_events_stripe_customer_id_idx on public.billing_events (stripe_customer_id);
create index billing_events_unprocessed_idx on public.billing_events (created_at) where processed_at is null;

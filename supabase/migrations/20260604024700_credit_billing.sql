-- Credit balance + billing tables for Stripe integration (MDS-148).
-- Extends existing public.users (which already holds plan_tier, billing_state,
-- stripe_customer_id, stripe_subscription_id, grace_period_ends_at,
-- generation_count_this_month, quota_reset_at) with a credit_balance column,
-- and adds credit_ledger, purchases, stripe_events.

-- 1. Add credit balance to users
alter table public.users
  add column if not exists credit_balance integer not null default 0
    check (credit_balance >= 0);

-- 2. Credit ledger (audit trail; source of truth for credit_balance)
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  delta integer not null check (delta <> 0),
  kind text not null check (kind in ('reserve','commit','release','topup','refund','adjustment')),
  generation_id uuid references public.generations(id) on delete set null,
  stripe_payment_intent_id text,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_created_idx
  on public.credit_ledger (user_id, created_at desc);

create index if not exists credit_ledger_generation_idx
  on public.credit_ledger (generation_id)
  where generation_id is not null;

-- 3. Purchases (mirrors Stripe one-time + subscription invoices for the UI)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_payment_intent_id text unique,
  stripe_invoice_id text,
  kind text not null check (kind in ('credits','subscription')),
  credits integer check (credits is null or credits > 0),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'paid' check (status in ('paid','refunded')),
  hosted_invoice_url text,
  invoice_pdf_url text,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_created_idx
  on public.purchases (user_id, created_at desc);

-- 4. Stripe webhook event dedup
create table if not exists public.stripe_events (
  event_id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- 5. RLS — users can read their own rows; writes only via service role
alter table public.credit_ledger enable row level security;
alter table public.purchases enable row level security;
alter table public.stripe_events enable row level security;

drop policy if exists credit_ledger_select_self on public.credit_ledger;
create policy credit_ledger_select_self on public.credit_ledger
  for select using (auth.uid() = user_id);

drop policy if exists purchases_select_self on public.purchases;
create policy purchases_select_self on public.purchases
  for select using (auth.uid() = user_id);

-- stripe_events intentionally has no user policies (service-role only)

-- =====================================================================
-- 002 · Payment entitlements
-- Run this in the Supabase SQL editor AFTER 001_initial_schema.sql.
--
-- Creates the wallet-scoped entitlement table used by /api/access/check so a
-- buyer who paid with a wallet keeps access on every device.
--
-- Every statement is idempotent and safe to run on a database where the
-- tables already exist with a slightly different shape.
-- =====================================================================

-- 1. Entitlements: one row per paying wallet
create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  wallet text not null,
  tier text not null default 'all',
  source text not null default 'payment',
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- 2. Make sure the columns the server route writes actually exist
alter table entitlements add column if not exists user_id uuid;
alter table entitlements add column if not exists wallet text;
alter table entitlements add column if not exists tier text not null default 'all';
alter table entitlements add column if not exists source text not null default 'payment';
alter table entitlements add column if not exists created_at timestamptz default now();
alter table entitlements add column if not exists paid_at timestamptz;

-- 3. The wallet is the key: one entitlement per wallet (needed for the
--    upsert used by /api/payments/check)
create unique index if not exists entitlements_wallet_key on entitlements (wallet);

-- 4. The payments table may already exist from an earlier version of the app.
--    Add the columns the payment route writes instead of assuming them.
alter table payments add column if not exists user_id uuid;
alter table payments add column if not exists wallet text;
alter table payments add column if not exists payer_wallet text;
alter table payments add column if not exists reference text;
alter table payments add column if not exists signature text;
alter table payments add column if not exists amount_usdc numeric;
alter table payments add column if not exists status text;
alter table payments add column if not exists paid_at timestamptz;
alter table payments add column if not exists created_at timestamptz default now();

-- 5. Index the lookup path used by /api/access/check
create index if not exists payments_payer_wallet_idx on payments (payer_wallet);
create index if not exists payments_wallet_idx on payments (wallet);
create index if not exists payments_status_idx on payments (status);

-- 6. RLS. Writes are done by the server with the service role key, which
--    bypasses RLS, so no insert policy is needed (and none is created here on
--    purpose: an open insert policy would let anyone mark themselves as paid).
alter table entitlements enable row level security;
alter table payments enable row level security;

drop policy if exists "Users read own entitlements" on entitlements;
create policy "Users read own entitlements" on entitlements
  for select using (auth.uid() = user_id);

drop policy if exists "Users read own payments" on payments;
create policy "Users read own payments" on payments
  for select using (auth.uid() = user_id);

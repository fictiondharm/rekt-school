-- =====================================================================
-- 004 · Linked wallets
-- Run this in the Supabase SQL editor AFTER 003_contact_messages.sql.
--
-- One person can pay from an EVM wallet (Base) while their app "connects"
-- through Solana (Phantom). Linking the two addresses means one payment
-- unlocks both, without letting anyone claim an address they do not control:
-- the server only links after the claimed address proves ownership.
-- =====================================================================

create table if not exists wallet_links (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  linked_wallet text not null,
  created_at timestamptz not null default now(),
  unique (wallet, linked_wallet)
);

create index if not exists wallet_links_wallet_idx on wallet_links (wallet);

-- The browser never reads this table directly; the server uses the service
-- role key, which bypasses RLS.
alter table wallet_links enable row level security;

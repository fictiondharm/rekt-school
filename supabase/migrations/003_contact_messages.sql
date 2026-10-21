-- =====================================================================
-- 003 · Support contact messages
-- Run this in the Supabase SQL editor AFTER 002_payment_entitlements.sql.
-- =====================================================================

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table contact_messages add column if not exists name text;
alter table contact_messages add column if not exists email text;
alter table contact_messages add column if not exists message text;
alter table contact_messages add column if not exists status text not null default 'new';
alter table contact_messages add column if not exists created_at timestamptz not null default now();

create index if not exists contact_messages_status_idx on contact_messages (status);

-- RLS: the browser never reads this table directly. The server route writes
-- with the service role key, which bypasses RLS, and support staff read it
-- from the Supabase dashboard.
alter table contact_messages enable row level security;

-- =====================================================================
-- DeFi Mommy Supabase Schema
-- Phase 2 / Day 3: Profiles, Progress, Invites, Tasks, Faucets, Payments
-- =====================================================================

-- 1. Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  xp int not null default 0,
  streak_days int not null default 0,
  last_active date default current_date
);

-- 2. Wallets
create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  address text not null unique,
  linked_at timestamptz default now()
);

-- 3. Lesson Progress
create table if not exists lesson_progress (
  user_id uuid references profiles(id) on delete cascade,
  lesson_id text not null,
  status text not null check (status in ('locked','in_progress','complete')),
  current_step text,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

-- 4. Step Progress
create table if not exists step_progress (
  user_id uuid references profiles(id) on delete cascade,
  lesson_id text not null,
  step_id text not null,
  completed_at timestamptz default now(),
  primary key (user_id, lesson_id, step_id)
);

-- 5. Task Verifications (Server-verified on-chain transactions)
create table if not exists task_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  task_id text not null,
  signature text not null unique,
  wallet text not null,
  verified_at timestamptz default now()
);

-- 6. Quiz Attempts
create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id text,
  step_id text,
  score int,
  passed boolean,
  answers jsonb,
  created_at timestamptz default now()
);

-- 7. XP Events (Prevents double awarding via unique constraint)
create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  reason text not null,
  ref text,
  amount int not null,
  created_at timestamptz default now(),
  unique (user_id, reason, ref)
);

-- 8. Faucet Claims (Rate-limiting for devnet gas and tokens)
create table if not exists faucet_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  wallet text,
  kind text, -- 'gas' | 'fusdc'
  amount numeric,
  signature text,
  ip inet,
  claimed_at timestamptz default now()
);

-- 9. Invite Codes & Redemptions (06-HACKATHON-OVERRIDE section 3)
create table if not exists invite_codes (
  code text primary key,
  max_uses int not null default 1,
  used_count int not null default 0,
  created_at timestamptz default now()
);

create table if not exists invite_redemptions (
  code text references invite_codes(code) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  redeemed_at timestamptz default now(),
  primary key (code, user_id)
);

-- 10. Payments (Solana USDC reference verification - Day 8)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  reference text not null unique,
  amount_usdc numeric not null default 1.0,
  status text not null check (status in ('pending','paid','expired','manual')),
  signature text unique,
  payer_wallet text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table wallets enable row level security;
alter table lesson_progress enable row level security;
alter table step_progress enable row level security;
alter table task_verifications enable row level security;
alter table quiz_attempts enable row level security;
alter table xp_events enable row level security;
alter table faucet_claims enable row level security;
alter table invite_redemptions enable row level security;
alter table payments enable row level security;

-- Basic RLS Policies (Users can read and update their own records)
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Users read own progress" on lesson_progress for select using (auth.uid() = user_id);
create policy "Users insert own progress" on lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress" on lesson_progress for update using (auth.uid() = user_id);

create policy "Users read own step progress" on step_progress for select using (auth.uid() = user_id);
create policy "Users insert own step progress" on step_progress for insert with check (auth.uid() = user_id);

create policy "Users read own redemptions" on invite_redemptions for select using (auth.uid() = user_id);
create policy "Users read own payments" on payments for select using (auth.uid() = user_id);

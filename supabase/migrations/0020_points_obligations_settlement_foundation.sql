-- XOÀI GO Core Platform — migration 0020
-- Points and merchant obligation/settlement record foundations.
-- No earn/redeem/expiry formula, fee, settlement cadence or payout command is enabled.

begin;

create table public.points_accounts (
  id uuid primary key default gen_random_uuid(),
  member_user_id uuid not null references public.member_profiles(user_id) on delete restrict,
  program_code text not null,
  policy_version_id uuid references public.policy_versions(id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint points_accounts_status_check check (status in ('active','suspended','closed')),
  constraint points_accounts_program_check check (length(trim(program_code))>0),
  constraint points_accounts_member_program_unique unique(member_user_id,program_code)
);

create table public.points_entries (
  id uuid primary key default gen_random_uuid(),
  points_account_id uuid not null references public.points_accounts(id) on delete restrict,
  entry_type text not null,
  points_delta bigint not null,
  source_type text not null,
  source_id text,
  idempotency_key text,
  reason text not null,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references public.profiles(id) on delete restrict,
  reverses_entry_id uuid references public.points_entries(id) on delete restrict,
  constraint points_entries_type_check check (entry_type in ('earn','redeem','expire','adjustment','reversal')),
  constraint points_entries_delta_check check (points_delta<>0),
  constraint points_entries_reason_check check (length(trim(reason))>0),
  constraint points_entries_source_check check (length(trim(source_type))>0),
  constraint points_entries_no_self_reversal check (reverses_entry_id is null or reverses_entry_id<>id)
);
create unique index points_entries_idempotency_idx on public.points_entries(points_account_id,idempotency_key) where idempotency_key is not null;
create unique index points_entries_single_reversal_idx on public.points_entries(reverses_entry_id) where reverses_entry_id is not null;
create index points_entries_account_time_idx on public.points_entries(points_account_id,occurred_at desc);

create table public.points_holds (
  id uuid primary key default gen_random_uuid(),
  points_account_id uuid not null references public.points_accounts(id) on delete restrict,
  source_type text not null,
  source_id text,
  points_amount bigint not null,
  status text not null default 'held',
  reason text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  resolved_at timestamptz,
  constraint points_holds_amount_check check (points_amount>0),
  constraint points_holds_status_check check (status in ('held','released','consumed','expired')),
  constraint points_holds_expiry_check check (expires_at is null or expires_at>created_at),
  constraint points_holds_reason_check check (length(trim(reason))>0)
);

create table public.merchant_obligations (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete restrict,
  obligation_type text not null,
  source_type text not null,
  source_id text,
  amount numeric(20,4) not null,
  currency char(3) not null,
  status text not null default 'draft',
  due_at timestamptz,
  description text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete restrict,
  constraint merchant_obligations_type_check check (obligation_type in ('receivable','payable')),
  constraint merchant_obligations_amount_check check (amount>0),
  constraint merchant_obligations_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint merchant_obligations_status_check check (status in ('draft','confirmed','disputed','settled','reversed')),
  constraint merchant_obligations_description_check check (length(trim(description))>0)
);
create index merchant_obligations_merchant_status_idx on public.merchant_obligations(merchant_id,status,due_at);

create table public.settlement_batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null unique,
  merchant_id uuid references public.merchants(id) on delete restrict,
  currency char(3) not null,
  period_start timestamptz,
  period_end timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  constraint settlement_batches_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint settlement_batches_status_check check (status in ('draft','in_review','approved','disputed','closed')),
  constraint settlement_batches_period_check check (period_end is null or period_start is null or period_end>period_start)
);

create table public.settlement_lines (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.settlement_batches(id) on delete restrict,
  obligation_id uuid references public.merchant_obligations(id) on delete restrict,
  source_type text not null,
  source_id text,
  amount numeric(20,4) not null,
  currency char(3) not null,
  description text not null,
  created_at timestamptz not null default now(),
  constraint settlement_lines_amount_check check (amount<>0),
  constraint settlement_lines_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint settlement_lines_description_check check (length(trim(description))>0)
);
create index settlement_lines_batch_idx on public.settlement_lines(batch_id);

create or replace function private.prevent_points_entry_mutation()
returns trigger language plpgsql security definer set search_path=''
as $$ begin raise exception 'points_entries_are_append_only'; end; $$;
revoke all on function private.prevent_points_entry_mutation() from public,anon,authenticated;
create trigger points_entries_append_only before update or delete on public.points_entries
for each row execute function private.prevent_points_entry_mutation();

alter table public.points_accounts enable row level security;
alter table public.points_entries enable row level security;
alter table public.points_holds enable row level security;
alter table public.merchant_obligations enable row level security;
alter table public.settlement_batches enable row level security;
alter table public.settlement_lines enable row level security;

create policy points_accounts_read_self_or_authorized on public.points_accounts
for select to authenticated using (member_user_id=(select auth.uid()) or private.has_permission('points.read',null));
create policy points_entries_read_self_or_authorized on public.points_entries
for select to authenticated using (
  exists(select 1 from public.points_accounts a where a.id=points_account_id and a.member_user_id=(select auth.uid()))
  or private.has_permission('points.read',null)
);
create policy points_holds_read_self_or_authorized on public.points_holds
for select to authenticated using (
  exists(select 1 from public.points_accounts a where a.id=points_account_id and a.member_user_id=(select auth.uid()))
  or private.has_permission('points.read',null)
);
create policy merchant_obligations_read_authorized on public.merchant_obligations
for select to authenticated using (private.has_permission('settlement.read',null));
create policy settlement_batches_read_authorized on public.settlement_batches
for select to authenticated using (private.has_permission('settlement.read',null));
create policy settlement_lines_read_authorized on public.settlement_lines
for select to authenticated using (private.has_permission('settlement.read',null));

revoke all on public.points_accounts,public.points_entries,public.points_holds,
  public.merchant_obligations,public.settlement_batches,public.settlement_lines from anon,authenticated;
grant select on public.points_accounts,public.points_entries,public.points_holds,
  public.merchant_obligations,public.settlement_batches,public.settlement_lines to authenticated;

commit;

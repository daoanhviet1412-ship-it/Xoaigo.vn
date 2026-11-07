-- XOÀI GO Core Platform — migration 0018
-- Finance/ledger/reconciliation schema foundation only.
-- No posting, balance mutation, funds custody, payout or payment execution is enabled.

begin;

create table public.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  account_code text not null unique,
  account_name text not null,
  account_class text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete restrict,
  constraint ledger_accounts_code_check check (account_code ~ '^[A-Z0-9][A-Z0-9_.-]{1,63}$'),
  constraint ledger_accounts_name_check check (length(trim(account_name)) > 0),
  constraint ledger_accounts_class_check check (length(trim(account_class)) > 0)
);

create table public.journal_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_code text not null unique,
  description text not null,
  source_type text not null,
  source_id text,
  status text not null default 'draft',
  currency char(3) not null,
  effective_at timestamptz not null,
  idempotency_key text,
  reversal_of uuid references public.journal_transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  posted_at timestamptz,
  posted_by uuid references public.profiles(id) on delete restrict,
  constraint journal_transactions_status_check check (status in ('draft','posted','reversed')),
  constraint journal_transactions_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint journal_transactions_description_check check (length(trim(description)) > 0),
  constraint journal_transactions_source_check check (length(trim(source_type)) > 0),
  constraint journal_transactions_posted_fields_check check (
    (status='draft' and posted_at is null and posted_by is null)
    or (status in ('posted','reversed') and posted_at is not null and posted_by is not null)
  ),
  constraint journal_transactions_not_self_reversal check (reversal_of is null or reversal_of <> id)
);
create unique index journal_transactions_idempotency_idx
  on public.journal_transactions(idempotency_key) where idempotency_key is not null;
create unique index journal_transactions_single_reversal_idx
  on public.journal_transactions(reversal_of) where reversal_of is not null;

create table public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.journal_transactions(id) on delete restrict,
  line_number integer not null,
  account_id uuid not null references public.ledger_accounts(id) on delete restrict,
  debit_amount numeric(20,4) not null default 0,
  credit_amount numeric(20,4) not null default 0,
  description text,
  merchant_id uuid references public.merchants(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint journal_lines_line_number_check check (line_number > 0),
  constraint journal_lines_amounts_check check (
    debit_amount >= 0 and credit_amount >= 0
    and ((debit_amount > 0 and credit_amount = 0) or (credit_amount > 0 and debit_amount = 0))
  ),
  constraint journal_lines_transaction_line_unique unique(transaction_id,line_number)
);
create index journal_lines_account_idx on public.journal_lines(account_id,created_at desc);
create index journal_lines_merchant_idx on public.journal_lines(merchant_id,created_at desc) where merchant_id is not null;

create table public.idempotency_records (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete restrict,
  scope text not null,
  command text not null,
  idempotency_key text not null,
  request_hash text not null,
  response_payload jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint idempotency_records_scope_check check (length(trim(scope)) > 0),
  constraint idempotency_records_command_check check (length(trim(command)) > 0),
  constraint idempotency_records_key_check check (length(trim(idempotency_key)) > 0),
  constraint idempotency_records_hash_check check (request_hash ~ '^[a-fA-F0-9]{64}$'),
  constraint idempotency_records_expiry_check check (expires_at is null or expires_at > created_at),
  constraint idempotency_records_actor_scope_key_unique unique(actor_user_id,scope,command,idempotency_key)
);

create table public.reconciliation_batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null unique,
  source_system text not null,
  source_reference text,
  currency char(3) not null,
  status text not null default 'draft',
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  completed_at timestamptz,
  constraint reconciliation_batches_status_check check (status in ('draft','in_review','matched','discrepancy','closed')),
  constraint reconciliation_batches_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint reconciliation_batches_period_check check (period_end is null or period_start is null or period_end > period_start)
);

create table public.reconciliation_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.reconciliation_batches(id) on delete restrict,
  external_reference text,
  internal_reference text,
  expected_amount numeric(20,4),
  observed_amount numeric(20,4),
  status text not null default 'unmatched',
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint reconciliation_items_status_check check (status in ('unmatched','matched','discrepancy','resolved','ignored'))
);
create index reconciliation_items_batch_idx on public.reconciliation_items(batch_id,created_at);

create or replace function private.guard_journal_line_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_status text;
begin
  select status into v_status from public.journal_transactions where id=coalesce(new.transaction_id,old.transaction_id);
  if v_status is distinct from 'draft' then
    raise exception 'posted_journal_lines_are_immutable';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function private.guard_journal_transaction_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' and old.status<>'draft' then
    raise exception 'posted_journal_transactions_are_immutable';
  end if;
  if tg_op='UPDATE' and old.status<>'draft' then
    raise exception 'posted_journal_transactions_are_immutable';
  end if;
  if tg_op='UPDATE' and new.status<>'draft' then
    if new.transaction_code is distinct from old.transaction_code
      or new.description is distinct from old.description
      or new.source_type is distinct from old.source_type
      or new.source_id is distinct from old.source_id
      or new.currency is distinct from old.currency
      or new.effective_at is distinct from old.effective_at
      or new.idempotency_key is distinct from old.idempotency_key
      or new.reversal_of is distinct from old.reversal_of
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at then
      raise exception 'journal_fields_immutable_on_post';
    end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function private.assert_journal_balanced_from_lines()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid; v_status text; v_count bigint; v_debit numeric; v_credit numeric;
begin
  v_id:=coalesce(new.transaction_id,old.transaction_id);
  select status into v_status from public.journal_transactions where id=v_id;
  if v_status in ('posted','reversed') then
    select count(*),coalesce(sum(debit_amount),0),coalesce(sum(credit_amount),0)
      into v_count,v_debit,v_credit from public.journal_lines where transaction_id=v_id;
    if v_count<2 or v_debit<=0 or v_debit<>v_credit then
      raise exception 'journal_must_balance_before_posting';
    end if;
  end if;
  return null;
end;
$$;

create or replace function private.assert_journal_balanced_from_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_count bigint; v_debit numeric; v_credit numeric;
begin
  if new.status in ('posted','reversed') then
    select count(*),coalesce(sum(debit_amount),0),coalesce(sum(credit_amount),0)
      into v_count,v_debit,v_credit from public.journal_lines where transaction_id=new.id;
    if v_count<2 or v_debit<=0 or v_debit<>v_credit then
      raise exception 'journal_must_balance_before_posting';
    end if;
  end if;
  return null;
end;
$$;

revoke all on function private.guard_journal_line_mutation() from public,anon,authenticated;
revoke all on function private.guard_journal_transaction_mutation() from public,anon,authenticated;
revoke all on function private.assert_journal_balanced_from_lines() from public,anon,authenticated;
revoke all on function private.assert_journal_balanced_from_transaction() from public,anon,authenticated;

create trigger journal_lines_immutable_guard before insert or update or delete on public.journal_lines
for each row execute function private.guard_journal_line_mutation();
create constraint trigger journal_lines_balance_check
after insert or update or delete on public.journal_lines
deferrable initially deferred for each row execute function private.assert_journal_balanced_from_lines();
create trigger journal_transactions_immutable_guard before update or delete on public.journal_transactions
for each row execute function private.guard_journal_transaction_mutation();
create constraint trigger journal_transactions_balance_check
after update of status on public.journal_transactions
deferrable initially deferred for each row execute function private.assert_journal_balanced_from_transaction();

alter table public.ledger_accounts enable row level security;
alter table public.journal_transactions enable row level security;
alter table public.journal_lines enable row level security;
alter table public.idempotency_records enable row level security;
alter table public.reconciliation_batches enable row level security;
alter table public.reconciliation_items enable row level security;

create policy ledger_accounts_read_authorized on public.ledger_accounts
for select to authenticated using (private.has_permission('ledger.read',null));
create policy journal_transactions_read_authorized on public.journal_transactions
for select to authenticated using (private.has_permission('ledger.read',null));
create policy journal_lines_read_authorized on public.journal_lines
for select to authenticated using (private.has_permission('ledger.read',null));
create policy reconciliation_batches_read_authorized on public.reconciliation_batches
for select to authenticated using (private.has_permission('reconciliation.read',null));
create policy reconciliation_items_read_authorized on public.reconciliation_items
for select to authenticated using (private.has_permission('reconciliation.read',null));

revoke all on public.ledger_accounts,public.journal_transactions,public.journal_lines,
  public.idempotency_records,public.reconciliation_batches,public.reconciliation_items from anon,authenticated;
grant select on public.ledger_accounts,public.journal_transactions,public.journal_lines,
  public.reconciliation_batches,public.reconciliation_items to authenticated;

insert into public.permissions(code,description) values
 ('ledger.read','Read the immutable journal and chart of accounts'),
 ('reconciliation.read','Read reconciliation batches and items')
on conflict(code) do update set description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.code in ('platform_owner','finance_manager')
and p.code in ('ledger.read','reconciliation.read')
on conflict do nothing;

commit;

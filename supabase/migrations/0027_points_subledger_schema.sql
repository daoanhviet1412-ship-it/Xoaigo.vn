-- XOÀI GO — migration 0027
-- POINTS subledger schema foundation only.
-- No earn/redeem posting command, wallet funding, release execution, payout,
-- POINTS/VND conversion, or automatic Pending release is enabled.
-- Prerequisite: repository migrations 0025 and 0026 must be reconciled/applied
-- in order in an isolated database before this migration is tested.

begin;

-- The previous member-only points tables cannot be safely converted because
-- their signed deltas do not encode Available/Pending/Held buckets. Fail closed
-- rather than silently creating two active balance sources.
do $$
begin
  if exists (select 1 from public.points_accounts)
     or exists (select 1 from public.points_entries)
     or exists (select 1 from public.points_holds) then
    raise exception
      'legacy_points_data_requires_explicit_backfill_before_0027';
  end if;
end;
$$;

create table public.points_wallets (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  customer_user_id uuid references public.member_profiles(user_id) on delete restrict,
  merchant_id uuid references public.merchants(id) on delete restrict,
  platform_code text,
  program_code text not null default 'XOAI_GO',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete restrict,
  constraint points_wallets_subject_check check (
    (subject_type = 'customer'
      and customer_user_id is not null
      and merchant_id is null
      and platform_code is null)
    or
    (subject_type = 'merchant'
      and customer_user_id is null
      and merchant_id is not null
      and platform_code is null)
    or
    (subject_type = 'app'
      and customer_user_id is null
      and merchant_id is null
      and platform_code is not null
      and length(trim(platform_code)) > 0)
  ),
  constraint points_wallets_subject_type_check
    check (subject_type in ('customer','merchant','app')),
  constraint points_wallets_program_check
    check (length(trim(program_code)) > 0),
  constraint points_wallets_status_check
    check (status in ('active','suspended','closed'))
);

-- One canonical wallet per subject in the current Xoai Go program.
-- program_code is descriptive metadata, not a second balance partition.
create unique index points_wallets_customer_uidx
  on public.points_wallets(customer_user_id)
  where subject_type = 'customer';
create unique index points_wallets_merchant_uidx
  on public.points_wallets(merchant_id)
  where subject_type = 'merchant';
create unique index points_wallets_app_uidx
  on public.points_wallets(subject_type)
  where subject_type = 'app';
create index points_wallets_merchant_idx
  on public.points_wallets(merchant_id) where merchant_id is not null;

create table public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_code text not null unique,
  transaction_type text not null,
  status text not null default 'draft',
  correlation_id uuid not null default gen_random_uuid(),
  idempotency_key text not null,
  request_hash text not null,
  source_type text not null,
  source_id text,
  order_id uuid references public.commerce_orders(id) on delete restrict,
  merchant_id uuid references public.merchants(id) on delete restrict,
  customer_user_id uuid references public.member_profiles(user_id) on delete restrict,
  policy_version_id uuid references public.policy_versions(id) on delete restrict,
  policy_snapshot jsonb not null default '{}'::jsonb,
  reversal_of uuid references public.points_transactions(id) on delete restrict,
  actor_kind text not null default 'user',
  actor_user_id uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  posted_at timestamptz,
  posted_by uuid references public.profiles(id) on delete restrict,
  constraint points_transactions_type_check
    check (transaction_type in ('earn','redeem','hold','release','reversal','adjustment')),
  constraint points_transactions_status_check
    check (status in ('draft','posted','voided')),
  constraint points_transactions_actor_kind_check
    check (actor_kind in ('user','system','provider')),
  constraint points_transactions_user_actor_check
    check (actor_kind <> 'user' or actor_user_id is not null),
  constraint points_transactions_request_hash_check
    check (request_hash ~ '^[0-9a-fA-F]{64}$'),
  constraint points_transactions_source_check
    check (length(trim(source_type)) > 0),
  constraint points_transactions_code_check
    check (length(trim(transaction_code)) > 0),
  constraint points_transactions_idempotency_key_check
    check (length(trim(idempotency_key)) > 0),
  constraint points_transactions_snapshot_check
    check (jsonb_typeof(policy_snapshot) = 'object'
      and (status <> 'posted' or jsonb_object_length(policy_snapshot) > 0)),
  constraint points_transactions_posted_fields_check
    check (
      (status in ('draft','voided') and posted_at is null and posted_by is null)
      or (status = 'posted' and posted_at is not null and posted_by is not null)
    ),
  constraint points_transactions_reversal_type_check
    check (
      (transaction_type = 'reversal' and reversal_of is not null)
      or (transaction_type <> 'reversal' and reversal_of is null)
    ),
  constraint points_transactions_not_self_reversal
    check (reversal_of is null or reversal_of <> id)
);

create unique index points_transactions_idempotency_uidx
  on public.points_transactions(transaction_type, idempotency_key);
create unique index points_transactions_single_reversal_uidx
  on public.points_transactions(reversal_of) where reversal_of is not null;
create index points_transactions_order_idx
  on public.points_transactions(order_id) where order_id is not null;
create index points_transactions_merchant_created_idx
  on public.points_transactions(merchant_id, created_at desc);
create index points_transactions_customer_created_idx
  on public.points_transactions(customer_user_id, created_at desc);
create index points_transactions_correlation_idx
  on public.points_transactions(correlation_id);

create table public.points_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.points_transactions(id) on delete restrict,
  entry_number integer not null,
  wallet_id uuid not null references public.points_wallets(id) on delete restrict,
  bucket text not null,
  side text not null,
  points_amount bigint not null,
  created_at timestamptz not null default now(),
  constraint points_ledger_entries_number_check check (entry_number > 0),
  constraint points_ledger_entries_bucket_check
    check (bucket in ('available','pending','held')),
  constraint points_ledger_entries_side_check check (side in ('debit','credit')),
  constraint points_ledger_entries_amount_check check (points_amount > 0),
  constraint points_ledger_entries_transaction_line_uidx
    unique(transaction_id, entry_number)
);

create index points_ledger_entries_wallet_bucket_time_idx
  on public.points_ledger_entries(wallet_id, bucket, created_at desc);
create index points_ledger_entries_transaction_idx
  on public.points_ledger_entries(transaction_id, entry_number);
create index points_ledger_entries_wallet_time_idx
  on public.points_ledger_entries(wallet_id, created_at desc);

-- Release requests are review records only. A later command-engine phase must
-- create the actual Pending -> Available ledger movement after manual approval.
create table public.points_release_requests (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.points_transactions(id) on delete restrict,
  status text not null default 'pending',
  requested_by uuid not null references public.profiles(id) on delete restrict,
  requested_at timestamptz not null default now(),
  eligible_after timestamptz not null,
  idempotency_key text not null unique,
  reason text not null,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  review_reason text,
  constraint points_release_requests_status_check
    check (status in ('pending','approved','rejected','held','cancelled')),
  constraint points_release_requests_reason_check
    check (length(trim(reason)) > 0),
  constraint points_release_requests_idempotency_key_check
    check (length(trim(idempotency_key)) > 0),
  constraint points_release_requests_review_reason_check
    check (review_reason is null or length(trim(review_reason)) > 0),
  constraint points_release_requests_maker_checker_check
    check (reviewed_by is null or reviewed_by <> requested_by),
  constraint points_release_requests_review_state_check
    check (
      (status in ('pending','cancelled') and reviewed_by is null and reviewed_at is null)
      or
      (status in ('approved','rejected','held') and reviewed_by is not null
        and reviewed_at is not null and review_reason is not null)
    )
);

create index points_release_requests_queue_idx
  on public.points_release_requests(status, eligible_after, requested_at);

create table public.points_release_request_lines (
  id uuid primary key default gen_random_uuid(),
  release_request_id uuid not null references public.points_release_requests(id) on delete restrict,
  points_ledger_entry_id uuid not null references public.points_ledger_entries(id) on delete restrict,
  points_amount bigint not null,
  created_at timestamptz not null default now(),
  constraint points_release_request_lines_amount_check check (points_amount > 0),
  constraint points_release_request_lines_entry_uidx
    unique(release_request_id, points_ledger_entry_id)
);

create index points_release_request_lines_entry_idx
  on public.points_release_request_lines(points_ledger_entry_id);

create table public.points_release_decisions (
  id uuid primary key default gen_random_uuid(),
  release_request_id uuid not null references public.points_release_requests(id) on delete restrict,
  actor_user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint points_release_decisions_action_check
    check (action in ('approved','rejected','held','cancelled')),
  constraint points_release_decisions_reason_check
    check (length(trim(reason)) > 0)
);

create index points_release_decisions_request_time_idx
  on public.points_release_decisions(release_request_id, created_at);

create or replace function private.guard_points_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_original_status text;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'points_transaction_must_start_as_draft';
    end if;
    if new.transaction_type = 'reversal' then
      select status into v_original_status
        from public.points_transactions
        where id = new.reversal_of
        for update;
      if v_original_status is distinct from 'posted' then
        raise exception 'points_reversal_requires_posted_original';
      end if;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.status <> 'draft' then
      raise exception 'posted_points_transaction_is_immutable';
    end if;
    return old;
  else
    if old.status <> 'draft' then
      raise exception 'posted_points_transaction_is_immutable';
    end if;
    if new.status not in ('draft','posted','voided') then
      raise exception 'invalid_points_transaction_status';
    end if;
    if new.status = 'posted' then
      if new.posted_by is null then
        raise exception 'points_transaction_posted_by_required';
      end if;
      new.posted_at := coalesce(new.posted_at, now());
    elsif new.status = 'voided' then
      new.posted_at := null;
      new.posted_by := null;
    end if;
    return new;
  end if;
end;
$$;
revoke all on function private.guard_points_transaction() from public, anon, authenticated;

create trigger points_transactions_guard
before insert or update or delete on public.points_transactions
for each row execute function private.guard_points_transaction();

create or replace function private.guard_points_ledger_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if tg_op = 'UPDATE' and new.transaction_id is distinct from old.transaction_id then
    raise exception 'points_entry_transaction_cannot_change';
  end if;

  if tg_op = 'DELETE' then
    select status into v_status
      from public.points_transactions
      where id = old.transaction_id
      for update;
  else
    select status into v_status
      from public.points_transactions
      where id = new.transaction_id
      for update;
  end if;

  if v_status is distinct from 'draft' then
    raise exception 'posted_points_entries_are_immutable';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_points_ledger_entry() from public, anon, authenticated;

create trigger points_ledger_entries_guard
before insert or update or delete on public.points_ledger_entries
for each row execute function private.guard_points_ledger_entry();

create or replace function private.assert_points_transaction_balanced()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_transaction_id uuid;
  v_status text;
  v_count bigint;
  v_debits numeric;
  v_credits numeric;
begin
  if tg_table_name = 'points_transactions' then
    v_transaction_id := new.id;
  elsif tg_op = 'DELETE' then
    v_transaction_id := old.transaction_id;
  else
    v_transaction_id := new.transaction_id;
  end if;

  select status into v_status
    from public.points_transactions
    where id = v_transaction_id;

  if v_status = 'posted' then
    select count(*),
      coalesce(sum(points_amount) filter (where side = 'debit'), 0),
      coalesce(sum(points_amount) filter (where side = 'credit'), 0)
    into v_count, v_debits, v_credits
    from public.points_ledger_entries
    where transaction_id = v_transaction_id;

    if v_count < 2 or v_debits <= 0 or v_debits <> v_credits then
      raise exception 'points_transaction_must_balance_before_posting';
    end if;
  end if;
  return null;
end;
$$;
revoke all on function private.assert_points_transaction_balanced() from public, anon, authenticated;

create constraint trigger points_transactions_balance_check
after insert or update of status on public.points_transactions
deferrable initially deferred
for each row execute function private.assert_points_transaction_balanced();

create constraint trigger points_ledger_entries_balance_check
after insert or update or delete on public.points_ledger_entries
deferrable initially deferred
for each row execute function private.assert_points_transaction_balanced();

create or replace function private.guard_points_release_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_transaction_type text;
  v_transaction_status text;
  v_transaction_posted_at timestamptz;
begin
  if tg_op = 'INSERT' then
    select transaction_type, status, posted_at
      into v_transaction_type, v_transaction_status, v_transaction_posted_at
      from public.points_transactions
      where id = new.transaction_id
      for update;
    if v_transaction_type is distinct from 'redeem'
       or v_transaction_status is distinct from 'posted' then
      raise exception 'release_request_requires_posted_redeem_transaction';
    end if;
    new.eligible_after := v_transaction_posted_at + interval '2 days';
    return new;
  elsif tg_op = 'DELETE' then
    raise exception 'points_release_requests_are_not_deletable';
  else
    if new.transaction_id is distinct from old.transaction_id
       or new.requested_by is distinct from old.requested_by
       or new.requested_at is distinct from old.requested_at
       or new.eligible_after is distinct from old.eligible_after
       or new.idempotency_key is distinct from old.idempotency_key
       or new.reason is distinct from old.reason then
      raise exception 'points_release_request_payload_is_immutable';
    end if;
    if old.status not in ('pending','held') then
      raise exception 'terminal_points_release_request_is_immutable';
    end if;
    if old.status = 'held' and new.status = 'pending' then
      raise exception 'held_points_release_request_requires_explicit_resolution';
    end if;
    if new.status not in ('pending','approved','rejected','held','cancelled') then
      raise exception 'invalid_points_release_request_transition';
    end if;
    if new.status in ('approved','rejected','held') then
      if new.reviewed_by is null or new.reviewed_by = old.requested_by
         or new.reviewed_at is null or new.review_reason is null then
        raise exception 'points_release_request_requires_independent_checker';
      end if;
    end if;
    if new.status = 'approved' and now() < old.eligible_after then
      raise exception 'points_redeem_pending_minimum_2_days';
    end if;
    if new.status in ('approved','rejected','held') and not exists (
      select 1
      from public.points_release_decisions d
      where d.release_request_id = old.id
        and d.actor_user_id = new.reviewed_by
        and d.action = new.status
        and d.reason = new.review_reason
    ) then
      raise exception 'points_release_decision_audit_record_required';
    end if;
    if new.status = 'approved' and not exists (
      select 1 from public.points_release_request_lines l
      where l.release_request_id = old.id
    ) then
      raise exception 'points_release_request_requires_allocation_scope';
    end if;
    return new;
  end if;
end;
$$;
revoke all on function private.guard_points_release_request() from public, anon, authenticated;

create trigger points_release_requests_guard
before insert or update or delete on public.points_release_requests
for each row execute function private.guard_points_release_request();

create or replace function private.guard_points_release_request_line()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request_status text;
  v_entry_amount bigint;
  v_entry_bucket text;
  v_entry_side text;
  v_transaction_type text;
  v_transaction_status text;
  v_reserved numeric;
begin
  if tg_op <> 'INSERT' then
    raise exception 'points_release_request_lines_are_immutable';
  end if;

  select status into v_request_status
    from public.points_release_requests
    where id = new.release_request_id
    for update;
  if v_request_status is distinct from 'pending' then
    raise exception 'release_request_lines_require_pending_request';
  end if;

  select e.points_amount, e.bucket, e.side, t.transaction_type, t.status
    into v_entry_amount, v_entry_bucket, v_entry_side, v_transaction_type, v_transaction_status
    from public.points_ledger_entries e
    join public.points_transactions t on t.id = e.transaction_id
    where e.id = new.points_ledger_entry_id
    for update of e;

  if v_transaction_type is distinct from 'redeem'
     or v_transaction_status is distinct from 'posted'
     or v_entry_bucket is distinct from 'pending'
     or v_entry_side is distinct from 'credit' then
    raise exception 'release_line_must_reference_pending_redeem_credit';
  end if;

  select coalesce(sum(l.points_amount),0) into v_reserved
    from public.points_release_request_lines l
    join public.points_release_requests r on r.id = l.release_request_id
    where l.points_ledger_entry_id = new.points_ledger_entry_id
      and r.status in ('pending','approved','held');

  if v_reserved + new.points_amount > v_entry_amount then
    raise exception 'release_request_exceeds_pending_allocation';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_points_release_request_line() from public, anon, authenticated;

create trigger points_release_request_lines_guard
before insert or update or delete on public.points_release_request_lines
for each row execute function private.guard_points_release_request_line();

create trigger points_release_requests_no_truncate
before truncate on public.points_release_requests
for each statement execute function private.prevent_append_only_truncate();
create trigger points_release_request_lines_no_truncate
before truncate on public.points_release_request_lines
for each statement execute function private.prevent_append_only_truncate();

create or replace function private.guard_points_release_decision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_requester uuid;
  v_eligible_after timestamptz;
  v_status text;
begin
  select requested_by, eligible_after, status
    into v_requester, v_eligible_after, v_status
    from public.points_release_requests
    where id = new.release_request_id
    for update;

  if v_status not in ('pending','held') then
    raise exception 'points_release_request_not_reviewable';
  end if;
  if new.action in ('approved','rejected','held') and new.actor_user_id = v_requester then
    raise exception 'maker_checker_violation';
  end if;
  if new.action = 'approved' and now() < v_eligible_after then
    raise exception 'points_redeem_pending_minimum_2_days';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_points_release_decision() from public, anon, authenticated;

create trigger points_release_decisions_guard
before insert on public.points_release_decisions
for each row execute function private.guard_points_release_decision();

create or replace function private.prevent_points_append_only_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'points_history_is_append_only: %', tg_table_name;
end;
$$;
revoke all on function private.prevent_points_append_only_mutation() from public, anon, authenticated;

create trigger points_release_decisions_append_only
before update or delete on public.points_release_decisions
for each row execute function private.prevent_points_append_only_mutation();

create trigger points_release_decisions_no_truncate
before truncate on public.points_release_decisions
for each statement execute function private.prevent_append_only_truncate();
create trigger points_transactions_no_truncate
before truncate on public.points_transactions
for each statement execute function private.prevent_append_only_truncate();
create trigger points_ledger_entries_no_truncate
before truncate on public.points_ledger_entries
for each statement execute function private.prevent_append_only_truncate();

-- Read-only access only. Command writes will be added later through private
-- SECURITY DEFINER implementations and public SECURITY INVOKER wrappers.
alter table public.points_wallets enable row level security;
alter table public.points_transactions enable row level security;
alter table public.points_ledger_entries enable row level security;
alter table public.points_release_requests enable row level security;
alter table public.points_release_request_lines enable row level security;
alter table public.points_release_decisions enable row level security;

create policy points_wallets_read_scoped on public.points_wallets
for select to authenticated
using (
  (subject_type = 'customer' and customer_user_id = (select auth.uid()))
  or private.has_permission('points.read', null)
  or (subject_type = 'merchant' and private.has_permission('merchant.workspace', merchant_id))
);

create policy points_transactions_read_scoped on public.points_transactions
for select to authenticated
using (
  exists (
    select 1
    from public.points_ledger_entries e
    join public.points_wallets w on w.id = e.wallet_id
    where e.transaction_id = points_transactions.id
      and (
        (w.subject_type = 'customer' and w.customer_user_id = (select auth.uid()))
        or private.has_permission('points.read', null)
        or (w.subject_type = 'merchant' and private.has_permission('merchant.workspace', w.merchant_id))
      )
  )
);

create policy points_ledger_entries_read_scoped on public.points_ledger_entries
for select to authenticated
using (
  exists (
    select 1 from public.points_wallets w
    where w.id = wallet_id
      and (
        (w.subject_type = 'customer' and w.customer_user_id = (select auth.uid()))
        or private.has_permission('points.read', null)
        or (w.subject_type = 'merchant' and private.has_permission('merchant.workspace', w.merchant_id))
      )
  )
);

create policy points_release_requests_read_scoped on public.points_release_requests
for select to authenticated
using (requested_by = (select auth.uid()) or private.has_permission('points.read', null));

create policy points_release_request_lines_read_scoped on public.points_release_request_lines
for select to authenticated
using (
  exists (
    select 1 from public.points_release_requests r
    where r.id = release_request_id
      and (r.requested_by = (select auth.uid()) or private.has_permission('points.read', null))
  )
);

create policy points_release_decisions_read_scoped on public.points_release_decisions
for select to authenticated
using (
  actor_user_id = (select auth.uid())
  or private.has_permission('points.read', null)
  or exists (
    select 1 from public.points_release_requests r
    where r.id = release_request_id and r.requested_by = (select auth.uid())
  )
);

revoke all on public.points_wallets, public.points_transactions,
  public.points_ledger_entries, public.points_release_requests,
  public.points_release_request_lines, public.points_release_decisions
  from public, anon, authenticated;
grant select on public.points_wallets, public.points_transactions,
  public.points_ledger_entries, public.points_release_requests,
  public.points_release_request_lines, public.points_release_decisions
  to authenticated;

comment on table public.points_wallets is
  'Canonical POINTS wallets for Customer, Merchant and Xoai App subjects. Not VND.';
comment on table public.points_transactions is
  'Immutable posted POINTS transaction headers; posting commands are a later phase.';
comment on table public.points_ledger_entries is
  'Balanced append-only debit/credit POINTS entries with Available/Pending/Held buckets.';
comment on table public.points_release_requests is
  'Manual review request only; approval never auto-posts a Pending-to-Available movement.';
comment on table public.points_release_request_lines is
  'Requested scope by pending redeem credit allocation; partial release policy remains subject to PO decision.';
comment on table public.points_release_decisions is
  'Append-only checker decisions for manual POINTS release review.';

commit;

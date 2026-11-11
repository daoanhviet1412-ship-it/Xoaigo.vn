-- Phase 2 POINTS subledger structural contract checks.
-- Run only in an isolated disposable database after migrations 0025-0027.
-- This script is read-only and raises on a failed assertion.

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'points_wallets',
    'points_transactions',
    'points_ledger_entries',
    'points_release_requests',
    'points_release_request_lines',
    'points_release_decisions'
  ]
  loop
    if to_regclass('public.' || v_table) is null then
      raise exception 'missing_required_table: %', v_table;
    end if;

    if not exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = v_table
        and c.relrowsecurity
    ) then
      raise exception 'rls_not_enabled: %', v_table;
    end if;

    if has_table_privilege('anon', 'public.' || v_table, 'SELECT')
       or has_table_privilege('anon', 'public.' || v_table, 'INSERT')
       or has_table_privilege('anon', 'public.' || v_table, 'UPDATE')
       or has_table_privilege('anon', 'public.' || v_table, 'DELETE') then
      raise exception 'anon_has_table_privilege: %', v_table;
    end if;

    if has_table_privilege('authenticated', 'public.' || v_table, 'INSERT')
       or has_table_privilege('authenticated', 'public.' || v_table, 'UPDATE')
       or has_table_privilege('authenticated', 'public.' || v_table, 'DELETE') then
      raise exception 'authenticated_client_write_grant_present: %', v_table;
    end if;

    if not has_table_privilege('authenticated', 'public.' || v_table, 'SELECT') then
      raise exception 'authenticated_select_missing: %', v_table;
    end if;
  end loop;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'points_transactions_balance_check'
      and not tgisinternal
  ) then
    raise exception 'missing_points_transaction_balance_trigger';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'points_ledger_entries_balance_check'
      and not tgisinternal
  ) then
    raise exception 'missing_points_entry_balance_trigger';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'points_release_requests_guard'
      and not tgisinternal
  ) then
    raise exception 'missing_manual_release_guard';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'points_release_decisions_append_only'
      and not tgisinternal
  ) then
    raise exception 'missing_release_decision_append_only_guard';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'points_release_request_lines_no_truncate'
      and not tgisinternal
  ) then
    raise exception 'missing_release_request_line_truncate_guard';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'points_wallets_customer_uidx'
  ) or not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'points_wallets_merchant_uidx'
  ) or not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'points_wallets_app_uidx'
  ) then
    raise exception 'missing_one_wallet_per_subject_unique_indexes';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.points_wallets'::regclass
      and conname = 'points_wallets_subject_check'
  ) then
    raise exception 'missing_wallet_subject_owner_constraint';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.points_transactions'::regclass
      and conname = 'points_transactions_posted_fields_check'
  ) then
    raise exception 'missing_transaction_posting_state_constraint';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.points_transactions'::regclass
      and conname = 'points_transactions_redeem_context_check'
  ) then
    raise exception 'missing_redeem_effective_session_shift_snapshot_constraint';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.points_ledger_entries'::regclass
      and conname = 'points_ledger_entries_bucket_check'
  ) then
    raise exception 'missing_points_bucket_constraint';
  end if;

  raise notice 'PASS: Phase 2 POINTS subledger structural contract';
end;
$$;

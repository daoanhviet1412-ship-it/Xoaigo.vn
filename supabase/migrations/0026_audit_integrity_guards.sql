-- XOÀI GO — migration 0026
-- Hardens immutable financial/audit records and state invariants found in the
-- independent 2026-11-08 audit. Forward-only migration; no financial commands enabled.
begin;

-- H-01: a journal line can never be reassigned to another transaction.
-- Validate both parent transactions and reject moves even when the destination is draft.
create or replace function private.guard_journal_line_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_status text;
  v_new_status text;
begin
  if tg_op = 'INSERT' then
    select status into v_new_status
      from public.journal_transactions where id = new.transaction_id for update;
    if v_new_status is distinct from 'draft' then
      raise exception 'journal_lines_can_only_be_added_to_draft';
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if new.transaction_id is distinct from old.transaction_id then
      raise exception 'journal_line_transaction_cannot_be_changed';
    end if;
    select status into v_old_status
      from public.journal_transactions where id = old.transaction_id for update;
    if v_old_status is distinct from 'draft' then
      raise exception 'posted_journal_lines_are_immutable';
    end if;
    return new;
  else
    select status into v_old_status
      from public.journal_transactions where id = old.transaction_id for update;
    if v_old_status is distinct from 'draft' then
      raise exception 'posted_journal_lines_are_immutable';
    end if;
    return old;
  end if;
end;
$$;

-- M-01: a transaction cannot be inserted directly as posted/reversed and the
-- deferred balance invariant runs on INSERT as well as status changes.
drop trigger if exists journal_transactions_balance_check on public.journal_transactions;
create constraint trigger journal_transactions_balance_check
after insert or update of status on public.journal_transactions
deferrable initially deferred
for each row execute function private.assert_journal_balanced_from_transaction();

-- Recreate line balance trigger so UPDATE checks both affected transaction IDs.
create or replace function private.assert_journal_balanced_from_lines()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_status text;
  v_count bigint;
  v_debit numeric;
  v_credit numeric;
begin
  for v_id in
    select distinct x.id
    from unnest(array[
      case when tg_op <> 'INSERT' then old.transaction_id else null end,
      case when tg_op <> 'DELETE' then new.transaction_id else null end
    ]) as x(id)
    where x.id is not null
  loop
    select status into v_status
      from public.journal_transactions where id = v_id;
    if v_status in ('posted','reversed') then
      select count(*), coalesce(sum(debit_amount),0), coalesce(sum(credit_amount),0)
        into v_count,v_debit,v_credit
        from public.journal_lines where transaction_id = v_id;
      if v_count < 2 or v_debit <= 0 or v_debit <> v_credit then
        raise exception 'journal_must_balance_before_posting';
      end if;
    end if;
  end loop;
  return null;
end;
$$;

-- M-03: block TRUNCATE on append-only audit and financial history tables,
-- including privileged application roles. Superusers/owners can still disable
-- triggers; production audit export remains an operational requirement.
create or replace function private.prevent_append_only_truncate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'append_only_table_truncate_forbidden: %', tg_table_name;
end;
$$;

revoke all on function private.prevent_append_only_truncate() from public, anon, authenticated;
drop trigger if exists audit_events_no_truncate on public.audit_events;
create trigger audit_events_no_truncate before truncate on public.audit_events
for each statement execute function private.prevent_append_only_truncate();
drop trigger if exists approval_actions_no_truncate on public.approval_actions;
create trigger approval_actions_no_truncate before truncate on public.approval_actions
for each statement execute function private.prevent_append_only_truncate();
drop trigger if exists journal_transactions_no_truncate on public.journal_transactions;
create trigger journal_transactions_no_truncate before truncate on public.journal_transactions
for each statement execute function private.prevent_append_only_truncate();
drop trigger if exists journal_lines_no_truncate on public.journal_lines;
create trigger journal_lines_no_truncate before truncate on public.journal_lines
for each statement execute function private.prevent_append_only_truncate();
drop trigger if exists points_entries_no_truncate on public.points_entries;
create trigger points_entries_no_truncate before truncate on public.points_entries
for each statement execute function private.prevent_append_only_truncate();

-- M-04: approval request contents are immutable after submission; only the
-- pending state may transition to a terminal state. Terminal requests cannot be edited.
create or replace function public.guard_approval_request_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'approval_requests_are_not_deletable';
  end if;
  if old.status <> 'pending' then
    raise exception 'terminal_approval_request_is_immutable';
  end if;
  if new.proposed_payload is distinct from old.proposed_payload
    or new.request_type is distinct from old.request_type
    or new.resource_type is distinct from old.resource_type
    or new.resource_id is distinct from old.resource_id
    or new.reason is distinct from old.reason
    or new.requested_by is distinct from old.requested_by
    or new.requested_at is distinct from old.requested_at
    or new.effective_at is distinct from old.effective_at then
    raise exception 'approval_request_payload_is_immutable';
  end if;
  if new.status not in ('pending','approved','rejected','cancelled') then
    raise exception 'invalid_approval_transition';
  end if;
  if new.status <> old.status and new.status not in ('approved','rejected','cancelled') then
    raise exception 'invalid_approval_transition';
  end if;
  return new;
end;
$$;

drop trigger if exists approval_requests_guard_transition on public.approval_requests;
create trigger approval_requests_guard_transition
before update or delete on public.approval_requests
for each row execute function public.guard_approval_request_transition();

-- H-03: settlement approval must be performed by a different actor.
alter table public.settlement_batches
  add constraint settlement_batches_maker_checker_check
  check (reviewed_by is null or reviewed_by <> created_by),
  add constraint settlement_batches_review_state_check
  check (
    (status in ('draft','in_review','disputed') and reviewed_by is null and reviewed_at is null)
    or (status in ('approved','closed') and reviewed_by is not null and reviewed_at is not null)
  );

-- Prevent changing the financial meaning of settled obligations.
create or replace function private.guard_settled_obligation_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status = 'settled' then
      raise exception 'settled_obligation_is_immutable';
    end if;
    return old;
  end if;
  if old.status = 'settled' then
    raise exception 'settled_obligation_is_immutable';
  end if;
  if new.status = 'settled' then
    if new.merchant_id is distinct from old.merchant_id
      or new.obligation_type is distinct from old.obligation_type
      or new.source_type is distinct from old.source_type
      or new.source_id is distinct from old.source_id
      or new.amount is distinct from old.amount
      or new.currency is distinct from old.currency
      or new.description is distinct from old.description then
      raise exception 'obligation_fields_immutable_on_settlement';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_settled_obligation_mutation() from public,anon,authenticated;
drop trigger if exists merchant_obligations_settled_guard on public.merchant_obligations;
create trigger merchant_obligations_settled_guard
before update or delete on public.merchant_obligations
for each row execute function private.guard_settled_obligation_mutation();

-- M-03 append-only protection for audit/approval records at statement level.
-- Existing row-level UPDATE/DELETE guards remain in place.

commit;

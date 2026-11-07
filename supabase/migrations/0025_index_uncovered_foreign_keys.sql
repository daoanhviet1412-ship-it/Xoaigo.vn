-- Add covering indexes for foreign keys reported by Supabase Performance Advisor.
-- These indexes improve joins and parent-row update/delete checks as operational
-- tables grow. No data or business rules are changed.
begin;

create index if not exists journal_transactions_created_by_idx
  on public.journal_transactions (created_by);
create index if not exists journal_transactions_posted_by_idx
  on public.journal_transactions (posted_by);
create index if not exists ledger_accounts_created_by_idx
  on public.ledger_accounts (created_by);
create index if not exists merchant_obligations_created_by_idx
  on public.merchant_obligations (created_by);
create index if not exists points_accounts_policy_version_id_idx
  on public.points_accounts (policy_version_id);
create index if not exists points_entries_actor_user_id_idx
  on public.points_entries (actor_user_id);
create index if not exists points_holds_points_account_id_idx
  on public.points_holds (points_account_id);
create index if not exists reconciliation_batches_created_by_idx
  on public.reconciliation_batches (created_by);
create index if not exists settlement_batches_created_by_idx
  on public.settlement_batches (created_by);
create index if not exists settlement_batches_merchant_id_idx
  on public.settlement_batches (merchant_id);
create index if not exists settlement_batches_reviewed_by_idx
  on public.settlement_batches (reviewed_by);
create index if not exists settlement_lines_obligation_id_idx
  on public.settlement_lines (obligation_id);

commit;

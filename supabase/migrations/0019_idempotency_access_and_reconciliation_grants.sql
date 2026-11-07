-- XOÀI GO Core Platform — migration 0019
-- Explicitly document private idempotency storage and complete read-only reconciliation grants.

begin;
create policy idempotency_records_deny_client_access on public.idempotency_records
for select to authenticated using (false);
grant select on public.reconciliation_items to authenticated;
create unique index idempotency_records_actor_scope_command_key_idx
on public.idempotency_records(
  coalesce(actor_user_id,'00000000-0000-0000-0000-000000000000'::uuid),
  scope,command,idempotency_key
);
commit;

-- Restrict browser roles to read-only table access. Mutations go through
-- narrowly authorized RPC commands with server/database permission checks.
begin;

revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public
  from anon, authenticated;

-- These are trigger-only functions; callers do not need EXECUTE on them.
revoke all on function public.enforce_maker_checker() from public, anon, authenticated;
revoke all on function public.prevent_approval_action_mutation() from public, anon, authenticated;
revoke all on function public.prevent_audit_event_mutation() from public, anon, authenticated;

alter function public.enforce_maker_checker() set search_path = '';
alter function public.prevent_approval_action_mutation() set search_path = '';
alter function public.prevent_audit_event_mutation() set search_path = '';

-- Avoid reintroducing broad client grants on future objects created by postgres.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

revoke all on all sequences in schema public from anon, authenticated;

commit;

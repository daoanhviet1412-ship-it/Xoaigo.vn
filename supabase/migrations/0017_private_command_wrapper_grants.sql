-- XOÀI GO Core Platform — migration 0017
-- Invoker wrappers call private SECURITY DEFINER commands as authenticated.
-- Grant EXECUTE only to authenticated; each command enforces its own permission checks.

begin;
grant execute on function private.admin_create_policy_set(text,text,text) to authenticated;
grant execute on function private.create_policy_version_draft(uuid,jsonb) to authenticated;
grant execute on function private.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text) to authenticated;
commit;

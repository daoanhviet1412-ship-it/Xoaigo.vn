-- XOÀI GO Core Platform — migration 0004
-- Restrict SECURITY DEFINER function execution to the minimum required roles.
begin;

revoke all on function public.has_permission(text, uuid) from public;
revoke all on function public.has_permission(text, uuid) from anon;
grant execute on function public.has_permission(text, uuid) to authenticated;

revoke all on function public.handle_new_auth_user() from public;
revoke all on function public.handle_new_auth_user() from anon;
revoke all on function public.handle_new_auth_user() from authenticated;

commit;

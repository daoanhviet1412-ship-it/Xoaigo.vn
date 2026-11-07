-- XOÀI GO Core Platform — migration 0009
-- Platform-scoped permissions apply across merchant records; merchant roles remain tenant-scoped.
begin;
create or replace function private.has_permission(permission_code text,merchant_scope uuid default null)
returns boolean language sql stable security definer
set search_path = public, auth, private
as $$
select exists (
 select 1 from public.user_role_grants urg
 join public.roles r on r.id=urg.role_id
 join public.role_permissions rp on rp.role_id=urg.role_id
 join public.permissions p on p.id=rp.permission_id
 join public.profiles pr on pr.id=urg.user_id
 where urg.user_id=(select auth.uid()) and urg.revoked_at is null and pr.status='active'
 and p.code=permission_code
 and ((r.is_platform_role=true and urg.merchant_id is null)
   or (merchant_scope is null and urg.merchant_id is null)
   or (merchant_scope is not null and urg.merchant_id=merchant_scope))
);
$$;
revoke all on function private.has_permission(text,uuid) from public,anon;
grant execute on function private.has_permission(text,uuid) to authenticated;
commit;

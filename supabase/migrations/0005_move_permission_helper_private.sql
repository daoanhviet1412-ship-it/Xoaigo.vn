-- XOÀI GO Core Platform — migration 0005
-- Keep the SECURITY DEFINER permission helper outside the exposed public API schema.
begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.has_permission(
  permission_code text,
  merchant_scope uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public, auth, private
as $$
  select exists (
    select 1
    from public.user_role_grants urg
    join public.role_permissions rp on rp.role_id = urg.role_id
    join public.permissions p on p.id = rp.permission_id
    join public.profiles pr on pr.id = urg.user_id
    where urg.user_id = (select auth.uid())
      and urg.revoked_at is null
      and pr.status = 'active'
      and p.code = permission_code
      and (
        (urg.merchant_id is null and merchant_scope is null)
        or (merchant_scope is not null and urg.merchant_id = merchant_scope)
      )
  );
$$;

revoke all on function private.has_permission(text, uuid) from public;
revoke all on function private.has_permission(text, uuid) from anon;
grant execute on function private.has_permission(text, uuid) to authenticated;

drop policy if exists profiles_read_self_or_admin on public.profiles;
create policy profiles_read_self_or_admin on public.profiles
for select to authenticated
using (id = (select auth.uid()) or private.has_permission('users.read'));

drop policy if exists merchants_read_scoped on public.merchants;
create policy merchants_read_scoped on public.merchants
for select to authenticated
using (
  private.has_permission('merchants.read')
  or private.has_permission('merchant.workspace', id)
);

drop policy if exists user_role_grants_read_self_or_admin on public.user_role_grants;
create policy user_role_grants_read_self_or_admin on public.user_role_grants
for select to authenticated
using (user_id = (select auth.uid()) or private.has_permission('access.manage'));

drop policy if exists audit_events_read_authorized on public.audit_events;
create policy audit_events_read_authorized on public.audit_events
for select to authenticated
using (private.has_permission('audit.read'));

drop policy if exists policy_sets_read_authorized on public.policy_sets;
create policy policy_sets_read_authorized on public.policy_sets
for select to authenticated
using (private.has_permission('policies.read'));

drop policy if exists policy_versions_read_authorized on public.policy_versions;
create policy policy_versions_read_authorized on public.policy_versions
for select to authenticated
using (private.has_permission('policies.read'));

drop policy if exists approval_requests_read_authorized on public.approval_requests;
create policy approval_requests_read_authorized on public.approval_requests
for select to authenticated
using (
  requested_by = (select auth.uid())
  or private.has_permission('approvals.read')
);

drop policy if exists approval_actions_read_authorized on public.approval_actions;
create policy approval_actions_read_authorized on public.approval_actions
for select to authenticated
using (
  actor_user_id = (select auth.uid())
  or private.has_permission('approvals.read')
);

drop function public.has_permission(text, uuid);

commit;

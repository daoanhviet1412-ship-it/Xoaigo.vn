-- XOÀI GO Core Platform — migration 0007
-- Enforce role-to-merchant scope invariants and prevent duplicate active grants.
begin;

create or replace function private.enforce_role_grant_scope()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  role_is_platform boolean;
  role_code text;
begin
  select is_platform_role, code into role_is_platform, role_code
  from public.roles where id = new.role_id;
  if not found then raise exception 'role_not_found'; end if;
  if role_is_platform and new.merchant_id is not null then
    raise exception 'platform_role_must_not_have_merchant_scope';
  end if;
  if role_code in ('merchant_owner', 'merchant_staff') and new.merchant_id is null then
    raise exception 'merchant_role_requires_merchant_scope';
  end if;
  if role_code = 'member' and new.merchant_id is not null then
    raise exception 'member_role_must_not_have_merchant_scope';
  end if;
  if tg_op = 'UPDATE' then
    if new.user_id <> old.user_id or new.role_id <> old.role_id
      or new.merchant_id is distinct from old.merchant_id
      or new.granted_by is distinct from old.granted_by
      or new.granted_at <> old.granted_at then
      raise exception 'role_grant_identity_is_immutable';
    end if;
    if old.revoked_at is not null and new.revoked_at is distinct from old.revoked_at then
      raise exception 'revoked_role_grant_is_immutable';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_role_grant_scope() from public, anon, authenticated;
create trigger user_role_grants_scope_guard before insert or update on public.user_role_grants
for each row execute function private.enforce_role_grant_scope();

create unique index user_role_grants_unique_active_scope_idx
on public.user_role_grants(user_id, role_id, coalesce(merchant_id, '00000000-0000-0000-0000-000000000000'::uuid))
where revoked_at is null;

create index approval_actions_request_created_idx on public.approval_actions(request_id, created_at desc);
create index approval_actions_actor_created_idx on public.approval_actions(actor_user_id, created_at desc);
create index approval_requests_requester_idx on public.approval_requests(requested_by, requested_at desc);
create index approval_requests_reviewer_idx on public.approval_requests(reviewed_by, reviewed_at desc) where reviewed_by is not null;
create index audit_events_merchant_occurred_idx on public.audit_events(merchant_id, occurred_at desc) where merchant_id is not null;
create index commerce_order_items_product_idx on public.commerce_order_items(product_id) where product_id is not null;
create index commerce_orders_campaign_idx on public.commerce_orders(campaign_id) where campaign_id is not null;
create index commerce_orders_location_idx on public.commerce_orders(location_id) where location_id is not null;
create index marketing_campaigns_created_by_idx on public.marketing_campaigns(created_by) where created_by is not null;
create index member_profiles_referred_by_idx on public.member_profiles(referred_by) where referred_by is not null;
create index merchant_products_category_idx on public.merchant_products(category_id) where category_id is not null;
create index merchant_products_created_by_idx on public.merchant_products(created_by) where created_by is not null;
create index merchants_approved_by_idx on public.merchants(approved_by) where approved_by is not null;
create index policy_sets_created_by_idx on public.policy_sets(created_by) where created_by is not null;
create index policy_versions_created_by_idx on public.policy_versions(created_by);
create index product_categories_parent_idx on public.product_categories(parent_id) where parent_id is not null;
create index role_permissions_permission_idx on public.role_permissions(permission_id);
create index user_role_grants_role_idx on public.user_role_grants(role_id);
create index user_role_grants_granted_by_idx on public.user_role_grants(granted_by) where granted_by is not null;
commit;

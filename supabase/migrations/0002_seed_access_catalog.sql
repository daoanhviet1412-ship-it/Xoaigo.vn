-- XOÀI GO Core Platform — migration 0002
-- Seeds permission/role catalog only. Does NOT grant any role to any user.
-- Bootstrap the first platform owner only after verifying the intended auth.users UUID.

begin;

insert into public.roles (code, name, is_platform_role) values
  ('platform_owner', 'Platform Owner', true),
  ('platform_admin', 'Platform Administrator', true),
  ('ops_manager', 'Operations Manager', true),
  ('ops_agent', 'Operations Agent', true),
  ('finance_manager', 'Finance Manager', true),
  ('finance_operator', 'Finance Operator', true),
  ('policy_reviewer', 'Policy Reviewer', true),
  ('merchant_owner', 'Merchant Owner', false),
  ('merchant_staff', 'Merchant Staff', false),
  ('member', 'Member', false)
on conflict (code) do update
set name = excluded.name, is_platform_role = excluded.is_platform_role;

insert into public.permissions (code, description) values
  ('users.read', 'Read member and user profiles'),
  ('access.manage', 'Manage platform roles and access grants'),
  ('merchants.read', 'Read all merchant records'),
  ('merchants.create', 'Create merchant records'),
  ('merchants.update', 'Update merchant records'),
  ('merchant.workspace', 'Access one scoped merchant workspace'),
  ('policies.read', 'Read policy sets and versions'),
  ('policies.write', 'Create policy drafts'),
  ('policies.submit', 'Submit policy changes for review'),
  ('approvals.read', 'Read approval requests and actions'),
  ('approvals.review', 'Review requests created by another actor'),
  ('audit.read', 'Read audit events'),
  ('budgets.read', 'Read marketing budgets and campaigns'),
  ('budgets.write', 'Create or amend budget proposals'),
  ('budgets.review', 'Review budget proposals'),
  ('orders.read', 'Read commerce orders'),
  ('points.read', 'Read points accounts and entries'),
  ('settlement.read', 'Read merchant obligations and settlement batches'),
  ('reports.read', 'Read operational and financial reports')
on conflict (code) do update
set description = excluded.description;

-- Role catalog is seeded conservatively. Actual role grants remain a controlled
-- administrative bootstrap task and are never inferred from email or signup.
with grants(role_code, permission_code) as (
  values
    ('platform_owner', 'users.read'),
    ('platform_owner', 'access.manage'),
    ('platform_owner', 'merchants.read'),
    ('platform_owner', 'merchants.create'),
    ('platform_owner', 'merchants.update'),
    ('platform_owner', 'policies.read'),
    ('platform_owner', 'policies.write'),
    ('platform_owner', 'policies.submit'),
    ('platform_owner', 'approvals.read'),
    ('platform_owner', 'approvals.review'),
    ('platform_owner', 'audit.read'),
    ('platform_owner', 'budgets.read'),
    ('platform_owner', 'budgets.write'),
    ('platform_owner', 'budgets.review'),
    ('platform_owner', 'orders.read'),
    ('platform_owner', 'points.read'),
    ('platform_owner', 'settlement.read'),
    ('platform_owner', 'reports.read'),

    ('platform_admin', 'users.read'),
    ('platform_admin', 'access.manage'),
    ('platform_admin', 'merchants.read'),
    ('platform_admin', 'merchants.create'),
    ('platform_admin', 'merchants.update'),
    ('platform_admin', 'policies.read'),
    ('platform_admin', 'approvals.read'),
    ('platform_admin', 'audit.read'),
    ('platform_admin', 'reports.read'),

    ('ops_manager', 'users.read'),
    ('ops_manager', 'merchants.read'),
    ('ops_manager', 'merchants.create'),
    ('ops_manager', 'merchants.update'),
    ('ops_manager', 'orders.read'),
    ('ops_manager', 'reports.read'),
    ('ops_manager', 'approvals.read'),

    ('ops_agent', 'merchants.read'),
    ('ops_agent', 'orders.read'),

    ('finance_manager', 'budgets.read'),
    ('finance_manager', 'budgets.write'),
    ('finance_manager', 'budgets.review'),
    ('finance_manager', 'settlement.read'),
    ('finance_manager', 'points.read'),
    ('finance_manager', 'reports.read'),
    ('finance_manager', 'approvals.read'),
    ('finance_manager', 'audit.read'),

    ('finance_operator', 'budgets.read'),
    ('finance_operator', 'settlement.read'),
    ('finance_operator', 'points.read'),

    ('policy_reviewer', 'policies.read'),
    ('policy_reviewer', 'approvals.read'),
    ('policy_reviewer', 'approvals.review'),
    ('policy_reviewer', 'audit.read'),

    ('merchant_owner', 'merchant.workspace'),
    ('merchant_staff', 'merchant.workspace'),
    ('member', 'users.read')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from grants g
join public.roles r on r.code = g.role_code
join public.permissions p on p.code = g.permission_code
on conflict do nothing;

-- No user_role_grants are inserted here. The first platform owner must be
-- assigned by a documented one-time bootstrap after verifying auth.users.id.

commit;

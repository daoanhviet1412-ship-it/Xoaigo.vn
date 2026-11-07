-- XOÀI GO Core Platform — migration 0001
-- Draft migration. Review and test against a disposable Supabase project before applying anywhere.
-- This file does not create a payment service, wallet, cash custody or payout flow.

begin;

create extension if not exists pgcrypto;

create type public.account_status as enum ('active', 'suspended', 'closed');
create type public.approval_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text,
  phone text,
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_platform_role boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete restrict,
  permission_id uuid not null references public.permissions(id) on delete restrict,
  primary key (role_id, permission_id)
);

create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  business_type text,
  tax_identifier text,
  status public.account_status not null default 'active',
  contact_phone text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_role_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  role_id uuid not null references public.roles(id) on delete restrict,
  merchant_id uuid references public.merchants(id) on delete restrict,
  granted_by uuid references public.profiles(id) on delete restrict,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  check (revoked_at is null or revoked_at >= granted_at)
);

create index user_role_grants_user_active_idx
  on public.user_role_grants(user_id, role_id) where revoked_at is null;
create index user_role_grants_merchant_active_idx
  on public.user_role_grants(merchant_id, user_id) where revoked_at is null;

create table public.audit_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references public.profiles(id) on delete restrict,
  actor_kind text not null check (actor_kind in ('user', 'system', 'provider')),
  action text not null,
  resource_type text not null,
  resource_id text,
  merchant_id uuid references public.merchants(id) on delete restrict,
  request_id text,
  idempotency_key text,
  outcome text not null check (outcome in ('success', 'denied', 'failure')),
  reason text,
  metadata jsonb not null default '{}'::jsonb
);

create index audit_events_occurred_at_idx on public.audit_events(occurred_at desc);
create index audit_events_actor_idx on public.audit_events(actor_user_id, occurred_at desc);
create index audit_events_resource_idx on public.audit_events(resource_type, resource_id);

create table public.policy_sets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete restrict
);

create table public.policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_set_id uuid not null references public.policy_sets(id) on delete restrict,
  version integer not null check (version > 0),
  config jsonb not null,
  status text not null check (status in ('draft', 'approved', 'superseded', 'withdrawn')),
  effective_from timestamptz,
  effective_until timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (policy_set_id, version),
  check (effective_until is null or effective_from is null or effective_until > effective_from)
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null,
  resource_type text not null,
  resource_id uuid,
  proposed_payload jsonb not null,
  reason text not null check (length(trim(reason)) > 0),
  status public.approval_status not null default 'pending',
  requested_by uuid not null references public.profiles(id) on delete restrict,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  effective_at timestamptz,
  check (reviewed_by is null or reviewed_by <> requested_by),
  check (
    (status = 'pending' and reviewed_by is null and reviewed_at is null)
    or (status in ('approved', 'rejected') and reviewed_by is not null and reviewed_at is not null)
    or status = 'cancelled'
  )
);

create index approval_requests_queue_idx
  on public.approval_requests(status, requested_at desc);

create table public.approval_actions (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.approval_requests(id) on delete restrict,
  actor_user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null check (action in ('submitted', 'approved', 'rejected', 'cancelled')),
  reason text,
  created_at timestamptz not null default now()
);

create or replace function public.has_permission(
  permission_code text,
  merchant_scope uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.user_role_grants urg
    join public.role_permissions rp on rp.role_id = urg.role_id
    join public.permissions p on p.id = rp.permission_id
    join public.profiles pr on pr.id = urg.user_id
    where urg.user_id = auth.uid()
      and urg.revoked_at is null
      and pr.status = 'active'
      and p.code = permission_code
      and (
        (urg.merchant_id is null and merchant_scope is null)
        or (merchant_scope is not null and urg.merchant_id = merchant_scope)
      )
  );
$$;

create or replace function public.prevent_audit_event_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'audit_events is append-only';
end;
$$;

create trigger audit_events_no_update
before update or delete on public.audit_events
for each row execute function public.prevent_audit_event_mutation();

create or replace function public.prevent_approval_action_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'approval_actions is append-only';
end;
$$;

create trigger approval_actions_no_update
before update or delete on public.approval_actions
for each row execute function public.prevent_approval_action_mutation();

create or replace function public.enforce_maker_checker()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status in ('approved', 'rejected') then
    if new.reviewed_by is null or new.reviewed_by = new.requested_by then
      raise exception 'maker-checker violation: requester cannot review own request';
    end if;
    if new.reviewed_at is null then
      new.reviewed_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger approval_requests_maker_checker
before insert or update on public.approval_requests
for each row execute function public.enforce_maker_checker();

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.merchants enable row level security;
alter table public.user_role_grants enable row level security;
alter table public.audit_events enable row level security;
alter table public.policy_sets enable row level security;
alter table public.policy_versions enable row level security;
alter table public.approval_requests enable row level security;
alter table public.approval_actions enable row level security;

create policy profiles_read_self_or_admin on public.profiles
for select to authenticated
using (id = auth.uid() or public.has_permission('users.read'));

create policy roles_read_authenticated on public.roles
for select to authenticated using (true);

create policy permissions_read_authenticated on public.permissions
for select to authenticated using (true);

create policy role_permissions_read_authenticated on public.role_permissions
for select to authenticated using (true);

create policy merchants_read_scoped on public.merchants
for select to authenticated
using (
  public.has_permission('merchants.read')
  or public.has_permission('merchant.workspace', id)
);

create policy user_role_grants_read_self_or_admin on public.user_role_grants
for select to authenticated
using (user_id = auth.uid() or public.has_permission('access.manage'));

create policy audit_events_read_authorized on public.audit_events
for select to authenticated
using (public.has_permission('audit.read'));

create policy policy_sets_read_authorized on public.policy_sets
for select to authenticated
using (public.has_permission('policies.read'));

create policy policy_versions_read_authorized on public.policy_versions
for select to authenticated
using (public.has_permission('policies.read'));

create policy approval_requests_read_authorized on public.approval_requests
for select to authenticated
using (
  requested_by = auth.uid()
  or public.has_permission('approvals.read')
);

create policy approval_actions_read_authorized on public.approval_actions
for select to authenticated
using (
  actor_user_id = auth.uid()
  or public.has_permission('approvals.read')
);

-- Intentionally no authenticated INSERT/UPDATE/DELETE policies are defined for
-- role grants, merchants, policies, approvals, audit events or approval actions.
-- Writes must be implemented through validated server-side commands using a
-- privileged server credential, with actor attribution and transaction checks.
-- Never expose the service-role key to a browser/client.

commit;

-- XOÀI GO Core Platform — migration 0006
-- Merchant, member, catalog, campaign and commerce-order foundations.
-- No payment execution, wallet, cash custody, settlement or point issuance is implemented here.
begin;

create type public.merchant_onboarding_status as enum ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended');
create type public.order_status as enum ('draft', 'placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled');
create type public.campaign_status as enum ('draft', 'scheduled', 'active', 'paused', 'ended', 'cancelled');
create type public.product_status as enum ('draft', 'active', 'hidden', 'archived');

alter table public.merchants
  add column onboarding_status public.merchant_onboarding_status not null default 'draft',
  add column slug text,
  add column description text,
  add column logo_url text,
  add column website_url text,
  add column approved_at timestamptz,
  add column approved_by uuid references public.profiles(id) on delete restrict;

create unique index merchants_slug_unique_idx on public.merchants(slug) where slug is not null;
create index merchants_onboarding_status_idx on public.merchants(onboarding_status, created_at desc);

create table public.merchant_locations (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete restrict,
  name text not null,
  address_line text,
  ward text,
  district text,
  city text not null default 'Đà Nẵng',
  latitude numeric(9,6),
  longitude numeric(9,6),
  phone text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);
create index merchant_locations_merchant_idx on public.merchant_locations(merchant_id);

create table public.member_profiles (
  user_id uuid primary key references public.profiles(id) on delete restrict,
  member_code text unique,
  joined_at timestamptz not null default now(),
  referral_code text unique,
  referred_by uuid references public.profiles(id) on delete restrict,
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.product_categories(id) on delete restrict,
  code text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.merchant_products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete restrict,
  category_id uuid references public.product_categories(id) on delete restrict,
  name text not null,
  description text,
  sku text,
  image_url text,
  price_amount bigint not null check (price_amount >= 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  status public.product_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, sku)
);
create index merchant_products_merchant_status_idx on public.merchant_products(merchant_id, status);

create table public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete restrict,
  name text not null,
  description text,
  status public.campaign_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index marketing_campaigns_merchant_status_idx on public.marketing_campaigns(merchant_id, status);

create table public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  member_user_id uuid not null references public.profiles(id) on delete restrict,
  merchant_id uuid not null references public.merchants(id) on delete restrict,
  location_id uuid references public.merchant_locations(id) on delete restrict,
  campaign_id uuid references public.marketing_campaigns(id) on delete restrict,
  status public.order_status not null default 'draft',
  currency char(3) not null default 'VND' check (currency = 'VND'),
  subtotal_amount bigint not null default 0 check (subtotal_amount >= 0),
  discount_amount bigint not null default 0 check (discount_amount >= 0),
  total_amount bigint not null default 0 check (total_amount >= 0),
  customer_note text,
  placed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_amount <= subtotal_amount),
  check (total_amount = subtotal_amount - discount_amount)
);
create index commerce_orders_member_idx on public.commerce_orders(member_user_id, created_at desc);
create index commerce_orders_merchant_idx on public.commerce_orders(merchant_id, status, created_at desc);

create table public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete restrict,
  product_id uuid references public.merchant_products(id) on delete restrict,
  product_name_snapshot text not null,
  sku_snapshot text,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price_amount bigint not null check (unit_price_amount >= 0),
  line_total_amount bigint not null check (line_total_amount >= 0),
  created_at timestamptz not null default now(),
  check (line_total_amount >= 0)
);
create index commerce_order_items_order_idx on public.commerce_order_items(order_id);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = public, private
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;

create trigger merchants_touch_updated_at before update on public.merchants
for each row execute function private.touch_updated_at();
create trigger merchant_locations_touch_updated_at before update on public.merchant_locations
for each row execute function private.touch_updated_at();
create trigger merchant_products_touch_updated_at before update on public.merchant_products
for each row execute function private.touch_updated_at();
create trigger marketing_campaigns_touch_updated_at before update on public.marketing_campaigns
for each row execute function private.touch_updated_at();
create trigger commerce_orders_touch_updated_at before update on public.commerce_orders
for each row execute function private.touch_updated_at();

alter table public.merchant_locations enable row level security;
alter table public.member_profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.merchant_products enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.commerce_order_items enable row level security;

create policy merchant_locations_read_scoped on public.merchant_locations
for select to authenticated
using (
  private.has_permission('merchants.read')
  or private.has_permission('merchant.workspace', merchant_id)
);
create policy member_profiles_read_self_or_admin on public.member_profiles
for select to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('users.read')
  or private.has_permission('members.read')
);
create policy product_categories_read_active on public.product_categories
for select to authenticated using (is_active = true);
create policy merchant_products_read_active_or_scoped on public.merchant_products
for select to authenticated
using (
  status = 'active'
  or private.has_permission('merchants.read')
  or private.has_permission('merchant.workspace', merchant_id)
);
create policy marketing_campaigns_read_scoped on public.marketing_campaigns
for select to authenticated
using (
  private.has_permission('merchants.read')
  or private.has_permission('merchant.workspace', merchant_id)
  or private.has_permission('campaigns.read')
);
create policy commerce_orders_read_member_or_merchant on public.commerce_orders
for select to authenticated
using (
  member_user_id = (select auth.uid())
  or private.has_permission('merchants.read')
  or private.has_permission('merchant.workspace', merchant_id)
  or private.has_permission('orders.read')
);
create policy commerce_order_items_read_parent_scope on public.commerce_order_items
for select to authenticated
using (
  exists (
    select 1 from public.commerce_orders o
    where o.id = order_id
      and (
        o.member_user_id = (select auth.uid())
        or private.has_permission('merchants.read')
        or private.has_permission('merchant.workspace', o.merchant_id)
        or private.has_permission('orders.read')
      )
  )
);

insert into public.permissions(code, description) values
 ('merchant.locations.read', 'Read merchant locations'),
 ('members.read', 'Read member directory and membership records'),
 ('catalog.read', 'Read active product catalog'),
 ('catalog.manage', 'Manage merchant product catalog'),
 ('campaigns.read', 'Read marketing campaigns'),
 ('campaigns.manage', 'Manage marketing campaign drafts'),
 ('orders.manage', 'Manage orders within assigned merchant scope')
on conflict (code) do update set description = excluded.description;

with grants(role_code, permission_code) as (
 values
 ('platform_owner','merchant.locations.read'),
 ('platform_owner','members.read'),
 ('platform_owner','catalog.read'),
 ('platform_owner','catalog.manage'),
 ('platform_owner','campaigns.read'),
 ('platform_owner','campaigns.manage'),
 ('platform_owner','orders.manage'),
 ('platform_admin','merchant.locations.read'),
 ('platform_admin','members.read'),
 ('platform_admin','catalog.read'),
 ('platform_admin','campaigns.read'),
 ('ops_manager','merchant.locations.read'),
 ('ops_manager','members.read'),
 ('ops_manager','catalog.read'),
 ('ops_manager','campaigns.read'),
 ('ops_manager','orders.manage'),
 ('ops_agent','merchant.locations.read'),
 ('ops_agent','catalog.read'),
 ('ops_agent','campaigns.read'),
 ('ops_agent','orders.manage'),
 ('merchant_owner','catalog.read'),
 ('merchant_owner','catalog.manage'),
 ('merchant_owner','campaigns.read'),
 ('merchant_owner','campaigns.manage'),
 ('merchant_owner','orders.manage'),
 ('merchant_staff','catalog.read'),
 ('merchant_staff','orders.manage')
)
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from grants g
join public.roles r on r.code = g.role_code
join public.permissions p on p.code = g.permission_code
on conflict do nothing;

commit;

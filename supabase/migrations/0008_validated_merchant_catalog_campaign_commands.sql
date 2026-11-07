-- XOÀI GO Core Platform — migration 0008
-- Validated server-side command functions for merchant, catalog and campaign drafts.
begin;

create or replace function public.admin_create_merchant(
  p_legal_name text,
  p_display_name text,
  p_business_type text default null,
  p_contact_phone text default null,
  p_contact_email text default null,
  p_slug text default null
)
returns uuid language plpgsql security definer
set search_path = public, auth, private
as $$
declare v_actor uuid := (select auth.uid()); v_merchant_id uuid;
begin
  if v_actor is null or not private.has_permission('merchants.create') then raise exception 'permission_denied'; end if;
  if length(trim(coalesce(p_legal_name,'')))=0 or length(trim(coalesce(p_display_name,'')))=0 then raise exception 'merchant_name_required'; end if;
  insert into public.merchants(legal_name,display_name,business_type,contact_phone,contact_email,slug,onboarding_status)
  values(trim(p_legal_name),trim(p_display_name),nullif(trim(p_business_type),''),nullif(trim(p_contact_phone),''),nullif(lower(trim(p_contact_email)),''),nullif(lower(trim(p_slug)),''),'draft')
  returning id into v_merchant_id;
  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,merchant_id,outcome,metadata)
  values(v_actor,'user','merchant.created','merchant',v_merchant_id::text,v_merchant_id,'success',jsonb_build_object('onboarding_status','draft'));
  return v_merchant_id;
end; $$;

create or replace function public.merchant_create_location(
  p_merchant_id uuid,p_name text,p_address_line text default null,p_ward text default null,
  p_district text default null,p_city text default 'Đà Nẵng',p_phone text default null,p_is_primary boolean default false
)
returns uuid language plpgsql security definer
set search_path = public, auth, private
as $$
declare v_actor uuid := (select auth.uid()); v_location_id uuid;
begin
  if v_actor is null or not (private.has_permission('merchants.update') or private.has_permission('merchant.workspace',p_merchant_id)) then raise exception 'permission_denied'; end if;
  if not exists(select 1 from public.merchants where id=p_merchant_id) then raise exception 'merchant_not_found'; end if;
  if length(trim(coalesce(p_name,'')))=0 then raise exception 'location_name_required'; end if;
  if p_is_primary then update public.merchant_locations set is_primary=false where merchant_id=p_merchant_id and is_primary=true; end if;
  insert into public.merchant_locations(merchant_id,name,address_line,ward,district,city,phone,is_primary)
  values(p_merchant_id,trim(p_name),nullif(trim(p_address_line),''),nullif(trim(p_ward),''),nullif(trim(p_district),''),coalesce(nullif(trim(p_city),''),'Đà Nẵng'),nullif(trim(p_phone),''),p_is_primary)
  returning id into v_location_id;
  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,merchant_id,outcome)
  values(v_actor,'user','merchant.location.created','merchant_location',v_location_id::text,p_merchant_id,'success');
  return v_location_id;
end; $$;

create or replace function public.merchant_create_product(
  p_merchant_id uuid,p_name text,p_price_amount bigint,p_category_id uuid default null,
  p_description text default null,p_sku text default null,p_image_url text default null
)
returns uuid language plpgsql security definer
set search_path = public, auth, private
as $$
declare v_actor uuid := (select auth.uid()); v_product_id uuid;
begin
  if v_actor is null or not private.has_permission('catalog.manage',p_merchant_id) then raise exception 'permission_denied'; end if;
  if length(trim(coalesce(p_name,'')))=0 or p_price_amount<0 then raise exception 'invalid_product'; end if;
  insert into public.merchant_products(merchant_id,name,price_amount,category_id,description,sku,image_url,status,created_by)
  values(p_merchant_id,trim(p_name),p_price_amount,p_category_id,nullif(trim(p_description),''),nullif(trim(p_sku),''),nullif(trim(p_image_url),''),'draft',v_actor)
  returning id into v_product_id;
  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,merchant_id,outcome)
  values(v_actor,'user','catalog.product.created','merchant_product',v_product_id::text,p_merchant_id,'success');
  return v_product_id;
end; $$;

create or replace function public.merchant_create_campaign(
  p_merchant_id uuid,p_name text,p_description text default null,p_starts_at timestamptz default null,p_ends_at timestamptz default null
)
returns uuid language plpgsql security definer
set search_path = public, auth, private
as $$
declare v_actor uuid := (select auth.uid()); v_campaign_id uuid;
begin
  if v_actor is null or not private.has_permission('campaigns.manage',p_merchant_id) then raise exception 'permission_denied'; end if;
  if length(trim(coalesce(p_name,'')))=0 then raise exception 'campaign_name_required'; end if;
  if p_ends_at is not null and p_starts_at is not null and p_ends_at<=p_starts_at then raise exception 'invalid_campaign_window'; end if;
  insert into public.marketing_campaigns(merchant_id,name,description,status,starts_at,ends_at,created_by)
  values(p_merchant_id,trim(p_name),nullif(trim(p_description),''),'draft',p_starts_at,p_ends_at,v_actor)
  returning id into v_campaign_id;
  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,merchant_id,outcome)
  values(v_actor,'user','campaign.created','marketing_campaign',v_campaign_id::text,p_merchant_id,'success');
  return v_campaign_id;
end; $$;

revoke all on function public.admin_create_merchant(text,text,text,text,text,text) from public,anon;
revoke all on function public.merchant_create_location(uuid,text,text,text,text,text,text,boolean) from public,anon;
revoke all on function public.merchant_create_product(uuid,text,bigint,uuid,text,text,text) from public,anon;
revoke all on function public.merchant_create_campaign(uuid,text,text,timestamptz,timestamptz) from public,anon;
grant execute on function public.admin_create_merchant(text,text,text,text,text,text) to authenticated;
grant execute on function public.merchant_create_location(uuid,text,text,text,text,text,text,boolean) to authenticated;
grant execute on function public.merchant_create_product(uuid,text,bigint,uuid,text,text,text) to authenticated;
grant execute on function public.merchant_create_campaign(uuid,text,text,timestamptz,timestamptz) to authenticated;
commit;

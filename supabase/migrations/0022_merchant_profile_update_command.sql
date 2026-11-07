-- XOÀI GO Core Platform — migration 0022
-- Audited merchant profile updates; onboarding/status transitions are intentionally excluded.

begin;

create or replace function private.admin_update_merchant(
  p_merchant_id uuid,
  p_legal_name text,
  p_display_name text,
  p_business_type text,
  p_contact_phone text,
  p_contact_email text,
  p_slug text
)
returns uuid language plpgsql security definer set search_path=''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_old public.merchants%rowtype;
  v_legal text := nullif(trim(coalesce(p_legal_name,'')),'');
  v_display text := nullif(trim(coalesce(p_display_name,'')),'');
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not exists(select 1 from public.profiles where id=v_actor and status='active') then raise exception 'account_not_active'; end if;
  if not private.has_permission('merchants.update',null) then raise exception 'permission_denied'; end if;
  if v_legal is null or v_display is null then raise exception 'merchant_names_required'; end if;
  select * into v_old from public.merchants where id=p_merchant_id for update;
  if not found then raise exception 'merchant_not_found'; end if;

  update public.merchants set
    legal_name=v_legal,
    display_name=v_display,
    business_type=nullif(trim(coalesce(p_business_type,'')),''),
    contact_phone=nullif(trim(coalesce(p_contact_phone,'')),''),
    contact_email=nullif(lower(trim(coalesce(p_contact_email,''))),''),
    slug=nullif(lower(trim(coalesce(p_slug,''))),''),
    updated_at=now()
  where id=p_merchant_id;

  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,merchant_id,outcome,metadata)
  values(v_actor,'user','merchant.profile_updated','merchant',p_merchant_id::text,p_merchant_id,'success',
    jsonb_build_object('changed_fields',jsonb_build_array('legal_name','display_name','business_type','contact_phone','contact_email','slug'),
      'onboarding_status_unchanged',true));
  return p_merchant_id;
end;
$$;

create or replace function public.admin_update_merchant(
  p_merchant_id uuid,p_legal_name text,p_display_name text,p_business_type text,
  p_contact_phone text,p_contact_email text,p_slug text
)
returns uuid language sql security invoker set search_path=''
as $$ select private.admin_update_merchant(p_merchant_id,p_legal_name,p_display_name,p_business_type,p_contact_phone,p_contact_email,p_slug); $$;

revoke all on function private.admin_update_merchant(uuid,text,text,text,text,text,text) from public,anon;
revoke all on function public.admin_update_merchant(uuid,text,text,text,text,text,text) from public,anon;
grant execute on function private.admin_update_merchant(uuid,text,text,text,text,text,text) to authenticated;
grant execute on function public.admin_update_merchant(uuid,text,text,text,text,text,text) to authenticated;

commit;

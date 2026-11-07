-- XOÀI GO Core Platform — migration 0015
-- Policy registry authoring commands. Drafts are records only; no activation occurs.

begin;

create or replace function private.admin_create_policy_set(
  p_code text,
  p_name text,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_id uuid;
  v_code text := lower(trim(coalesce(p_code, '')));
  v_name text := nullif(trim(coalesce(p_name, '')), '');
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not exists (select 1 from public.profiles where id=v_actor and status='active') then
    raise exception 'account_not_active';
  end if;
  if not private.has_permission('policies.write', null) then raise exception 'permission_denied'; end if;
  if v_code !~ '^[a-z][a-z0-9_]{2,63}$' then raise exception 'invalid_policy_code'; end if;
  if v_name is null or pg_catalog.length(v_name)>160 then raise exception 'valid_policy_name_required'; end if;

  insert into public.policy_sets(code,name,description,created_by)
  values(v_code,v_name,nullif(trim(coalesce(p_description,'')),''),v_actor)
  returning id into v_id;

  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,outcome,metadata)
  values(v_actor,'user','policy_set.created','policy_set',v_id::text,'success',
    jsonb_build_object('code',v_code,'name',v_name));
  return v_id;
end;
$$;

create or replace function public.admin_create_policy_set(
  p_code text,
  p_name text,
  p_description text default null
)
returns uuid language sql security invoker set search_path=''
as $$ select private.admin_create_policy_set(p_code,p_name,p_description); $$;

revoke all on function private.admin_create_policy_set(text,text,text) from public,anon;
revoke all on function public.admin_create_policy_set(text,text,text) from public,anon;
grant execute on function public.admin_create_policy_set(text,text,text) to authenticated;

create or replace function private.create_policy_version_draft(
  p_policy_set_id uuid,
  p_config jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_version integer;
  v_id uuid;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not exists (select 1 from public.profiles where id=v_actor and status='active') then
    raise exception 'account_not_active';
  end if;
  if not private.has_permission('policies.write', null) then raise exception 'permission_denied'; end if;
  if p_policy_set_id is null or not exists(select 1 from public.policy_sets where id=p_policy_set_id) then
    raise exception 'policy_set_not_found';
  end if;
  if p_config is null or jsonb_typeof(p_config)<>'object' then raise exception 'config_must_be_object'; end if;
  if pg_catalog.octet_length(p_config::text)>32768 then raise exception 'config_too_large'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_policy_set_id::text,0));
  select coalesce(max(version),0)+1 into v_version
    from public.policy_versions where policy_set_id=p_policy_set_id;

  insert into public.policy_versions(policy_set_id,version,config,status,created_by)
  values(p_policy_set_id,v_version,p_config,'draft',v_actor)
  returning id into v_id;

  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,outcome,metadata)
  values(v_actor,'user','policy_version.draft_created','policy_version',v_id::text,'success',
    jsonb_build_object('policy_set_id',p_policy_set_id,'version',v_version));
  return v_id;
end;
$$;

create or replace function public.create_policy_version_draft(
  p_policy_set_id uuid,
  p_config jsonb
)
returns uuid language sql security invoker set search_path=''
as $$ select private.create_policy_version_draft(p_policy_set_id,p_config); $$;

revoke all on function private.create_policy_version_draft(uuid,jsonb) from public,anon;
revoke all on function public.create_policy_version_draft(uuid,jsonb) from public,anon;
grant execute on function public.create_policy_version_draft(uuid,jsonb) to authenticated;

commit;

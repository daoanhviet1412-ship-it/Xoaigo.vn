-- XOÀI GO Core Platform — migration 0021
-- Idempotent policy and budget approval submission commands.

begin;

drop function public.submit_policy_approval_request(uuid,jsonb,text);
drop function private.submit_policy_approval_request(uuid,jsonb,text);
drop function public.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text);
drop function private.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text);

create function private.submit_policy_approval_request(
  p_policy_set_id uuid,
  p_proposed_config jsonb,
  p_reason text,
  p_idempotency_key text
)
returns uuid language plpgsql security definer set search_path=''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_request_id uuid;
  v_reason text := nullif(trim(coalesce(p_reason,'')),'');
  v_key text := nullif(trim(coalesce(p_idempotency_key,'')),'');
  v_payload jsonb;
  v_hash text;
  v_existing_hash text;
  v_existing_response jsonb;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not exists(select 1 from public.profiles where id=v_actor and status='active') then raise exception 'account_not_active'; end if;
  if not private.has_permission('policies.submit',null) then raise exception 'permission_denied'; end if;
  if p_policy_set_id is null or not exists(select 1 from public.policy_sets where id=p_policy_set_id) then raise exception 'policy_set_not_found'; end if;
  if p_proposed_config is null or jsonb_typeof(p_proposed_config)<>'object' then raise exception 'proposed_config_must_be_object'; end if;
  if pg_catalog.octet_length(p_proposed_config::text)>32768 then raise exception 'proposed_config_too_large'; end if;
  if v_reason is null or pg_catalog.length(v_reason)>2000 then raise exception 'valid_reason_required'; end if;
  if v_key is null or pg_catalog.length(v_key)<16 or pg_catalog.length(v_key)>128 then raise exception 'valid_idempotency_key_required'; end if;

  v_payload:=jsonb_build_object('policy_set_id',p_policy_set_id,'proposed_config',p_proposed_config,'reason',v_reason);
  v_hash:=pg_catalog.md5(v_payload::text)||pg_catalog.md5('xoai:'||v_payload::text);

  insert into public.idempotency_records(actor_user_id,scope,command,idempotency_key,request_hash,response_payload)
  values(v_actor,'approval','submit_policy',v_key,v_hash,'{}'::jsonb)
  on conflict do nothing;

  select request_hash,response_payload into v_existing_hash,v_existing_response
    from public.idempotency_records
   where actor_user_id=v_actor and scope='approval' and command='submit_policy' and idempotency_key=v_key
   for update;
  if v_existing_hash<>v_hash then raise exception 'idempotency_key_reused_with_different_payload'; end if;
  if v_existing_response ? 'request_id' then return (v_existing_response->>'request_id')::uuid; end if;

  insert into public.approval_requests(request_type,resource_type,resource_id,proposed_payload,reason,requested_by)
  values('policy_change','policy_set',p_policy_set_id,
    jsonb_build_object('policy_set_id',p_policy_set_id,'proposed_config',p_proposed_config),
    v_reason,v_actor)
  returning id into v_request_id;

  insert into public.approval_actions(request_id,actor_user_id,action,reason)
  values(v_request_id,v_actor,'submitted',v_reason);

  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,outcome,reason,idempotency_key,metadata)
  values(v_actor,'user','approval_request.submitted','approval_request',v_request_id::text,'success',v_reason,v_key,
    jsonb_build_object('request_type','policy_change','resource_type','policy_set','resource_id',p_policy_set_id));

  update public.idempotency_records set response_payload=jsonb_build_object('request_id',v_request_id)
   where actor_user_id=v_actor and scope='approval' and command='submit_policy' and idempotency_key=v_key;
  return v_request_id;
end;
$$;

create function public.submit_policy_approval_request(
  p_policy_set_id uuid,p_proposed_config jsonb,p_reason text,p_idempotency_key text
)
returns uuid language sql security invoker set search_path=''
as $$ select private.submit_policy_approval_request(p_policy_set_id,p_proposed_config,p_reason,p_idempotency_key); $$;

revoke all on function private.submit_policy_approval_request(uuid,jsonb,text,text) from public,anon;
revoke all on function public.submit_policy_approval_request(uuid,jsonb,text,text) from public,anon;
grant execute on function private.submit_policy_approval_request(uuid,jsonb,text,text) to authenticated;
grant execute on function public.submit_policy_approval_request(uuid,jsonb,text,text) to authenticated;

create function private.submit_budget_approval_request(
  p_merchant_id uuid,
  p_campaign_id uuid,
  p_amount numeric,
  p_currency text,
  p_funding_source text,
  p_purpose text,
  p_reason text,
  p_idempotency_key text
)
returns uuid language plpgsql security definer set search_path=''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_request_id uuid;
  v_currency text := upper(trim(coalesce(p_currency,'')));
  v_source text := nullif(trim(coalesce(p_funding_source,'')),'');
  v_purpose text := nullif(trim(coalesce(p_purpose,'')),'');
  v_reason text := nullif(trim(coalesce(p_reason,'')),'');
  v_key text := nullif(trim(coalesce(p_idempotency_key,'')),'');
  v_payload jsonb;
  v_hash text;
  v_existing_hash text;
  v_existing_response jsonb;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not exists(select 1 from public.profiles where id=v_actor and status='active') then raise exception 'account_not_active'; end if;
  if not private.has_permission('budgets.write',null) then raise exception 'permission_denied'; end if;
  if p_amount is null or p_amount<=0 or p_amount>999999999999999 then raise exception 'invalid_proposed_amount'; end if;
  if v_currency !~ '^[A-Z]{3}$' then raise exception 'invalid_currency_code'; end if;
  if v_source is null or pg_catalog.length(v_source)>160 then raise exception 'funding_source_required'; end if;
  if v_purpose is null or pg_catalog.length(v_purpose)>1000 then raise exception 'purpose_required'; end if;
  if v_reason is null or pg_catalog.length(v_reason)>2000 then raise exception 'reason_required'; end if;
  if v_key is null or pg_catalog.length(v_key)<16 or pg_catalog.length(v_key)>128 then raise exception 'valid_idempotency_key_required'; end if;
  if p_merchant_id is not null and not exists(select 1 from public.merchants where id=p_merchant_id) then raise exception 'merchant_not_found'; end if;
  if p_campaign_id is not null and not exists(select 1 from public.marketing_campaigns c where c.id=p_campaign_id and (p_merchant_id is null or c.merchant_id=p_merchant_id)) then raise exception 'campaign_not_found_or_scope_mismatch'; end if;

  v_payload:=jsonb_build_object('merchant_id',p_merchant_id,'campaign_id',p_campaign_id,'amount',p_amount,'currency',v_currency,'funding_source',v_source,'purpose',v_purpose,'reason',v_reason);
  v_hash:=pg_catalog.md5(v_payload::text)||pg_catalog.md5('xoai:'||v_payload::text);

  insert into public.idempotency_records(actor_user_id,scope,command,idempotency_key,request_hash,response_payload)
  values(v_actor,'approval','submit_budget',v_key,v_hash,'{}'::jsonb)
  on conflict do nothing;

  select request_hash,response_payload into v_existing_hash,v_existing_response
    from public.idempotency_records
   where actor_user_id=v_actor and scope='approval' and command='submit_budget' and idempotency_key=v_key
   for update;
  if v_existing_hash<>v_hash then raise exception 'idempotency_key_reused_with_different_payload'; end if;
  if v_existing_response ? 'request_id' then return (v_existing_response->>'request_id')::uuid; end if;

  insert into public.approval_requests(request_type,resource_type,resource_id,proposed_payload,reason,requested_by)
  values('marketing_budget_proposal',
    case when p_campaign_id is not null then 'marketing_campaign' when p_merchant_id is not null then 'merchant' else 'platform' end,
    coalesce(p_campaign_id,p_merchant_id),
    jsonb_build_object('merchant_id',p_merchant_id,'campaign_id',p_campaign_id,'proposed_amount',p_amount,'currency',v_currency,'funding_source',v_source,'purpose',v_purpose),
    v_reason,v_actor)
  returning id into v_request_id;

  insert into public.approval_actions(request_id,actor_user_id,action,reason)
  values(v_request_id,v_actor,'submitted',v_reason);

  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,merchant_id,outcome,reason,idempotency_key,metadata)
  values(v_actor,'user','budget_proposal.submitted','approval_request',v_request_id::text,p_merchant_id,'success',v_reason,v_key,
    jsonb_build_object('campaign_id',p_campaign_id,'proposed_amount',p_amount,'currency',v_currency));

  update public.idempotency_records set response_payload=jsonb_build_object('request_id',v_request_id)
   where actor_user_id=v_actor and scope='approval' and command='submit_budget' and idempotency_key=v_key;
  return v_request_id;
end;
$$;

create function public.submit_budget_approval_request(
  p_merchant_id uuid,p_campaign_id uuid,p_amount numeric,p_currency text,
  p_funding_source text,p_purpose text,p_reason text,p_idempotency_key text
)
returns uuid language sql security invoker set search_path=''
as $$ select private.submit_budget_approval_request(p_merchant_id,p_campaign_id,p_amount,p_currency,p_funding_source,p_purpose,p_reason,p_idempotency_key); $$;

revoke all on function private.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text,text) from public,anon;
revoke all on function public.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text,text) from public,anon;
grant execute on function private.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text,text) to authenticated;
grant execute on function public.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text,text) to authenticated;

commit;

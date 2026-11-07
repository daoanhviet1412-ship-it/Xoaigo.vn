-- XOÀI GO Core Platform — migration 0016
-- Marketing budget proposals are governance records only, not balances or transfers.

begin;

create or replace function private.submit_budget_approval_request(
  p_merchant_id uuid,
  p_campaign_id uuid,
  p_amount numeric,
  p_currency text,
  p_funding_source text,
  p_purpose text,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_request_id uuid;
  v_currency text := upper(trim(coalesce(p_currency,'')));
  v_source text := nullif(trim(coalesce(p_funding_source,'')), '');
  v_purpose text := nullif(trim(coalesce(p_purpose,'')), '');
  v_reason text := nullif(trim(coalesce(p_reason,'')), '');
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not exists(select 1 from public.profiles where id=v_actor and status='active') then
    raise exception 'account_not_active';
  end if;
  if not private.has_permission('budgets.write', null) then raise exception 'permission_denied'; end if;
  if p_amount is null or p_amount<=0 or p_amount>999999999999999 then raise exception 'invalid_proposed_amount'; end if;
  if v_currency !~ '^[A-Z]{3}$' then raise exception 'invalid_currency_code'; end if;
  if v_source is null or pg_catalog.length(v_source)>160 then raise exception 'funding_source_required'; end if;
  if v_purpose is null or pg_catalog.length(v_purpose)>1000 then raise exception 'purpose_required'; end if;
  if v_reason is null or pg_catalog.length(v_reason)>2000 then raise exception 'reason_required'; end if;
  if p_merchant_id is not null and not exists(select 1 from public.merchants where id=p_merchant_id) then
    raise exception 'merchant_not_found';
  end if;
  if p_campaign_id is not null and not exists(
    select 1 from public.marketing_campaigns c
    where c.id=p_campaign_id and (p_merchant_id is null or c.merchant_id=p_merchant_id)
  ) then raise exception 'campaign_not_found_or_scope_mismatch'; end if;

  insert into public.approval_requests(
    request_type,resource_type,resource_id,proposed_payload,reason,requested_by
  )
  values(
    'marketing_budget_proposal',
    case when p_campaign_id is not null then 'marketing_campaign' when p_merchant_id is not null then 'merchant' else 'platform' end,
    coalesce(p_campaign_id,p_merchant_id),
    jsonb_build_object(
      'merchant_id',p_merchant_id,
      'campaign_id',p_campaign_id,
      'proposed_amount',p_amount,
      'currency',v_currency,
      'funding_source',v_source,
      'purpose',v_purpose
    ),
    v_reason,
    v_actor
  )
  returning id into v_request_id;

  insert into public.approval_actions(request_id,actor_user_id,action,reason)
  values(v_request_id,v_actor,'submitted',v_reason);

  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,merchant_id,outcome,reason,metadata)
  values(v_actor,'user','budget_proposal.submitted','approval_request',v_request_id::text,p_merchant_id,'success',v_reason,
    jsonb_build_object('campaign_id',p_campaign_id,'proposed_amount',p_amount,'currency',v_currency));
  return v_request_id;
end;
$$;

create or replace function public.submit_budget_approval_request(
  p_merchant_id uuid,
  p_campaign_id uuid,
  p_amount numeric,
  p_currency text,
  p_funding_source text,
  p_purpose text,
  p_reason text
)
returns uuid language sql security invoker set search_path=''
as $$ select private.submit_budget_approval_request(p_merchant_id,p_campaign_id,p_amount,p_currency,p_funding_source,p_purpose,p_reason); $$;

revoke all on function private.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text) from public,anon;
revoke all on function public.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text) from public,anon;
grant execute on function public.submit_budget_approval_request(uuid,uuid,numeric,text,text,text,text) to authenticated;

create or replace function private.review_approval_request(
  p_request_id uuid,
  p_decision text,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_request public.approval_requests%rowtype;
  v_decision text := lower(trim(coalesce(p_decision, '')));
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if v_decision not in ('approved','rejected') then raise exception 'invalid_decision'; end if;
  if v_reason is null then raise exception 'review_reason_required'; end if;

  select * into v_request
    from public.approval_requests where id=p_request_id for update;
  if not found then raise exception 'approval_request_not_found'; end if;

  if v_request.request_type='marketing_budget_proposal' then
    if not private.has_permission('budgets.review',null) then raise exception 'permission_denied'; end if;
  elsif not private.has_permission('approvals.review',null) then
    raise exception 'permission_denied';
  end if;

  if v_request.requested_by=v_actor then raise exception 'maker_checker_violation'; end if;
  if v_request.status<>'pending' then raise exception 'approval_request_not_pending'; end if;

  update public.approval_requests
     set status=v_decision::public.approval_status,reviewed_by=v_actor,reviewed_at=now()
   where id=p_request_id;

  insert into public.approval_actions(request_id,actor_user_id,action,reason)
  values(p_request_id,v_actor,v_decision,v_reason);

  insert into public.audit_events(actor_user_id,actor_kind,action,resource_type,resource_id,outcome,reason,metadata)
  values(v_actor,'user','approval_request.'||v_decision,'approval_request',p_request_id::text,'success',v_reason,
    jsonb_build_object('request_type',v_request.request_type,'resource_type',v_request.resource_type,
      'resource_id',v_request.resource_id,'requested_by',v_request.requested_by));
  return p_request_id;
end;
$$;

revoke all on function private.review_approval_request(uuid,text,text) from public,anon,authenticated;
grant execute on function private.review_approval_request(uuid,text,text) to authenticated;

commit;

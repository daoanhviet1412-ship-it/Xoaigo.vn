-- XOÀI GO Core Platform — migration 0014
-- Submit a policy-set proposal into the maker-checker queue.
-- This records a proposal only; it never applies or activates policy configuration.

begin;

create or replace function private.submit_policy_approval_request(
  p_policy_set_id uuid,
  p_proposed_config jsonb,
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
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
begin
  if v_actor is null then
    raise exception 'authentication_required';
  end if;
  if not exists (
    select 1 from public.profiles
     where id = v_actor and status = 'active'
  ) then
    raise exception 'account_not_active';
  end if;
  if not private.has_permission('policies.submit', null) then
    raise exception 'permission_denied';
  end if;
  if p_policy_set_id is null or not exists (
    select 1 from public.policy_sets where id = p_policy_set_id
  ) then
    raise exception 'policy_set_not_found';
  end if;
  if p_proposed_config is null or jsonb_typeof(p_proposed_config) <> 'object' then
    raise exception 'proposed_config_must_be_object';
  end if;
  if pg_catalog.octet_length(p_proposed_config::text) > 32768 then
    raise exception 'proposed_config_too_large';
  end if;
  if v_reason is null or pg_catalog.length(v_reason) > 2000 then
    raise exception 'valid_reason_required';
  end if;

  insert into public.approval_requests(
    request_type, resource_type, resource_id, proposed_payload,
    reason, requested_by
  )
  values (
    'policy_change',
    'policy_set',
    p_policy_set_id,
    jsonb_build_object(
      'policy_set_id', p_policy_set_id,
      'proposed_config', p_proposed_config
    ),
    v_reason,
    v_actor
  )
  returning id into v_request_id;

  insert into public.approval_actions(request_id, actor_user_id, action, reason)
  values (v_request_id, v_actor, 'submitted', v_reason);

  insert into public.audit_events(
    actor_user_id, actor_kind, action, resource_type, resource_id,
    outcome, reason, metadata
  )
  values (
    v_actor, 'user', 'approval_request.submitted', 'approval_request',
    v_request_id::text, 'success', v_reason,
    jsonb_build_object(
      'request_type', 'policy_change',
      'resource_type', 'policy_set',
      'resource_id', p_policy_set_id
    )
  );

  return v_request_id;
end;
$$;

revoke all on function private.submit_policy_approval_request(uuid, jsonb, text) from public, anon;
grant execute on function private.submit_policy_approval_request(uuid, jsonb, text) to authenticated;

create or replace function public.submit_policy_approval_request(
  p_policy_set_id uuid,
  p_proposed_config jsonb,
  p_reason text
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.submit_policy_approval_request(
    p_policy_set_id, p_proposed_config, p_reason
  );
$$;

revoke all on function public.submit_policy_approval_request(uuid, jsonb, text) from public, anon;
grant execute on function public.submit_policy_approval_request(uuid, jsonb, text) to authenticated;

commit;

-- XOÀI GO Core Platform — migration 0013
-- Controlled maker-checker decision command. Approval changes are recorded
-- append-only and do not automatically execute the proposed business payload.

begin;

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
  if v_actor is null then
    raise exception 'authentication_required';
  end if;
  if not private.has_permission('approvals.review', null) then
    raise exception 'permission_denied';
  end if;
  if v_decision not in ('approved', 'rejected') then
    raise exception 'invalid_decision';
  end if;
  if v_reason is null then
    raise exception 'review_reason_required';
  end if;

  select * into v_request
    from public.approval_requests
   where id = p_request_id
   for update;

  if not found then
    raise exception 'approval_request_not_found';
  end if;
  if v_request.requested_by = v_actor then
    raise exception 'maker_checker_violation';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'approval_request_not_pending';
  end if;

  update public.approval_requests
     set status = v_decision::public.approval_status,
         reviewed_by = v_actor,
         reviewed_at = now()
   where id = p_request_id;

  insert into public.approval_actions(request_id, actor_user_id, action, reason)
  values (p_request_id, v_actor, v_decision, v_reason);

  insert into public.audit_events(
    actor_user_id, actor_kind, action, resource_type, resource_id,
    outcome, reason, metadata
  )
  values (
    v_actor, 'user', 'approval_request.' || v_decision, 'approval_request',
    p_request_id::text, 'success', v_reason,
    jsonb_build_object(
      'request_type', v_request.request_type,
      'resource_type', v_request.resource_type,
      'resource_id', v_request.resource_id,
      'requested_by', v_request.requested_by
    )
  );

  return p_request_id;
end;
$$;

revoke all on function private.review_approval_request(uuid, text, text) from public, anon;
grant execute on function private.review_approval_request(uuid, text, text) to authenticated;

create or replace function public.review_approval_request(
  p_request_id uuid,
  p_decision text,
  p_reason text
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.review_approval_request(p_request_id, p_decision, p_reason);
$$;

revoke all on function public.review_approval_request(uuid, text, text) from public, anon;
grant execute on function public.review_approval_request(uuid, text, text) to authenticated;

commit;

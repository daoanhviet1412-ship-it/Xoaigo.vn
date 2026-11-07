# XOÀI GO — First Platform Owner Bootstrap

This is a controlled one-time operator procedure for the dedicated Supabase project **Xoaigovn**.

## Preconditions

- Confirm the Supabase dashboard project reference is `ozqluwawvasrsiydgeci`.
- Confirm the account was created/invited in Supabase Auth by an authorized operator.
- Verify the email identity with the account owner out-of-band.
- Confirm `auth.users.email_confirmed_at` is not null.
- Do not use this procedure on VGarden or any other Supabase project.
- Never paste service-role keys, passwords, OTPs or recovery codes into Git, Notion or chat.

## Procedure

1. In Supabase Dashboard, open Authentication → Users.
2. Invite/create the intended owner identity and complete the provider's email verification flow.
3. Copy the UUID of that exact Auth user. Do not use email as a role identifier.
4. Open SQL Editor for **Xoaigovn** only.
5. Replace the two UUID placeholders in the transaction below with the verified Auth user UUID. The same UUID is intentionally used as `granted_by` for this one-time bootstrap.
6. Run once and inspect the returned grant. Do not rerun if an active platform owner already exists.

```sql
begin;

do $bootstrap$
declare
  v_user_id uuid := 'REPLACE_WITH_VERIFIED_AUTH_USER_UUID'::uuid;
  v_role_id uuid;
  v_grant_id uuid;
begin
  if not exists (
    select 1
    from auth.users
    where id = v_user_id
      and email_confirmed_at is not null
  ) then
    raise exception 'verified_auth_user_not_found';
  end if;

  if exists (
    select 1
    from public.user_role_grants urg
    join public.roles r on r.id = urg.role_id
    where r.code = 'platform_owner'
      and urg.revoked_at is null
  ) then
    raise exception 'active_platform_owner_already_exists';
  end if;

  select id into strict v_role_id
  from public.roles
  where code = 'platform_owner' and is_platform_role = true;

  insert into public.user_role_grants(user_id, role_id, merchant_id, granted_by)
  values (v_user_id, v_role_id, null, v_user_id)
  returning id into v_grant_id;

  insert into public.audit_events(
    actor_user_id, actor_kind, action, resource_type, resource_id,
    outcome, reason, metadata
  ) values (
    v_user_id, 'user', 'platform_owner.bootstrapped', 'user_role_grant',
    v_grant_id::text, 'success',
    'One-time first platform owner bootstrap',
    jsonb_build_object('role_code', 'platform_owner', 'bootstrap', true)
  );

  raise notice 'platform_owner_grant_id=%', v_grant_id;
end
$bootstrap$;

commit;
```

## Verification

Run these read-only checks after bootstrap:

```sql
select
  u.id,
  u.email,
  u.email_confirmed_at,
  r.code as role_code,
  urg.granted_at,
  urg.revoked_at
from public.user_role_grants urg
join auth.users u on u.id = urg.user_id
join public.roles r on r.id = urg.role_id
where r.code = 'platform_owner'
order by urg.granted_at desc;
```

Then sign in at the feature Preview's `/admin/login` route. The app checks the Auth session, active profile and platform role; it does not trust a frontend role selector.

## Security notes

- This is not a general role-grant mechanism. It is a first-owner bootstrap only.
- Normal role grants/revocations must be implemented through a maker-checker workflow and audited server-side.
- Do not add the user UUID, email, or any personal identifier to source code.
- If the wrong user is selected, stop and revoke access through an audited operator procedure before continuing.

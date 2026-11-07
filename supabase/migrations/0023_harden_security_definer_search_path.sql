-- XOAI GO Core Platform — migration 0023
-- Harden SECURITY DEFINER routines by removing mutable schemas from search_path.
-- All referenced relations/functions in these routines are schema-qualified.
begin;

alter function private.admin_create_merchant(text,text,text,text,text,text) set search_path = '';
alter function private.enforce_role_grant_scope() set search_path = '';
alter function private.handle_new_auth_user() set search_path = '';
alter function private.has_permission(text,uuid) set search_path = '';
alter function private.merchant_create_campaign(uuid,text,text,timestamptz,timestamptz) set search_path = '';
alter function private.merchant_create_location(uuid,text,text,text,text,text,text,boolean) set search_path = '';
alter function private.merchant_create_product(uuid,text,bigint,uuid,text,text,text) set search_path = '';

commit;

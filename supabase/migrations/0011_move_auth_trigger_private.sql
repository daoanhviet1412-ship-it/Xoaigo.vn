-- XOÀI GO Core Platform — migration 0011
-- Move auth trigger implementation out of the exposed public API schema.
begin;
create or replace function private.handle_new_auth_user()
returns trigger language plpgsql security definer
set search_path=public,auth,private
as $$
begin
 insert into public.profiles(id,display_name,phone)
 values(new.id,nullif(trim(coalesce(new.raw_user_meta_data->>'full_name','')),''),nullif(trim(coalesce(new.phone,'')),''))
 on conflict(id) do nothing;
 return new;
end;
$$;
revoke all on function private.handle_new_auth_user() from public,anon,authenticated;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
for each row execute function private.handle_new_auth_user();
drop function if exists public.handle_new_auth_user();
commit;
-- XOÀI GO Core Platform — migration 0012
-- Create a member directory profile for every new Auth identity; do not grant roles.
begin;
create or replace function private.handle_new_auth_user()
returns trigger language plpgsql security definer
set search_path=public,auth,private
as $$
begin
 insert into public.profiles(id,display_name,phone)
 values(new.id,nullif(trim(coalesce(new.raw_user_meta_data->>'full_name','')),''),nullif(trim(coalesce(new.phone,'')),''))
 on conflict(id) do nothing;
 insert into public.member_profiles(user_id)
 values(new.id)
 on conflict(user_id) do nothing;
 return new;
end;
$$;
revoke all on function private.handle_new_auth_user() from public,anon,authenticated;
commit;
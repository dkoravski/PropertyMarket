-- =====================================================
-- Migration: add_profiles_on_auth_signup_trigger
-- Purpose : Auto-create profile row when a new auth user signs up
-- =====================================================

begin;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Потребител'),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    'user'::public.user_role
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone);

  return new;
end;
$$;

comment on function public.handle_new_user_profile() is
'Creates/updates public.profiles row after new auth.users signup.';

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute procedure public.handle_new_user_profile();

commit;

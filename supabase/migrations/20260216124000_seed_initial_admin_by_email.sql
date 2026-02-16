-- =====================================================
-- Migration: seed_initial_admin_by_email
-- Purpose : Promote a specific user to admin by email
-- Note    : Change v_admin_email below to your real admin email before production
-- =====================================================

begin;

do $$
declare
  v_admin_email text := 'admin@propertymarket.bg';
begin
  insert into public.profiles (id, email, full_name, role)
  select
    au.id,
    au.email,
    coalesce(nullif(trim(au.raw_user_meta_data ->> 'full_name'), ''), 'Администратор'),
    'admin'::public.user_role
  from auth.users au
  where lower(au.email) = lower(v_admin_email)
  on conflict (id)
  do update set
    email = excluded.email,
    role = 'admin'::public.user_role;

  if not exists (
    select 1
    from public.profiles p
    where lower(p.email::text) = lower(v_admin_email)
      and p.role = 'admin'::public.user_role
  ) then
    raise notice 'Admin seed skipped: no user/profile found for email %', v_admin_email;
  end if;
end $$;

commit;

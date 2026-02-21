-- =====================================================
-- Migration: hide_properties_of_inactive_users
-- Purpose : Public/authenticated users cannot see
--           listings owned by deactivated accounts.
--           Admins retain full visibility.
-- =====================================================

begin;

drop policy if exists properties_select_public on public.properties;
create policy properties_select_public
on public.properties
for select
using (
  -- Admins see everything
  public.is_admin()
  -- Others only see properties of active users
  or exists (
    select 1 from public.profiles
    where id = properties.owner_id
      and is_active = true
  )
);

commit;

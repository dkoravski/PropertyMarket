-- =====================================================
-- Migration: allow_public_profile_read_for_property_owners
-- Purpose : Allow reading basic profile info of property owners
--           so the Property Details page can show contact info.
-- =====================================================

begin;

-- Drop old restrictive policy
drop policy if exists profiles_select_own_or_admin on public.profiles;

-- New policy: allow reading profiles of users who have at least one property
create policy profiles_select_own_or_admin
on public.profiles
for select
using (
  -- Own profile
  auth.uid() = id
  -- Admin can read all
  or public.is_admin()
  -- Anyone can read profiles of users who have published properties (public owners)
  or exists (
    select 1 from public.properties p
    where p.owner_id = profiles.id
  )
);

commit;

-- =====================================================
-- Migration: add_is_active_to_properties
-- Purpose : Allow admins and owners to deactivate
--           individual property listings without deleting them.
-- =====================================================

begin;

-- Add is_active column (default true = all existing listings are active)
alter table public.properties
  add column if not exists is_active boolean not null default true;

-- Update the public select policy to also hide inactive properties
drop policy if exists properties_select_public on public.properties;
create policy properties_select_public
on public.properties
for select
using (
  -- Admins see everything
  public.is_admin()
  -- Owner can always see their own (even inactive)
  or auth.uid() = owner_id
  -- Others only see active properties of active users
  or (
    is_active = true
    and public.is_user_active(owner_id)
  )
);

-- Allow owners to update is_active on their own properties
drop policy if exists properties_update_owner_or_admin on public.properties;
create policy properties_update_owner_or_admin
on public.properties
for update
to authenticated
using (
  auth.uid() = owner_id
  or public.is_admin()
)
with check (
  (auth.uid() = owner_id and public.is_active_user())
  or public.is_admin()
);

commit;

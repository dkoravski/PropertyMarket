-- =====================================================
-- Migration: fix_rls_circular_dependency
-- Purpose : The properties_select_public policy queried
--           public.profiles directly, creating a circular
--           RLS dependency with profiles_select_own_or_admin.
--           Fix: use a security definer function that
--           bypasses RLS when checking is_active.
-- =====================================================

begin;

-- Helper: check if a given user is active (bypasses RLS)
create or replace function public.is_user_active(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_active from public.profiles where id = user_id),
    true  -- fallback: treat unknown users as active (e.g. during signup)
  );
$$;

-- Recreate the policy using the security definer function (no circular dep)
drop policy if exists properties_select_public on public.properties;
create policy properties_select_public
on public.properties
for select
using (
  public.is_admin()
  or public.is_user_active(owner_id)
);

commit;

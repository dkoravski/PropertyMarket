-- =====================================================
-- Migration: add_is_active_to_profiles
-- Purpose : Allow admins to deactivate/activate users
--           without permanently deleting their data.
-- =====================================================

begin;

-- Add is_active column (default true = all existing users are active)
alter table public.profiles
  add column if not exists is_active boolean not null default true;

commit;

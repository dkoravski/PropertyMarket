-- =====================================================
-- Migration: promote_user_to_admin_v2
-- Purpose : Promote specific user email to 'admin' role
-- Note    : User MUST already exist in Auth/Profiles!
-- =====================================================

begin;

update public.profiles
set role = 'admin'::public.user_role
where lower(email) = lower('admin@propertymarket.com');

commit;

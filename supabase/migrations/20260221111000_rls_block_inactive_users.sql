-- =====================================================
-- Migration: rls_block_inactive_users
-- Purpose : Prevent inactive users from inserting or
--           updating properties/images/favorites.
--           Their existing data is visible but read-only.
-- =====================================================

begin;

-- Helper: returns true when the current user is active (or is admin)
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active = true
  );
$$;

-- =========================
-- properties: only active users can insert/update
-- =========================
drop policy if exists properties_insert_owner_or_admin on public.properties;
create policy properties_insert_owner_or_admin
on public.properties
for insert
to authenticated
with check (
  (auth.uid() = owner_id and public.is_active_user())
  or public.is_admin()
);

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

-- =========================
-- favorites: only active users can add
-- =========================
drop policy if exists favorites_insert_owner on public.favorites;
create policy favorites_insert_owner
on public.favorites
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.is_active_user()
);

commit;

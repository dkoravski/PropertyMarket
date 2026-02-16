-- =====================================================
-- Migration: enable_rls_and_policies
-- Purpose : Supabase RLS policies for PropertyMarket tables
-- =====================================================

begin;

-- Helper function used in policies to check admin role.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- =========================
-- Enable RLS
-- =========================
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.favorites enable row level security;

-- =========================
-- profiles policies
-- users: read/update own profile
-- admin: read/update all profiles
-- =========================

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
using (
  auth.uid() = id
  or public.is_admin()
);

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
on public.profiles
for update
using (
  auth.uid() = id
  or public.is_admin()
)
with check (
  auth.uid() = id
  or public.is_admin()
);

-- Needed when app creates profile row after signup
-- Users can create only their own profile row; admin can create any.
drop policy if exists profiles_insert_own_or_admin on public.profiles;
create policy profiles_insert_own_or_admin
on public.profiles
for insert
with check (
  auth.uid() = id
  or public.is_admin()
);

-- Optional: restrict delete to admins only
drop policy if exists profiles_delete_admin_only on public.profiles;
create policy profiles_delete_admin_only
on public.profiles
for delete
using (public.is_admin());

-- =========================
-- properties policies
-- everyone: read
-- owners/admin: insert, update, delete
-- =========================

drop policy if exists properties_select_public on public.properties;
create policy properties_select_public
on public.properties
for select
to anon, authenticated
using (true);

drop policy if exists properties_insert_owner_or_admin on public.properties;
create policy properties_insert_owner_or_admin
on public.properties
for insert
to authenticated
with check (
  auth.uid() = owner_id
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
  auth.uid() = owner_id
  or public.is_admin()
);

drop policy if exists properties_delete_owner_or_admin on public.properties;
create policy properties_delete_owner_or_admin
on public.properties
for delete
to authenticated
using (
  auth.uid() = owner_id
  or public.is_admin()
);

-- =========================
-- property_images policies
-- everyone: read
-- property owners/admin: insert, update, delete
-- =========================

drop policy if exists property_images_select_public on public.property_images;
create policy property_images_select_public
on public.property_images
for select
to anon, authenticated
using (true);

drop policy if exists property_images_insert_owner_or_admin on public.property_images;
create policy property_images_insert_owner_or_admin
on public.property_images
for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists property_images_update_owner_or_admin on public.property_images;
create policy property_images_update_owner_or_admin
on public.property_images
for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.owner_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists property_images_delete_owner_or_admin on public.property_images;
create policy property_images_delete_owner_or_admin
on public.property_images
for delete
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.owner_id = auth.uid()
  )
);

-- =========================
-- favorites policies
-- users: create/delete/read own favorites
-- admin: manage all
-- =========================

drop policy if exists favorites_select_own_or_admin on public.favorites;
create policy favorites_select_own_or_admin
on public.favorites
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

drop policy if exists favorites_insert_own_or_admin on public.favorites;
create policy favorites_insert_own_or_admin
on public.favorites
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_admin()
);

drop policy if exists favorites_update_own_or_admin on public.favorites;
create policy favorites_update_own_or_admin
on public.favorites
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
)
with check (
  auth.uid() = user_id
  or public.is_admin()
);

drop policy if exists favorites_delete_own_or_admin on public.favorites;
create policy favorites_delete_own_or_admin
on public.favorites
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

commit;

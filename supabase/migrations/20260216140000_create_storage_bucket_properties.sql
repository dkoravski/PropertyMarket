-- =====================================================
-- Migration: create_storage_bucket_properties
-- Purpose : Create Supabase Storage bucket for property images
--           and set up security policies (RLS).
-- =====================================================

begin;

-- 1. Create the storage bucket 'properties'
insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do nothing;

-- 2. Policy: Public access to view images (SELECT)
drop policy if exists "Public Access for Properties Images" on storage.objects;
create policy "Public Access for Properties Images"
on storage.objects for select
to public
using ( bucket_id = 'properties' );

-- 3. Policy: Authenticated users can upload images (INSERT)
drop policy if exists "Authenticated Users Can Upload Images" on storage.objects;
create policy "Authenticated Users Can Upload Images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'properties' );

-- 4. Policy: Authenticated users can update their own images (UPDATE)
drop policy if exists "Users Can Update Own Images" on storage.objects;
create policy "Users Can Update Own Images"
on storage.objects for update
to authenticated
using ( bucket_id = 'properties' and auth.uid() = owner )
with check ( bucket_id = 'properties' and auth.uid() = owner );

-- 5. Policy: Authenticated users can delete their own images (DELETE)
drop policy if exists "Users Can Delete Own Images" on storage.objects;
create policy "Users Can Delete Own Images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'properties' and auth.uid() = owner );

-- 6. Policy: Admins can do anything (ALL)
drop policy if exists "Admins Power Access" on storage.objects;
create policy "Admins Power Access"
on storage.objects for all
to authenticated
using ( bucket_id = 'properties' and public.is_admin() )
with check ( bucket_id = 'properties' and public.is_admin() );

commit;

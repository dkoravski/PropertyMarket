-- =====================================================
-- Migration: create_propertymarket_schema
-- Purpose : Core database structure for PropertyMarket
-- =====================================================

begin;

-- Required for gen_random_uuid() and case-insensitive email type
create extension if not exists pgcrypto;
create extension if not exists citext;

-- =========================
-- ENUM types
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'property_type') then
    create type public.property_type as enum ('apartment', 'house', 'villa', 'guest_house');
  end if;

  if not exists (select 1 from pg_type where typname = 'listing_type') then
    create type public.listing_type as enum ('sale', 'rent');
  end if;
end $$;

-- =========================
-- profiles
-- =========================
create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id) on delete cascade,
  email citext not null unique,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  phone text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

comment on table public.profiles is
'Application profile linked 1:1 to auth.users. Role is used for authorization logic.';
comment on column public.profiles.id is
'Same value as auth.users.id.';
comment on column public.profiles.email is
'Denormalized user email for fast reads and display.';
comment on column public.profiles.role is
'Allowed values: user, admin.';

-- =========================
-- properties
-- =========================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null
    references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 5 and 160),
  description text not null check (char_length(trim(description)) >= 20),
  property_type public.property_type not null,
  listing_type public.listing_type not null,
  price numeric(12,2) not null check (price > 0),
  city text not null check (char_length(trim(city)) >= 2),
  address text not null check (char_length(trim(address)) >= 5),
  area_sq_m numeric(10,2) not null check (area_sq_m > 0),
  rooms integer not null check (rooms > 0),
  created_at timestamptz not null default now()
);

comment on table public.properties is
'Property listings for sale/rent. Publicly readable, writable by owner/admin via RLS.';
comment on column public.properties.owner_id is
'Profile/user that owns this listing.';

-- =========================
-- property_images
-- =========================
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null
    references public.properties(id) on delete cascade,
  image_url text not null,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  constraint property_images_url_not_empty check (char_length(trim(image_url)) > 0)
);

comment on table public.property_images is
'Image URLs for properties (typically Supabase Storage public/signed paths).';
comment on column public.property_images.is_cover is
'When true, marks the primary cover image for that property.';

-- At most one cover image per property
create unique index if not exists uq_property_images_one_cover_per_property
  on public.property_images(property_id)
  where is_cover = true;

-- =========================
-- favorites
-- =========================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id) on delete cascade,
  property_id uuid not null
    references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_favorites_user_property unique (user_id, property_id)
);

comment on table public.favorites is
'Wishlist relation between users and properties.';

-- =========================
-- Indexes for common queries
-- =========================

-- properties listing/sorting/filtering
create index if not exists idx_properties_created_at_desc
  on public.properties (created_at desc);
create index if not exists idx_properties_owner_id
  on public.properties (owner_id);
create index if not exists idx_properties_city
  on public.properties (city);
create index if not exists idx_properties_property_type
  on public.properties (property_type);
create index if not exists idx_properties_listing_type
  on public.properties (listing_type);
create index if not exists idx_properties_price
  on public.properties (price);

-- property_images by property
create index if not exists idx_property_images_property_id
  on public.property_images (property_id);

-- favorites by user/property
create index if not exists idx_favorites_user_id
  on public.favorites (user_id);
create index if not exists idx_favorites_property_id
  on public.favorites (property_id);

commit;

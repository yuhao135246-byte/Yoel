-- ============================================================
-- products-v1.sql
-- Safe product catalog for Cadence MVP
--
-- Purpose:
--   1) Create a dedicated public.products table
--   2) Keep slug as the stable product ID
--   3) Use is_active = false for soft delete / unpublish
--   4) Do not change orders, inventory, or reservations
--
-- Important:
--   Inventory remains completely separate in public.inventory.
--   initial_stock is intentionally NOT stored in products.
-- ============================================================

create table if not exists public.products (

  slug text primary key,

  name text not null,

  category text not null
    check (category in ('COFFEE', 'OBJECT', 'RESEARCH')),

  layer text,

  subtitle text,

  price numeric(10,2) not null default 0
    check (price >= 0),

  currency text not null default '¥',

  unit text,

  availability text not null default 'Available',

  description text,

  image text,

  is_active boolean not null default true,

  is_available boolean not null default true,

  sort_order integer not null default 0,

  origin text,

  farm text,

  variety text,

  process text,

  altitude text,

  tasting_notes text,

  details jsonb not null default '[]'::jsonb,

  tags jsonb not null default '[]'::jsonb,

  inventory_items jsonb not null default '[]'::jsonb,

  option_groups jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()

);

create index if not exists idx_products_active_sort
  on public.products (is_active, sort_order);

create index if not exists idx_products_category_active
  on public.products (category, is_active);

create index if not exists idx_products_available
  on public.products (is_available);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;

create trigger products_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

create or replace function public.prevent_product_slug_change()
returns trigger
language plpgsql
as $$
begin
  if old.slug is distinct from new.slug then
    raise exception 'slug is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists products_slug_immutable on public.products;

create trigger products_slug_immutable
before update on public.products
for each row
when (old.slug is distinct from new.slug)
execute function public.prevent_product_slug_change();

alter table public.products enable row level security;

drop policy if exists "products_read_active" on public.products;

create policy "products_read_active"
on public.products
for select
using (is_active = true);

drop policy if exists "products_no_anon_insert" on public.products;

create policy "products_no_anon_insert"
on public.products
for insert
with check (false);

drop policy if exists "products_no_anon_update" on public.products;

create policy "products_no_anon_update"
on public.products
for update
using (false)
with check (false);

drop policy if exists "products_no_anon_delete" on public.products;

create policy "products_no_anon_delete"
on public.products
for delete
using (false);

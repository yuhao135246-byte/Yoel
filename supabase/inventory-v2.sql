-- inventory-v2.sql
-- Replaces function definitions only. Table structure and triggers are unchanged.
-- Run this in the Supabase SQL Editor to update both functions.

create table if not exists public.inventory_reservations (
  order_id uuid not null,
  product_id text not null,
  delivery_date date not null,
  quantity integer not null,
  created_at timestamptz not null default now(),
  constraint inventory_reservations_pk primary key (order_id, product_id, delivery_date),
  constraint inventory_reservations_quantity_positive check (quantity > 0)
);

-- ---------------------------------------------------------------------------
-- set_inventory_total_stock
-- ---------------------------------------------------------------------------
create or replace function public.set_inventory_total_stock(
  p_product_id  text,
  p_delivery_date date,
  p_total_stock integer
)
returns table (
  product_id    text,
  delivery_date date,
  total_stock   integer,
  sold_quantity integer,
  remaining_stock integer,
  status        text
)
language plpgsql
as $$
-- #variable_conflict use_column tells PL/pgSQL to prefer the table column
-- whenever a bare name matches both a RETURNS TABLE output parameter and a
-- column reference, eliminating "column reference is ambiguous" errors.
#variable_conflict use_column
declare
  v_existing_sold integer;
begin
  if p_product_id is null or p_delivery_date is null then
    raise exception 'product_id and delivery_date are required';
  end if;

  if p_total_stock is null or p_total_stock < 0 then
    raise exception 'total_stock must be >= 0';
  end if;

  -- Lock the existing row and capture its sold_quantity.
  select inv.sold_quantity
  into   v_existing_sold
  from   public.inventory as inv
  where  inv.product_id    = p_product_id
    and  inv.delivery_date = p_delivery_date
  for update;

  if not found then
    insert into public.inventory (
      product_id,
      delivery_date,
      total_stock,
      sold_quantity
    ) values (
      p_product_id,
      p_delivery_date,
      p_total_stock,
      0
    );
  else
    update public.inventory as inv
    set total_stock   = p_total_stock,
        sold_quantity = least(v_existing_sold, p_total_stock)
    where inv.product_id    = p_product_id
      and inv.delivery_date = p_delivery_date;
  end if;

  return query
    select
      i.product_id,
      i.delivery_date,
      i.total_stock,
      i.sold_quantity,
      i.remaining_stock,
      i.status
    from public.inventory as i
    where i.product_id    = p_product_id
      and i.delivery_date = p_delivery_date;
end;
$$;


-- ---------------------------------------------------------------------------
-- reserve_inventory_items
-- ---------------------------------------------------------------------------
create or replace function public.reserve_inventory_items(
  p_order_id      uuid,
  p_delivery_date date,
  p_items         jsonb
)
returns table (
  product_id      text,
  delivery_date   date,
  total_stock     integer,
  sold_quantity   integer,
  remaining_stock integer,
  status          text
)
language plpgsql
as $$
#variable_conflict use_column
declare
  v_item record;
  v_row  public.inventory%rowtype;
begin
  if p_order_id is null then
    raise exception 'order_id is required';
  end if;

  if p_delivery_date is null then
    raise exception 'delivery date is required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items are required';
  end if;

  -- Phase 1: validate every item has sufficient stock (with row-level lock).
  for v_item in
    select x.product_id, x.quantity
    from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
  loop
    if v_item.product_id is null or v_item.product_id = '' then
      raise exception 'invalid product_id';
    end if;

    if v_item.quantity is null or v_item.quantity <= 0 then
      raise exception 'invalid quantity for %', v_item.product_id;
    end if;

    if exists (
      select 1
      from public.inventory_reservations as r
      where r.order_id = p_order_id
        and r.product_id = v_item.product_id
        and r.delivery_date = p_delivery_date
    ) then
      continue;
    end if;

    select inv.id,
           inv.product_id,
           inv.delivery_date,
           inv.total_stock,
           inv.sold_quantity,
           inv.remaining_stock,
           inv.status,
           inv.created_at,
           inv.updated_at
    into   v_row
    from   public.inventory as inv
    where  inv.product_id    = v_item.product_id
      and  inv.delivery_date = p_delivery_date
    for update;

    if not found then
      raise exception '库存不存在: %, %', v_item.product_id, p_delivery_date;
    end if;

    if v_row.remaining_stock < v_item.quantity then
      raise exception '库存不足: %, 当前剩余 %', v_item.product_id, v_row.remaining_stock;
    end if;
  end loop;

  -- Phase 2: apply deductions.
  for v_item in
    select x.product_id, x.quantity
    from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
  loop
    insert into public.inventory_reservations (
      order_id,
      product_id,
      delivery_date,
      quantity
    ) values (
      p_order_id,
      v_item.product_id,
      p_delivery_date,
      v_item.quantity
    ) on conflict do nothing;

    if not found then
      continue;
    end if;

    update public.inventory as inv
    set sold_quantity = inv.sold_quantity + v_item.quantity
    where inv.product_id    = v_item.product_id
      and inv.delivery_date = p_delivery_date;
  end loop;

  return query
    select
      i.product_id,
      i.delivery_date,
      i.total_stock,
      i.sold_quantity,
      i.remaining_stock,
      i.status
    from public.inventory as i
    where i.delivery_date = p_delivery_date
      and i.product_id in (
        select x.product_id
        from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
      );
end;
$$;

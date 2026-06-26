alter table public.orders add column if not exists delivery_date date;

create table if not exists public.inventory (
  id bigserial primary key,
  product_id text not null,
  delivery_date date not null,
  total_stock integer not null default 0,
  sold_quantity integer not null default 0,
  remaining_stock integer not null default 0,
  status text not null default 'Available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_product_date_unique unique (product_id, delivery_date),
  constraint inventory_stock_non_negative check (total_stock >= 0 and sold_quantity >= 0 and remaining_stock >= 0),
  constraint inventory_status_valid check (status in ('Available', 'Sold Out'))
);

create or replace function public.inventory_apply_derived_fields()
returns trigger
language plpgsql
as $$
begin
  new.total_stock := greatest(coalesce(new.total_stock, 0), 0);
  new.sold_quantity := greatest(coalesce(new.sold_quantity, 0), 0);
  new.remaining_stock := greatest(new.total_stock - new.sold_quantity, 0);
  new.status := case when new.remaining_stock <= 0 then 'Sold Out' else 'Available' end;
  new.updated_at := now();

  if tg_op = 'INSERT' and new.created_at is null then
    new.created_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists inventory_derived_fields on public.inventory;
create trigger inventory_derived_fields
before insert or update on public.inventory
for each row
execute function public.inventory_apply_derived_fields();

create or replace function public.set_inventory_total_stock(
  p_product_id text,
  p_delivery_date date,
  p_total_stock integer
)
returns table (
  product_id text,
  delivery_date date,
  total_stock integer,
  sold_quantity integer,
  remaining_stock integer,
  status text
)
language plpgsql
as $$
declare
  v_existing_sold integer;
begin
  if p_product_id is null or p_delivery_date is null then
    raise exception 'product_id and delivery_date are required';
  end if;

  if p_total_stock is null or p_total_stock < 0 then
    raise exception 'total_stock must be >= 0';
  end if;

  select inv.sold_quantity
  into v_existing_sold
  from public.inventory as inv
  where inv.product_id = p_product_id
    and inv.delivery_date = p_delivery_date
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
    -- SET lhs must be bare column names (PostgreSQL syntax requirement);
    -- rhs uses only parameters/variables, so no ambiguity.
    update public.inventory as inv
    set total_stock   = p_total_stock,
        sold_quantity = least(v_existing_sold, p_total_stock)
    where inv.product_id   = p_product_id
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
    where i.product_id   = p_product_id
      and i.delivery_date = p_delivery_date;
end;
$$;

create or replace function public.reserve_inventory_items(
  p_delivery_date date,
  p_items jsonb
)
returns table (
  product_id text,
  delivery_date date,
  total_stock integer,
  sold_quantity integer,
  remaining_stock integer,
  status text
)
language plpgsql
as $$
declare
  v_item record;
  v_row public.inventory%rowtype;
begin
  if p_delivery_date is null then
    raise exception 'delivery date is required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items are required';
  end if;

  -- phase 1: validate stock for every item
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

    select inv.id,
           inv.product_id,
           inv.delivery_date,
           inv.total_stock,
           inv.sold_quantity,
           inv.remaining_stock,
           inv.status,
           inv.created_at,
           inv.updated_at
    into v_row
    from public.inventory as inv
    where inv.product_id   = v_item.product_id
      and inv.delivery_date = p_delivery_date
    for update;

    if not found then
      raise exception '库存不存在: %, %', v_item.product_id, p_delivery_date;
    end if;

    if v_row.remaining_stock < v_item.quantity then
      raise exception '库存不足: %, 当前剩余 %', v_item.product_id, v_row.remaining_stock;
    end if;
  end loop;

  -- phase 2: apply deductions
  for v_item in
    select x.product_id, x.quantity
    from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
  loop
    -- SET lhs must be bare column names (PostgreSQL syntax requirement);
    -- rhs uses inv.sold_quantity to avoid ambiguity with the return variable.
    update public.inventory as inv
    set sold_quantity = inv.sold_quantity + v_item.quantity
    where inv.product_id   = v_item.product_id
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

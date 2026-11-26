begin;

alter table public.orders
  add column if not exists customer_device_hash text,
  add column if not exists customer_order_date date;

create index if not exists orders_customer_device_idx
  on public.orders (customer_device_hash, created_at desc)
  where customer_device_hash is not null;

alter table public.orders enable row level security;
revoke all on public.orders from public, anon, authenticated;
grant select, insert, update, delete on public.orders to service_role;

notify pgrst, 'reload schema';
commit;

alter table public.orders add column if not exists delivery_date date;
alter table public.orders add column if not exists delivery_area text;
alter table public.orders add column if not exists delivery_slot text;
alter table public.orders add column if not exists subtotal numeric;
alter table public.orders add column if not exists delivery_fee numeric;
alter table public.orders add column if not exists total numeric;
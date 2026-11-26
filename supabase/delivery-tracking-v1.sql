-- One active vehicle location per delivery day. No location history.
create table if not exists public.delivery_tracking (
  delivery_date date primary key,
  trip_id uuid not null,
  started_at timestamptz not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null,
  longitude double precision not null check (longitude between -180 and 180),
  latitude double precision not null check (latitude between -90 and 90)
);

alter table public.delivery_tracking enable row level security;
revoke all on public.delivery_tracking from public, anon, authenticated;
grant select, insert, update, delete on public.delivery_tracking to service_role;

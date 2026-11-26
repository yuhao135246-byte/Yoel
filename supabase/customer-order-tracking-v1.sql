begin;

alter table public.delivery_tracking
  add column if not exists active_order_id text,
  add column if not exists active_destination text,
  add column if not exists active_since timestamptz;

create or replace function public.finish_customer_delivery(p_date date, p_order_id text)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  perform 1 from public.delivery_tracking
    where delivery_date = p_date and active_order_id = p_order_id
      and expires_at > statement_timestamp()
    for update;
  if not found then
    return false;
  end if;

  update public.orders
    set status = 'CANCELLED'
    where id::text = p_order_id and delivery_date = p_date
      and status in ('PAID', 'RESERVED', 'FULFILLED');
  if not found then
    return false;
  end if;
  update public.delivery_tracking
    set active_order_id = null, active_destination = null, active_since = null
    where delivery_date = p_date and active_order_id = p_order_id;
  return true;
end
$$;

revoke all on function public.finish_customer_delivery(date, text) from public, anon, authenticated;
grant execute on function public.finish_customer_delivery(date, text) to service_role;
notify pgrst, 'reload schema';
commit;

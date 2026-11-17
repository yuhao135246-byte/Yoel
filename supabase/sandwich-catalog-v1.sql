-- Run in the linked Supabase project after deploying the sandwich storefront.
-- Preserve the existing category rule and never overwrite an existing product.
begin;

lock table public.products in share row exclusive mode;

do $$
declare
  category_check text;
  matching_count integer;
begin
  select pg_get_expr(conbin, conrelid)
  into category_check
  from pg_constraint
  where conrelid = 'public.products'::regclass
    and conname = 'products_category_check'
    and contype = 'c';

  if category_check is not null and position('SANDWICH' in category_check) = 0 then
    alter table public.products drop constraint products_category_check;
    execute format(
      'alter table public.products add constraint products_category_check check ((%s) or category = %L)',
      category_check,
      'SANDWICH'
    );
  end if;

  select count(*) into matching_count
  from public.products
  where slug = 'pasture-fresh-vegetable-sandwich'
     or name = '牧场鲜蔬三明治';

  if matching_count > 0 then
    if matching_count <> 1 or not exists (
      select 1
      from public.products
      where slug = 'pasture-fresh-vegetable-sandwich'
        and name = '牧场鲜蔬三明治'
        and category = 'SANDWICH'
        and price = 12
        and image = '/assets/Sandwich1.png'
        and is_active = true
        and is_available = true
    ) then
      raise exception 'Sandwich product already exists with conflicting data; review it before proceeding';
    end if;
  else
    insert into public.products (
      slug, name, category, layer, price, currency, unit, availability,
      description, image, is_active, is_available, sort_order,
      details, tags, inventory_items, option_groups
    ) values (
      'pasture-fresh-vegetable-sandwich', '牧场鲜蔬三明治', 'SANDWICH',
      'Sandwich（三明治）', 12, '¥', '份', 'Available（可售）',
      '自制牧场酱与新鲜蔬菜的简洁组合，层次清爽、口感丰富。',
      '/assets/Sandwich1.png', true, true, 0,
      '["自制牧场酱","黄油","海盐","欧芹","番茄","生菜","白吐司"]'::jsonb,
      '["三明治","轻食","鲜蔬"]'::jsonb, '[]'::jsonb, '[]'::jsonb
    );
  end if;
end;
$$;

commit;

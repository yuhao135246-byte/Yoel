-- Add the iced pour-over category and Kenya Kangocho product.
-- Existing rows and prices are preserved.

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'products_category_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products drop constraint products_category_check;
  end if;

  alter table public.products
    add constraint products_category_check
    check (category in ('COFFEE', 'POUR_OVER', 'SANDWICH', 'OBJECT', 'RESEARCH'));
end;
$$;

insert into public.products (
  slug,
  name,
  category,
  layer,
  subtitle,
  price,
  currency,
  unit,
  availability,
  description,
  image,
  is_active,
  is_available,
  sort_order,
  origin,
  farm,
  variety,
  process,
  tasting_notes,
  details,
  tags,
  inventory_items,
  option_groups
)
select
  'kenya-kangocho-iced-pour-over',
  'KANGOCHO 肯尼亚冰手冲',
  'POUR_OVER',
  '冰手冲',
  '肯尼亚 Nyeri 产区',
  35,
  '¥',
  '杯',
  'Available（可售）',
  '来自肯尼亚 Nyeri 产区，由 Gikanda 咖啡合作社生产，丹麦 Coffee Collective 烘焙。选用 SL28、SL34、Ruiru 11 与 Batian 品种，采用传统水洗处理，展现肯尼亚咖啡鲜明的浆果调性。以冰手冲方式呈现，突出黑莓般的深色水果香气、苹果果酱般的甜感，以及柔和的可可尾韵。冰凉清爽，层次干净而明亮。',
  '/assets/Kenya Kangocho.png',
  true,
  true,
  5,
  'Nyeri，肯尼亚',
  'Gikanda FCS',
  'SL28、SL34、Ruiru 11、Batian',
  'Washed',
  '黑莓 · 苹果果酱 · 可可',
  '["烘焙：Coffee Collective（丹麦）","产地：Nyeri，肯尼亚","生产者：Gikanda FCS","品种：SL28、SL34、Ruiru 11、Batian","处理法：Washed","风味标签：黑莓 · 苹果果酱 · 可可"]'::jsonb,
  '["冰手冲","肯尼亚","黑莓","苹果果酱","可可"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb
where not exists (
  select 1
  from public.products
  where slug = 'kenya-kangocho-iced-pour-over'
);

-- Verification only: no UPDATE or DELETE is used.
select slug, name, category, price, is_active, is_available
from public.products
where slug = 'kenya-kangocho-iced-pour-over';

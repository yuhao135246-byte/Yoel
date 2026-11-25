-- Add one food product without overwriting catalog edits on subsequent runs.
insert into public.products (
  slug, name, category, layer, subtitle, price, currency, unit, availability,
  description, image, is_active, is_available, sort_order, tasting_notes,
  details, tags, inventory_items, option_groups
)
select
  slug, name, category, layer, subtitle, price, currency, unit, availability,
  description, image, is_active, is_available, sort_order, tasting_notes,
  details, tags, inventory_items, option_groups
from jsonb_populate_record(null::public.products, $product$
{
  "slug": "mexican-beef-burrito",
  "name": "墨西哥风味牛肉卷",
  "category": "SANDWICH",
  "layer": "Wrap（卷饼）",
  "subtitle": "Mexican Beef Burrito",
  "price": 28,
  "currency": "¥",
  "unit": "份",
  "availability": "Available（可售）",
  "description": "选用鲜风谷饲牛肉，以番茄、洋葱及多种香料熬制浓郁的自制墨西哥风味牛肉酱。烟熏红椒粉与孜然赋予牛肉丰富的香气，青柠汁平衡肉香与酸度。搭配清甜玉米、胡萝卜及鲜脆生菜，以墨西哥面饼包裹，烤至表面金黄微焦。",
  "image": "/assets/牛肉卷.png",
  "is_active": true,
  "is_available": true,
  "sort_order": 0,
  "tasting_notes": "谷饲牛肉香 / 烟熏香料 / 微辣 / 清爽酸度",
  "details": [
    "主要配料：鲜风谷饲牛肉、墨西哥面饼、番茄、番茄膏、洋葱、玉米、胡萝卜、生菜、孜然、烟熏红椒粉、辣椒粉、黑胡椒、青柠汁、红糖、食用油、海盐。",
    "风味特点：谷饲牛肉香 / 烟熏香料 / 微辣 / 清爽酸度",
    "过敏原提示：含小麦及麸质。"
  ],
  "tags": ["轻食", "牛肉卷", "微辣"],
  "inventory_items": [],
  "option_groups": []
}
$product$::jsonb)
on conflict (slug) do nothing;

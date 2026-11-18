const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env.local', 'utf8');
const values = {};
for (const line of envText.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  values[key] = val;
}

const supabase = createClient(values.NEXT_PUBLIC_SUPABASE_URL, values.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

(async () => {
  const slug = 'kenya-kangocho-iced-pour-over';
  const { data: existing, error: existingError } = await supabase
    .from('products')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existingError) {
    console.error(JSON.stringify(existingError, null, 2));
    process.exit(1);
  }

  if (existing) {
    console.log('PRESERVED_EXISTING_PRODUCT');
    console.log(JSON.stringify(existing));
    return;
  }

  const payload = {
    slug,
    name: 'KANGOCHO 肯尼亚冰手冲',
    category: 'POUR_OVER',
    layer: '冰手冲',
    subtitle: '肯尼亚 Nyeri 产区',
    price: 36,
    currency: '¥',
    unit: '杯',
    availability: 'Available（可售）',
    description: '来自肯尼亚 Nyeri 产区，由 Gikanda 咖啡合作社生产，丹麦 Coffee Collective 烘焙。选用 SL28、SL34、Ruiru 11 与 Batian 品种，采用传统水洗处理，展现肯尼亚咖啡鲜明的浆果调性。以冰手冲方式呈现，突出黑莓般的深色水果香气、苹果果酱般的甜感，以及柔和的可可尾韵。冰凉清爽，层次干净而明亮。',
    image: '/assets/Kenya Kangocho.png',
    is_active: true,
    is_available: true,
    sort_order: 5,
    origin: 'Nyeri，肯尼亚',
    farm: 'Gikanda FCS',
    variety: 'SL28、SL34、Ruiru 11、Batian',
    process: 'Washed',
    tasting_notes: '黑莓 · 苹果果酱 · 可可',
    details: [
      '烘焙：Coffee Collective（丹麦）',
      '产地：Nyeri，肯尼亚',
      '生产者：Gikanda FCS',
      '品种：SL28、SL34、Ruiru 11、Batian',
      '处理法：Washed',
      '风味标签：黑莓 · 苹果果酱 · 可可'
    ],
    tags: ['冰手冲', '肯尼亚', '黑莓', '苹果果酱', '可可'],
    inventory_items: [],
    option_groups: []
  };

  const { data, error } = await supabase.from('products').insert(payload).select().maybeSingle();
  if (error) {
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log('INSERTED_PRODUCT');
  console.log(JSON.stringify(data, null, 2));
})();

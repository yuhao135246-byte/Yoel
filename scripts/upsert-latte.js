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
  const payload = {
    slug: 'latte',
    name: 'Latte / 拿铁',
    category: 'COFFEE',
    layer: '奶咖系列',
    subtitle: '',
    price: 18,
    currency: '¥',
    unit: '杯',
    availability: 'Available（可售）',
    description: '丝滑奶泡与浓郁咖啡的经典组合，热或冰两种口感可选。',
    image: '/assets/Latte.png',
    is_active: true,
    is_available: true,
    sort_order: 5,
    initial_stock: 20,
    details: ['温度可选：热拿铁 / 冰拿铁'],
    tags: ['拿铁','Latte','奶咖'],
    option_groups: [
      {
        key: 'temperature',
        label: '温度 / Temperature',
        required: true,
        options: [
          {
            value: 'hot-latte',
            label: '热拿铁 / Hot Latte · ¥18',
            image: '/assets/Latte.png'
          },
          {
            value: 'ice-latte',
            label: '冰拿铁 / Ice Latte · ¥18',
            image: '/assets/Ice latte.png'
          }
        ]
      }
    ]
  };

  const { data, error } = await supabase.from('products').upsert(payload, { onConflict: 'slug' });
  if (error) {
    console.error('UPSERT_ERROR');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log('UPSERT_RESULT');
  console.log(JSON.stringify(data, null, 2));
})();

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
  try {
    const oldSlug = 'cappucino';

    const { data: beforeProducts, error: beforeProductsError } = await supabase
      .from('products')
      .select('*')
      .in('slug', [oldSlug, 'cappuccino']);

    if (beforeProductsError) {
      throw beforeProductsError;
    }

    const { data: beforeInventory, error: beforeInventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', oldSlug);

    if (beforeInventoryError) {
      throw beforeInventoryError;
    }

console.log('BEFORE_PRODUCTS');
  console.log(JSON.stringify(beforeProducts, null, 2));
  console.log('BEFORE_INVENTORY');
  console.log(JSON.stringify(beforeInventory, null, 2));

    const inventoryResult = await supabase
      .from('inventory')
      .delete()
      .eq('product_id', oldSlug);

    if (inventoryResult.error) throw inventoryResult.error;
    console.log('DELETE_INVENTORY_OK');

    const productResult = await supabase
      .from('products')
      .delete()
      .eq('slug', oldSlug);

    if (productResult.error) throw productResult.error;
    console.log('DELETE_PRODUCTS_OK');

    const { data: afterProducts, error: afterProductsError } = await supabase
      .from('products')
      .select('*')
      .in('slug', [oldSlug, 'cappuccino']);

    if (afterProductsError) {
      throw afterProductsError;
    }

    const { data: afterInventory, error: afterInventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', oldSlug);

    if (afterInventoryError) {
      throw afterInventoryError;
    }

    console.log('AFTER_PRODUCTS');
    console.log(JSON.stringify(afterProducts, null, 2));
    console.log('AFTER_INVENTORY');
    console.log(JSON.stringify(afterInventory, null, 2));
  } catch (err) {
    console.error('SCRIPT_ERROR');
    console.error(JSON.stringify(err, null, 2));
    process.exit(1);
  }
})();

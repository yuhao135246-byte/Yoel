import { AddToCartButton } from "@/components/brand/add-to-cart-button";
import { OrderPanel } from "@/components/brand/order-panel";
import { ProductCard } from "@/components/brand/product-card";
import { products } from "@/lib/data";
import { getDefaultBookingDate } from "@/lib/delivery";
import { ensureInventoryForNextDays, getInventoryByDate } from "@/lib/inventory";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadStockMap() {
  const deliveryDate = getDefaultBookingDate();

  if (!supabaseAdmin) {
    return {
      deliveryDate,
      map: new Map<string, number>()
    };
  }

  try {
    await ensureInventoryForNextDays(supabaseAdmin, 2);
    const records = await getInventoryByDate(supabaseAdmin, deliveryDate);
    return {
      deliveryDate,
      map: new Map(records.map((item) => [item.productId, item.remainingStock]))
    };
  } catch {
    return {
      deliveryDate,
      map: new Map<string, number>()
    };
  }
}

export default async function CoffeePage() {
  const coffee = products.filter((product) => product.category === "COFFEE");
  const stock = await loadStockMap();

  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">本周菜单</p>
        <h1 className="mt-4 max-w-4xl text-6xl leading-none md:mt-6 md:text-8xl">本周菜单</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-graphite md:mt-8">
          以冷萃为核心，记录不同产地、处理法与发酵实验带来的风味变化。
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 md:grid-cols-2 md:px-8 md:pb-14">
        {coffee.map((product, index) => (
          <div key={product.slug} className="grid gap-5">
            <ProductCard
              product={product}
              priority={index === 0}
              remainingStock={stock.map.get(product.slug)}
            />
            <AddToCartButton
              product={product}
              remainingStock={stock.map.get(product.slug)}
              deliveryDate={stock.deliveryDate}
            />
          </div>
        ))}
      </section>
      <OrderPanel />
    </main>
  );
}

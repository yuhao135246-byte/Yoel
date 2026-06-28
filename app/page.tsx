import Link from "next/link";
import { AddToCartButton } from "@/components/brand/add-to-cart-button";
import { OrderPanel } from "@/components/brand/order-panel";
import { ProductCard } from "@/components/brand/product-card";
import { products } from "@/lib/data";
import { ensureInventoryForNextDays, getDefaultInventoryDeliveryDate, getInventoryByDate } from "@/lib/inventory";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadStockMap() {
  const deliveryDate = getDefaultInventoryDeliveryDate();

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

export default async function HomePage() {
  const coffee = products.find((product) => product.slug === "stitch-cold-brew");
  const unit = products.find((product) => product.category === "OBJECT");
  const stock = await loadStockMap();

  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto grid min-h-[64vh] max-w-7xl content-between px-4 py-8 md:px-8 md:py-16">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">冷萃研究 / 菜单</p>
            <h1 className="mt-4 max-w-5xl text-6xl leading-none md:mt-8 md:text-8xl">
              每周冷萃与季节饮品
            </h1>
          </div>
          <p className="max-w-md text-base leading-7 text-graphite">
            以冷萃为核心，记录不同产地、处理法与发酵实验带来的风味变化。
          </p>
        </div>
        <div className="mt-8 grid gap-3 border-t border-ink/15 pt-4 md:mt-14 md:grid-cols-4 md:gap-4 md:pt-5">
          {["冷萃系列", "季节饮品", "UNIT 系列", "研究日志"].map(
            (item) => (
              <p key={item} className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                {item}
              </p>
            )
          )}
        </div>
      </section>
      <section className="border-y border-ink/10 bg-ink px-4 py-8 text-paper md:px-8 md:py-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_0.7fr] md:items-end md:gap-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/55">本周菜单</p>
            <h2 className="mt-3 max-w-3xl text-5xl leading-none md:mt-5 md:text-7xl">
              冷萃与季节饮品
            </h2>
          </div>
          <div className="grid gap-4">
            <p className="font-mono text-2xl md:text-3xl">精选四款</p>
            <p className="text-base leading-7 text-paper/70">
              以冷萃与季节饮品为载体，呈现当周风味与实验性组合。
            </p>
            <div className="bg-paper text-ink">
              {coffee ? (
                <AddToCartButton
                  product={coffee}
                  remainingStock={stock.map.get(coffee.slug)}
                  deliveryDate={stock.deliveryDate}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2 md:px-8 md:py-12">
        {coffee ? <ProductCard product={coffee} priority remainingStock={stock.map.get(coffee.slug)} /> : null}
        {unit ? <ProductCard product={unit} /> : null}
      </section>
      <OrderPanel />
      <section className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 md:flex-row md:px-8 md:py-14">
        <Link href="/coffee" className="border border-ink px-4 py-3 text-sm uppercase tracking-[0.18em] md:px-5 md:py-4">
          Order Coffee
        </Link>
        <Link href="/objects" className="border border-ink/20 px-4 py-3 text-sm uppercase tracking-[0.18em] md:px-5 md:py-4">
          View Unit Series
        </Link>
      </section>
    </main>
  );
}

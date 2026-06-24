import { AddToCartButton } from "@/components/brand/add-to-cart-button";
import { OrderPanel } from "@/components/brand/order-panel";
import { ProductCard } from "@/components/brand/product-card";
import { products } from "@/lib/data";

export default function CoffeePage() {
  const coffee = products.filter((product) => product.category === "COFFEE");

  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Layer 01 / Layer 02</p>
        <h1 className="mt-6 max-w-4xl text-6xl leading-none md:text-8xl">每周冷萃与水果茶。</h1>
        <p className="mt-8 max-w-2xl text-sm leading-7 text-graphite">
          Stitch 冷萃冰滴和 TANAT 系列构成本周冷饮菜单，驱动重复购买与私域订单节奏。
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 md:grid-cols-2 md:px-8">
        {coffee.map((product, index) => (
          <div key={product.slug} className="grid gap-5">
            <ProductCard product={product} priority={index === 0} />
            <AddToCartButton product={product} />
          </div>
        ))}
      </section>
      <OrderPanel />
    </main>
  );
}

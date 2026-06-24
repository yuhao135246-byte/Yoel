import { AddToCartButton } from "@/components/brand/add-to-cart-button";
import { OrderPanel } from "@/components/brand/order-panel";
import { ProductCard } from "@/components/brand/product-card";
import { products } from "@/lib/data";

export default function CoffeePage() {
  const coffee = products.filter((product) => product.category === "COFFEE");

  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">本周菜单</p>
        <h1 className="mt-6 max-w-4xl text-6xl leading-none md:text-8xl">本周菜单</h1>
        <p className="mt-8 max-w-2xl text-sm leading-7 text-graphite">
          以冷萃为核心，记录不同产地、处理法与发酵实验带来的风味变化。
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

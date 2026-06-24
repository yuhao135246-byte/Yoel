import Link from "next/link";
import { AddToCartButton } from "@/components/brand/add-to-cart-button";
import { OrderPanel } from "@/components/brand/order-panel";
import { ProductCard } from "@/components/brand/product-card";
import { products } from "@/lib/data";

export default function HomePage() {
  const coffee = products.find((product) => product.slug === "stitch-cold-brew")!;
  const unit = products.find((product) => product.slug === "lamp-unit-series")!;

  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto grid min-h-[78vh] max-w-7xl content-between px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Design studio / Lifestyle brand</p>
            <h1 className="mt-8 max-w-5xl text-6xl leading-none md:text-8xl">
              Weekly coffee. Parametric objects. Quiet studies.
            </h1>
          </div>
          <p className="max-w-md text-sm leading-7 text-graphite">
            CADENCE serves WeChat private traffic first: coffee orders for cashflow, Weekly Drop
            for repeat purchase, Unit Series for high-value design objects, Journal for brand memory.
          </p>
        </div>
        <div className="mt-14 grid gap-4 border-t border-ink/15 pt-5 md:grid-cols-4">
          {["01 Coffee cashflow", "02 Weekly Drop retention", "03 Unit Series AOV", "04 Journal brand"].map(
            (item) => (
              <p key={item} className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">
                {item}
              </p>
            )
          )}
        </div>
      </section>
      <section className="border-y border-ink/10 bg-ink px-5 py-12 text-paper md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_0.7fr] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/55">Weekly Drop</p>
            <h2 className="mt-5 max-w-3xl text-5xl leading-none md:text-7xl">
              本周冰滴开放预订
            </h2>
          </div>
          <div className="grid gap-5">
            <p className="font-mono text-3xl">18 / 30</p>
            <p className="text-sm leading-7 text-paper/70">
              Remaining weekly cold brew capacity for the current WeChat private drop.
            </p>
            <div className="bg-paper text-ink">
              <AddToCartButton product={coffee} />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-2 md:px-8">
        <ProductCard product={coffee} priority />
        <ProductCard product={unit} />
      </section>
      <OrderPanel />
      <section className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-14 md:flex-row md:px-8">
        <Link href="/coffee" className="border border-ink px-5 py-4 text-sm uppercase tracking-[0.18em]">
          Order Coffee
        </Link>
        <Link href="/objects" className="border border-ink/20 px-5 py-4 text-sm uppercase tracking-[0.18em]">
          View Unit Series
        </Link>
      </section>
    </main>
  );
}

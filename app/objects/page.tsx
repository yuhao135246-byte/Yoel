import Image from "next/image";
import { ProductCard } from "@/components/brand/product-card";
import { products } from "@/lib/data";

export default function ObjectsPage() {
  const objects = products.filter((product) => product.category === "OBJECT");

  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">UNIT 系列</p>
          <h1 className="mt-4 text-6xl leading-none md:mt-6 md:text-8xl">UNIT 系列</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-graphite md:mt-8">
            以参数化表达为基底，呈现可订制的工艺对象与练习性家具。
          </p>
        </div>
        <Image
          src="/assets/unit01-hero.png"
          alt="Parametric Lamp Unit 01"
          width={1600}
          height={1200}
          priority
          className="aspect-[4/5] w-full object-cover md:aspect-auto"
        />
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 md:grid-cols-2 md:px-8 md:pb-16">
        <Image
          src="/assets/unit01-detail.png"
          alt="Unit01 material detail"
          width={1200}
          height={1200}
          className="aspect-[4/5] w-full object-cover md:aspect-square"
        />
        <Image
          src="/assets/unit01-context.png"
          alt="Unit01 in minimal architectural context"
          width={1600}
          height={1200}
          className="aspect-[4/5] w-full object-cover md:aspect-square"
        />
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 md:grid-cols-2 md:px-8 md:pb-16">
        {objects.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </section>
    </main>
  );
}

import Image from "next/image";
import { ProductCard } from "@/components/brand/product-card";
import { products } from "@/lib/data";

export default function ObjectsPage() {
  const objects = products.filter((product) => product.category === "OBJECT");

  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">UNIT 系列</p>
          <h1 className="mt-6 text-6xl leading-none md:text-8xl">UNIT 系列</h1>
          <p className="mt-8 max-w-md text-sm leading-7 text-graphite">
            以参数化表达为基底，呈现可订制的工艺对象与练习性家具。
          </p>
        </div>
        <Image
          src="/assets/unit01-hero.png"
          alt="Parametric Lamp Unit 01"
          width={1600}
          height={1200}
          priority
          className="w-full object-cover"
        />
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 md:grid-cols-2 md:px-8">
        <Image
          src="/assets/unit01-detail.png"
          alt="Unit01 material detail"
          width={1200}
          height={1200}
          className="aspect-square w-full object-cover"
        />
        <Image
          src="/assets/unit01-context.png"
          alt="Unit01 in minimal architectural context"
          width={1600}
          height={1200}
          className="aspect-square w-full object-cover"
        />
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 md:grid-cols-2 md:px-8">
        {objects.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </section>
    </main>
  );
}

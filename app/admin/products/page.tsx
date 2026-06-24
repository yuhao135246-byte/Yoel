import Image from "next/image";
import { products } from "@/lib/data";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Products</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">Products</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <article key={product.slug} className="grid grid-cols-[0.45fr_1fr] gap-5 border-t border-ink/15 pt-5">
              <Image src={product.image} alt={product.name} width={640} height={480} className="aspect-square object-cover" />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-warm">{product.category}</p>
                <h2 className="mt-2 text-2xl">{product.name}</h2>
                <p className="mt-4 text-sm leading-7 text-graphite">{product.description}</p>
                <p className="mt-4 font-mono text-sm">RMB {product.price} / {product.unit}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

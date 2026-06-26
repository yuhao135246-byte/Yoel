import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  remainingStock?: number;
};

export function ProductCard({ product, priority = false, remainingStock }: ProductCardProps) {
  const stockLabel =
    typeof remainingStock === "number"
      ? remainingStock <= 0
        ? "Sold Out"
        : `Only ${remainingStock} Left`
      : null;

  return (
    <article className="grid gap-5 border-t border-ink/15 pt-5">
      <Link href={product.category === "COFFEE" ? "/coffee" : "/objects"} className="block overflow-hidden bg-bone">
        <Image
          src={product.image}
          alt={product.name}
          width={1200}
          height={900}
          priority={priority}
          className="aspect-[4/3] w-full object-cover"
        />
      </Link>
      <div className="grid gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warm">{product.layer}</p>
            <h3 className="mt-2 text-2xl">{product.name}</h3>
          </div>
          <p className="font-mono text-sm">RMB {product.price}</p>
        </div>
        <p className="text-sm leading-7 text-graphite">{product.description}</p>
        <div className="grid gap-1 text-sm text-graphite">
          {product.details.map((detail) => (
            <p key={detail}>• {detail}</p>
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-graphite">{product.availability}</p>
        {stockLabel ? <p className="font-mono text-xs uppercase tracking-[0.16em] text-warm">{stockLabel}</p> : null}
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  remainingStock?: number;
};

export function ProductCard({ product, priority = false, remainingStock }: ProductCardProps) {
  const priceLabel = `${product.currency ?? "RMB"} ${product.price}`;
  const stockLabel =
    typeof remainingStock === "number"
      ? remainingStock <= 0
        ? "售罄"
        : `仅剩 ${remainingStock}`
      : product.available === false
        ? "售罄"
      : null;

  return (
    <article className="grid gap-4 border-t border-ink/15 pt-4 md:gap-5 md:pt-5">
      <Link href={product.category === "COFFEE" ? "/coffee" : "/objects"} className="block overflow-hidden bg-bone">
        <Image
          src={product.image}
          alt={product.name}
          width={1200}
          height={900}
          priority={priority}
          className="aspect-[16/10] w-full object-cover md:aspect-[4/3]"
        />
      </Link>
      <div className="grid gap-2 md:gap-3">
        <div className="flex items-start justify-between gap-3 md:gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warm">{product.layer}</p>
            <h3 className="mt-1 text-2xl md:mt-2">{product.name}</h3>
            {typeof product.score === "number" ? <p className="mt-1 text-sm text-graphite">{product.score} 分</p> : null}
            {product.subtitle ? <p className="mt-1 text-sm text-graphite">{product.subtitle}</p> : null}
          </div>
          <p className="font-mono text-sm">{priceLabel}</p>
        </div>
        <p className="text-base leading-6 text-graphite">{product.description}</p>
        <div className="grid gap-0.5 text-sm text-graphite">
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

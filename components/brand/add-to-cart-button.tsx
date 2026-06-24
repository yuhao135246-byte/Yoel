"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/lib/data";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

export function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();

  function addToCart() {
    const raw = window.localStorage.getItem("cadence-cart");
    const items: CartItem[] = raw ? JSON.parse(raw) : [];
    const existing = items.find((item) => item.slug === product.slug);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    window.localStorage.setItem("cadence-cart", JSON.stringify(items));
    router.push("/cart");
  }

  return (
    <button
      type="button"
      data-testid={`add-to-cart-${product.slug}`}
      onClick={addToCart}
      className="h-12 border border-ink px-5 text-sm uppercase tracking-[0.18em]"
    >
      加入购物车
    </button>
  );
}

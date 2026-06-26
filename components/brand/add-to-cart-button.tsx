"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/lib/data";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

type AddToCartButtonProps = {
  product: Product;
  remainingStock?: number;
  deliveryDate?: string;
};

export function AddToCartButton({ product, remainingStock, deliveryDate }: AddToCartButtonProps) {
  const router = useRouter();
  const isSoldOut = typeof remainingStock === "number" && remainingStock <= 0;

  function addToCart() {
    if (isSoldOut) {
      return;
    }

    const raw = window.localStorage.getItem("cadence-cart");
    const items: CartItem[] = raw ? JSON.parse(raw) : [];
    const existing = items.find((item) => item.slug === product.slug);

    if (typeof remainingStock === "number") {
      const nextQuantity = (existing?.quantity ?? 0) + 1;
      if (nextQuantity > remainingStock) {
        window.alert(`库存不足\n当前剩余：${remainingStock}`);
        return;
      }
    }

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
      disabled={isSoldOut}
      className="h-12 w-full border border-ink px-4 text-sm uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:px-5"
      title={deliveryDate ? `配送日期 ${deliveryDate}` : undefined}
    >
      {isSoldOut ? "Sold Out" : "加入购物车"}
    </button>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateDeliveryFee,
  calculateOrderTotal,
  calculateSubtotal
} from "@/lib/order-pricing";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem("cadence-cart");
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  function persistItems(nextItems: CartItem[]) {
    setItems(nextItems);
    window.localStorage.setItem("cadence-cart", JSON.stringify(nextItems));
  }

  function decreaseQuantity(slug: string) {
    const nextItems = items.flatMap((item) => {
      if (item.slug !== slug) {
        return item;
      }

      if (item.quantity <= 1) {
        return [];
      }

      return {
        ...item,
        quantity: item.quantity - 1
      };
    });

    persistItems(nextItems);
  }

  function increaseQuantity(slug: string) {
    const nextItems = items.map((item) =>
      item.slug === slug
        ? {
            ...item,
            quantity: item.quantity + 1
          }
        : item
    );

    persistItems(nextItems);
  }

  function removeItem(slug: string) {
    persistItems(items.filter((item) => item.slug !== slug));
  }

  const subtotal = useMemo(
    () => calculateSubtotal(items),
    [items]
  );
  const deliveryFee = useMemo(() => calculateDeliveryFee(subtotal), [subtotal]);
  const total = useMemo(() => calculateOrderTotal(subtotal), [subtotal]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">购物车</p>
      <h1 className="mt-6 text-5xl leading-none md:text-7xl">确认订单</h1>
      <div className="mt-10 grid gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-graphite">购物车为空。</p>
        ) : (
          items.map((item) => (
            <div key={item.slug} className="grid gap-4 border-t border-ink/15 py-5 text-sm md:grid-cols-[1fr_auto_0.35fr] md:items-center">
              <div>
                <p>{item.name}</p>
                <p className="mt-1 font-mono text-xs text-graphite">RMB {item.price} / 份</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`减少 ${item.name} 数量`}
                  onClick={() => decreaseQuantity(item.slug)}
                  className="flex h-10 w-10 items-center justify-center border border-ink/20 text-lg"
                >
                  -
                </button>
                <span className="min-w-12 text-center font-mono">x {item.quantity}</span>
                <button
                  type="button"
                  aria-label={`增加 ${item.name} 数量`}
                  onClick={() => increaseQuantity(item.slug)}
                  className="flex h-10 w-10 items-center justify-center border border-ink/20 text-lg"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.slug)}
                  className="ml-2 border border-ink/20 px-3 py-2 text-xs uppercase tracking-[0.16em] text-graphite"
                >
                  删除
                </button>
              </div>
              <span className="text-right font-mono">RMB {item.price * item.quantity}</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-8 grid gap-3 border-t border-ink/15 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <span>商品金额</span>
          <span className="font-mono">RMB {subtotal}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>配送费</span>
          <span className="font-mono">RMB {deliveryFee}</span>
        </div>
        <div className="flex items-center justify-between text-base">
          <span>订单总额</span>
          <span className="font-mono">RMB {total}</span>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end">
        <Link
          href="/checkout"
          className="border border-ink bg-ink px-5 py-4 text-sm uppercase tracking-[0.18em] text-paper"
        >
          去结算
        </Link>
      </div>
    </section>
  );
}

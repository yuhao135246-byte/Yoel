"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Cart</p>
      <h1 className="mt-6 text-5xl leading-none md:text-7xl">Review order.</h1>
      <div className="mt-10 grid gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-graphite">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div key={item.slug} className="grid grid-cols-[1fr_0.35fr_0.35fr] border-t border-ink/15 py-5 text-sm">
              <span>{item.name}</span>
              <span className="font-mono">x {item.quantity}</span>
              <span className="text-right font-mono">RMB {item.price * item.quantity}</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-ink/15 pt-5">
        <p className="font-mono text-xl">RMB {total}</p>
        <Link
          href="/checkout"
          className="border border-ink bg-ink px-5 py-4 text-sm uppercase tracking-[0.18em] text-paper"
        >
          Checkout
        </Link>
      </div>
    </section>
  );
}

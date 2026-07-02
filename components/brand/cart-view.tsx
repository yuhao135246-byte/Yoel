"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateDeliveryFee,
  calculateOrderTotal,
  calculateSubtotal
} from "@/lib/order-pricing";
import { products } from "@/lib/data";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions?: {
    groupKey: string;
    groupLabel: string;
    value: string;
    label: string;
  }[];
};

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [remainingStockMap, setRemainingStockMap] = useState<Record<string, number>>({});
  const [stockError, setStockError] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem("cadence-cart");
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadStock() {
      try {
        const response = await fetch("/api/inventory", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          return;
        }

        if (!active || !Array.isArray(result.records)) {
          return;
        }

        const stockMap = Object.fromEntries(
          result.records.map((record: { productId: string; remainingStock: number }) => [
            record.productId,
            Number(record.remainingStock ?? 0)
          ])
        );

        setRemainingStockMap(stockMap);
      } catch {
        // Ignore stock load failure in cart; server-side validation still runs at checkout.
      }
    }

    void loadStock();

    return () => {
      active = false;
    };
  }, []);

  function persistItems(nextItems: CartItem[]) {
    setItems(nextItems);
    window.localStorage.setItem("cadence-cart", JSON.stringify(nextItems));
  }

  function decreaseQuantity(indexToChange: number) {
    const nextItems = items.flatMap((item, index) => {
      if (index !== indexToChange) {
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

  function increaseQuantity(indexToChange: number) {
    const current = items[indexToChange];
    if (!current) {
      return;
    }

    const remaining = remainingStockMap[current.slug];

    if (current && Number.isFinite(remaining) && current.quantity + 1 > remaining) {
      setStockError(`库存不足\n当前剩余：${remaining}`);
      return;
    }

    setStockError("");
    const nextItems = items.map((item, index) =>
      index === indexToChange
        ? {
            ...item,
            quantity: item.quantity + 1
          }
        : item
    );

    persistItems(nextItems);
  }

  function removeItem(indexToRemove: number) {
    persistItems(items.filter((_, index) => index !== indexToRemove));
  }

  const subtotal = useMemo(
    () => calculateSubtotal(items),
    [items]
  );
  const deliveryFee = useMemo(() => calculateDeliveryFee(subtotal), [subtotal]);
  const total = useMemo(() => calculateOrderTotal(subtotal), [subtotal]);
  const productBySlug = useMemo(() => new Map(products.map((product) => [product.slug, product])), []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">购物车</p>
      <h1 className="mt-4 text-5xl leading-none md:mt-6 md:text-7xl">确认订单</h1>
      <div className="mt-8 grid gap-3 md:mt-10 md:gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-graphite">购物车为空。</p>
        ) : (
          items.map((item, index) => (
            <div key={`${item.slug}-${index}`} className="grid gap-3 border-t border-ink/15 py-4 text-base md:grid-cols-[1fr_auto_0.35fr] md:items-center md:gap-4 md:py-5">
              <div className="grid gap-1">
                <p>{item.name}</p>
                {item.selectedOptions?.map((option) => (
                  <p key={`${item.slug}-${index}-${option.groupKey}`} className="text-sm text-graphite">
                    {option.groupLabel}：{option.label}
                  </p>
                ))}
                {(productBySlug.get(item.slug)?.inventoryItems ?? []).map((included, includedIndex) => {
                  const includedProduct = productBySlug.get(included.slug);
                  if (!includedProduct) {
                    return null;
                  }

                  return (
                    <p key={`${item.slug}-${index}-included-${includedIndex}`} className="text-sm text-graphite">
                      {includedProduct.name} x {included.quantity * item.quantity}
                    </p>
                  );
                })}
                <p className="mt-1 font-mono text-xs text-graphite">RMB {item.price} / 份</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label={`减少 ${item.name} 数量`}
                  onClick={() => decreaseQuantity(index)}
                  className="flex h-10 w-10 items-center justify-center border border-ink/20 text-lg"
                >
                  -
                </button>
                <span className="min-w-12 text-center font-mono">x {item.quantity}</span>
                <button
                  type="button"
                  aria-label={`增加 ${item.name} 数量`}
                  onClick={() => increaseQuantity(index)}
                  className="flex h-10 w-10 items-center justify-center border border-ink/20 text-lg"
                >
                  +
                </button>
                <button type="button" onClick={() => removeItem(index)} className="ml-0 border border-ink/20 px-3 py-2 text-xs uppercase tracking-[0.16em] text-graphite md:ml-2">
                  删除
                </button>
              </div>
              <span className="text-left font-mono md:text-right">RMB {item.price * item.quantity}</span>
            </div>
          ))
        )}
      </div>
      {stockError ? <p className="mt-3 text-sm text-red-600 whitespace-pre-line">{stockError}</p> : null}
      <div className="mt-6 grid gap-2 border-t border-ink/15 pt-4 text-base md:mt-8 md:gap-3 md:pt-5 md:text-sm">
        <div className="flex items-center justify-between">
          <span>商品金额</span>
          <span className="font-mono">RMB {subtotal}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>配送费</span>
          <span className="font-mono">RMB {deliveryFee}</span>
        </div>
        <div className="flex items-center justify-between text-lg md:text-base">
          <span>订单总额</span>
          <span className="font-mono">RMB {total}</span>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end">
        <Link
          href="/checkout"
          className="w-full border border-ink bg-ink px-4 py-3 text-sm uppercase tracking-[0.18em] text-paper md:w-auto md:px-5 md:py-4"
        >
          去结算
        </Link>
      </div>
    </section>
  );
}

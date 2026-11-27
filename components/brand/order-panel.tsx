"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import {
  BOOKING_CLOSED_MESSAGE,
  DELIVERY_AREAS,
  formatDeliveryDate,
  getBookingDateOptions
} from "@/lib/delivery";
import { createOrderNumber } from "@/lib/order-number";

type DeliveryDateOption = {
  date: string;
  label: string;
  isToday: boolean;
  isAvailable: boolean;
};

export function OrderPanel({ products }: { products: Product[] }) {
  const coffee = products.filter((product) => product.category === "COFFEE" || product.category === "POUR_OVER" || product.category === "SANDWICH");
  const [dateOptions, setDateOptions] = useState<DeliveryDateOption[]>(
    getBookingDateOptions()
  );
  const [selectedSlug, setSelectedSlug] = useState(coffee[0].slug);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState(dateOptions[0]?.date ?? "");
  const selected = coffee.find((product) => product.slug === selectedSlug) ?? coffee[0];
  const total = useMemo(() => selected.price * quantity, [quantity, selected.price]);
  const orderNumber = useMemo(() => createOrderNumber(), []);

  useEffect(() => {
    let active = true;

    async function loadDateOptions() {
      try {
        const response = await fetch("/api/order", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok || !active) {
          return;
        }

        if (Array.isArray(result.dateOptions)) {
          setDateOptions(result.dateOptions as DeliveryDateOption[]);
        }

        if (typeof result.defaultDeliveryDate === "string") {
          setDeliveryDate(result.defaultDeliveryDate);
        }
      } catch {
        // Keep fallback rolling dates when the API is unavailable.
      }
    }

    void loadDateOptions();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-ink px-4 py-8 text-paper md:px-8 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_0.8fr] md:gap-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/55">配送预订</p>
          <h2 className="mt-3 max-w-3xl text-5xl leading-none md:mt-5 md:text-7xl">
            简洁的产品预订
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-paper/70 md:mt-6">
            配送日期和区域在结算时确认。
          </p>
        </div>
        <form className="grid gap-4 bg-paper p-4 text-ink md:gap-5 md:p-6">
          <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
            产品
            <select
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.target.value)}
              className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case tracking-normal"
            >
              {coffee.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name} / RMB {product.price}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
            数量
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case tracking-normal"
            />
          </label>
          <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
            配送日期
            <select
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              disabled={dateOptions.length === 0}
              className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case tracking-normal"
            >
              {dateOptions.length === 0 ? <option value="">暂未开放</option> : null}
              {dateOptions.map((option) => (
                <option key={option.date} value={option.date} disabled={!option.isAvailable}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border border-ink/15 px-3 py-2.5 text-sm text-graphite">
            {DELIVERY_AREAS.map(({ area, slot }) => (
              <div key={area} className="contents">
                <dt>{area}</dt>
                <dd className="font-mono">{slot}</dd>
              </div>
            ))}
          </dl>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="姓名" className="h-12 border border-ink/20 bg-paper px-3" />
            <input placeholder="电话" className="h-12 border border-ink/20 bg-paper px-3" />
          </div>
          <input placeholder="配送地址" className="h-12 border border-ink/20 bg-paper px-3" />
          <div className="border-t border-ink/15 pt-3 font-mono text-sm">
            <p>订单编号 {orderNumber}</p>
            <p className="mt-2">配送日期 {deliveryDate ? formatDeliveryDate(deliveryDate) : "暂不可用"}</p>
            <p className="mt-2 text-xl md:text-2xl">RMB {total}</p>
          </div>
          {dateOptions.length > 0 ? (
            <Link href="/checkout" className="flex h-12 items-center justify-center bg-ink px-4 text-sm uppercase tracking-[0.18em] text-paper">
              前往结算
            </Link>
          ) : (
            <p className="text-sm text-graphite" role="status">{BOOKING_CLOSED_MESSAGE}</p>
          )}
        </form>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { products } from "@/lib/data";
import {
  buildRollingDeliveryDateOptions,
  DELIVERY_SLOTS,
  DELIVERY_WINDOW,
  formatDeliveryDate,
  getDefaultDeliveryDate
} from "@/lib/delivery";
import { createOrderNumber } from "@/lib/order-number";

type DeliveryDateOption = {
  date: string;
  label: string;
  isToday: boolean;
  isAvailable: boolean;
};

export function OrderPanel() {
  const coffee = products.filter((product) => product.category === "COFFEE");
  const [dateOptions, setDateOptions] = useState<DeliveryDateOption[]>(
    buildRollingDeliveryDateOptions({ isTodayAvailable: true })
  );
  const [selectedSlug, setSelectedSlug] = useState(coffee[0].slug);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState(getDefaultDeliveryDate());
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const selected = coffee.find((product) => product.slug === selectedSlug) ?? coffee[0];
  const total = useMemo(() => selected.price * quantity, [quantity, selected.price]);
  const orderNumber = useMemo(
    () => createOrderNumber(),
    [selectedSlug, quantity, deliveryDate, deliverySlot]
  );

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
            选择产品、数量、配送日期与时段，完成配送信息填写。早晨配送窗口为固定时段。
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
              className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case tracking-normal"
            >
              {dateOptions.map((option) => (
                <option key={option.date} value={option.date} disabled={!option.isAvailable}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="border border-ink/15 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-graphite">
            配送时间窗口：{DELIVERY_WINDOW}
          </div>
          <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
            配送时间段
            <select
              value={deliverySlot}
              onChange={(event) => setDeliverySlot(event.target.value)}
              className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case tracking-normal"
            >
              {DELIVERY_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="姓名" className="h-12 border border-ink/20 bg-paper px-3" />
            <input placeholder="电话" className="h-12 border border-ink/20 bg-paper px-3" />
          </div>
          <input placeholder="配送地址" className="h-12 border border-ink/20 bg-paper px-3" />
          <div className="border-t border-ink/15 pt-3 font-mono text-sm">
            <p>订单编号 {orderNumber}</p>
            <p className="mt-2">配送日期 {deliveryDate ? formatDeliveryDate(deliveryDate) : "暂不可用"}</p>
            <p className="mt-1">配送时段 {deliverySlot} / 时间窗口 {DELIVERY_WINDOW}</p>
            <p className="mt-2 text-xl md:text-2xl">RMB {total}</p>
          </div>
          <Link href="/checkout" className="flex h-12 items-center justify-center bg-ink px-4 text-sm uppercase tracking-[0.18em] text-paper">
            前往结算
          </Link>
        </form>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { products } from "@/lib/data";
import {
  DELIVERY_SLOTS,
  DELIVERY_WINDOW,
  formatDeliveryDate,
  getAvailableDeliveryDates
} from "@/lib/delivery";
import { createOrderNumber } from "@/lib/order-number";

export function OrderPanel() {
  const coffee = products.filter((product) => product.category === "COFFEE");
  const availableDates = getAvailableDeliveryDates();
  const [selectedSlug, setSelectedSlug] = useState(coffee[0].slug);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState(availableDates[0]?.date ?? "");
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const selected = coffee.find((product) => product.slug === selectedSlug) ?? coffee[0];
  const total = useMemo(() => selected.price * quantity, [quantity, selected.price]);
  const orderNumber = useMemo(
    () => createOrderNumber(),
    [selectedSlug, quantity, deliveryDate, deliverySlot]
  );

  return (
    <section className="bg-ink px-5 py-10 text-paper md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/55">WeChat Group Order</p>
          <h2 className="mt-5 max-w-3xl text-5xl leading-none md:text-7xl">
            Coffee first. Cashflow now.
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-paper/70">
            The order form is intentionally short for WeChat traffic: product, quantity, delivery
            date, contact, address, payment reservation. All deliveries are made in one fixed
            morning window with eight preset delivery batches.
          </p>
        </div>
        <form className="grid gap-5 bg-paper p-5 text-ink md:p-6">
          <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
            Product
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
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case tracking-normal"
            />
          </label>
          <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
            Delivery Date
            <select
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case tracking-normal"
            >
              {availableDates.map((date) => (
                <option key={date.date} value={date.date}>
                  {formatDeliveryDate(date.date)}
                </option>
              ))}
            </select>
          </label>
          <div className="border border-ink/15 px-3 py-3 font-mono text-xs uppercase tracking-[0.14em] text-graphite">
            Morning delivery window: {DELIVERY_WINDOW}
          </div>
          <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
            Delivery Slot
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
            <input placeholder="Name" className="h-12 border border-ink/20 bg-paper px-3" />
            <input placeholder="Phone" className="h-12 border border-ink/20 bg-paper px-3" />
          </div>
          <input placeholder="Delivery address" className="h-12 border border-ink/20 bg-paper px-3" />
          <div className="border-t border-ink/15 pt-4 font-mono text-sm">
            <p>Order {orderNumber}</p>
            <p className="mt-2">Delivery {deliveryDate ? formatDeliveryDate(deliveryDate) : "Unavailable"}</p>
            <p className="mt-1">Slot {deliverySlot} / Window {DELIVERY_WINDOW}</p>
            <p className="mt-2 text-2xl">RMB {total}</p>
          </div>
          <button type="button" className="h-12 bg-ink text-sm uppercase tracking-[0.18em] text-paper">
            Reserve WeChat Pay
          </button>
        </form>
      </div>
    </section>
  );
}

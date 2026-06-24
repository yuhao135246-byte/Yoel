"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  DELIVERY_SLOTS,
  DELIVERY_WINDOW,
  formatDeliveryDate,
  getAvailableDeliveryDates
} from "@/lib/delivery";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

export function CheckoutForm() {
  const router = useRouter();
  const availableDates = getAvailableDeliveryDates();
  const [items, setItems] = useState<CartItem[]>([]);
  const [name, setName] = useState("Test Customer");
  const [phone, setPhone] = useState("13800000000");
  const [wechat, setWechat] = useState("cadence_test");
  const [address, setAddress] = useState("Shanghai sample address");
  const [notes, setNotes] = useState("门铃坏了，放门口，咖啡不要太晚送");
  const [deliveryDate, setDeliveryDate] = useState(availableDates[0]?.date ?? "");
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("cadence-cart");
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customer: { name, phone },
        wechat,
        address,
        notes,
        deliveryDate,
        deliverySlot,
        items,
        amount: total,
        description: items.map((item) => item.name).join(", ")
      })
    });
    const result = await response.json();
    window.localStorage.removeItem("cadence-cart");
    router.push(`/order-confirmation?orderNumber=${result.orderNumber}`);
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[0.8fr_1fr] md:px-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Checkout</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">Morning delivery.</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-graphite">
          Select a delivery date and one of eight fixed batches inside {DELIVERY_WINDOW}.
        </p>
      </div>
      <form className="grid gap-5 border border-ink/15 p-5" onSubmit={submitOrder}>
        <div className="grid grid-cols-2 gap-3">
          <input
            aria-label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 border border-ink/20 bg-paper px-3"
          />
          <input
            aria-label="Phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="h-12 border border-ink/20 bg-paper px-3"
          />
        </div>
        <input
          aria-label="WeChat"
          value={wechat}
          onChange={(event) => setWechat(event.target.value)}
          className="h-12 border border-ink/20 bg-paper px-3"
        />
        <input
          aria-label="Address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="h-12 border border-ink/20 bg-paper px-3"
        />
        <textarea
          aria-label="Notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-24 border border-ink/20 bg-paper px-3 py-3"
        />
        <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
          Delivery Date
          <select value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case">
            {availableDates.map((date) => (
              <option key={date.date} value={date.date}>
                {formatDeliveryDate(date.date)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
          Delivery Slot
          <select value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value)} className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case">
            {DELIVERY_SLOTS.map((slot) => (
              <option key={slot}>{slot}</option>
            ))}
          </select>
        </label>
        <div className="border-t border-ink/15 pt-4 font-mono text-sm">
          {items.map((item) => (
            <p key={item.slug}>{item.name} x {item.quantity}</p>
          ))}
          <p className="mt-3 text-2xl">RMB {total}</p>
        </div>
        <button
          data-testid="submit-order"
          disabled={isSubmitting || items.length === 0}
          className="h-12 bg-ink text-sm uppercase tracking-[0.18em] text-paper disabled:opacity-40"
        >
          {isSubmitting ? "Submitting" : "Submit order"}
        </button>
      </form>
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  DELIVERY_AREAS,
  getDeliverySlotForArea,
  type DeliveryArea
} from "@/lib/delivery";
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

type DeliveryAvailability = {
  date: string;
  isFull: boolean;
  defaultDeliveryDate: string;
  dateOptions: {
    date: string;
    label: string;
    isToday: boolean;
    isAvailable: boolean;
  }[];
  message?: string;
  areas: {
    area: DeliveryArea;
    slot: string;
    booked: number;
    remaining: number;
    isAvailable: boolean;
    message?: string;
  }[];
};

export function CheckoutForm() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea | "">("");
  const [availability, setAvailability] = useState<DeliveryAvailability | null>(null);
  const [isLoadingAvailability, setLoadingAvailability] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("cadence-cart");
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAvailability(date?: string) {
      try {
        setLoadingAvailability(true);
        const query = date ? `?deliveryDate=${encodeURIComponent(date)}` : "";
        const response = await fetch(`/api/order${query}`, { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "读取配送容量失败");
        }

        if (!isActive) {
          return;
        }

        setAvailability(result);
        setDeliveryDate(result.date);
        const firstAvailableArea = result.areas.find((area: DeliveryAvailability["areas"][number]) => area.isAvailable)?.area ?? "";
        setDeliveryArea(firstAvailableArea);
      } catch (fetchError) {
        if (!isActive) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "读取配送容量失败");
      } finally {
        if (isActive) {
          setLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleDeliveryDateChange(nextDate: string) {
    setDeliveryDate(nextDate);

    try {
      setLoadingAvailability(true);
      setError("");
      const response = await fetch(`/api/order?deliveryDate=${encodeURIComponent(nextDate)}`, {
        cache: "no-store"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "读取配送容量失败");
      }

      setAvailability(result);
      if (!result.areas.some((area: DeliveryAvailability["areas"][number]) => area.area === deliveryArea && area.isAvailable)) {
        const firstAvailableArea = result.areas.find((area: DeliveryAvailability["areas"][number]) => area.isAvailable)?.area ?? "";
        setDeliveryArea(firstAvailableArea);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "读取配送容量失败");
    } finally {
      setLoadingAvailability(false);
    }
  }

  const subtotal = useMemo(
    () => calculateSubtotal(items),
    [items]
  );
  const deliveryFee = useMemo(() => calculateDeliveryFee(subtotal), [subtotal]);
  const total = useMemo(() => calculateOrderTotal(subtotal), [subtotal]);
  const availableAreas = availability?.areas.filter((area) => area.isAvailable) ?? [];
  const fullAreas = availability?.areas.filter((area) => !area.isAvailable) ?? [];
  const selectedSlot = deliveryArea ? getDeliverySlotForArea(deliveryArea) : "";

  const [error, setError] = useState("");

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!deliveryArea) {
      setError(availability?.message ?? "请选择配送区域。");
      return;
    }

    if (!deliveryDate) {
      setError("请选择配送日期。");
      return;
    }

    setSubmitting(true);
    setError("");

    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        address,
        notes,
        deliveryDate,
        deliveryArea,
        items,
        subtotal,
        deliveryFee,
        total
      })
    });

    const result = await response.json();
    if (!response.ok || !result.orderNumber) {
      setError(result.error || "订单提交失败，请稍后重试。");
      setSubmitting(false);
      return;
    }

    window.localStorage.removeItem("cadence-cart");
    router.push(
      `/order-confirmation?orderNumber=${encodeURIComponent(result.orderNumber)}&deliveryDate=${encodeURIComponent(result.deliveryDate ?? deliveryDate)}&deliveryArea=${encodeURIComponent(result.deliveryArea ?? deliveryArea)}&deliverySlot=${encodeURIComponent(result.deliverySlot ?? selectedSlot)}&subtotal=${encodeURIComponent(String(result.subtotal ?? subtotal))}&deliveryFee=${encodeURIComponent(String(result.deliveryFee ?? deliveryFee))}&total=${encodeURIComponent(String(result.total ?? total))}`
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[0.8fr_1fr] md:px-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">结算</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">早晨配送</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-graphite">
          请填写姓名、电话、地址和备注，确认购物车后提交订单。
        </p>
        {availability?.message ? (
          <p className="mt-4 text-sm text-red-600">{availability.message}</p>
        ) : null}
      </div>
      <form className="grid gap-5 border border-ink/15 p-5" onSubmit={submitOrder}>
        <div className="grid grid-cols-2 gap-3">
          <input
            aria-label="姓名"
            placeholder="姓名"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 border border-ink/20 bg-paper px-3"
          />
          <input
            aria-label="电话"
            placeholder="手机号"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="h-12 border border-ink/20 bg-paper px-3"
          />
        </div>
        <input
          aria-label="地址"
          placeholder="收货地址"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="h-12 border border-ink/20 bg-paper px-3"
        />
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-[0.16em] text-graphite">配送日期</label>
          <select
            aria-label="配送日期"
            value={deliveryDate}
            onChange={(event) => {
              void handleDeliveryDateChange(event.target.value);
            }}
            disabled={isLoadingAvailability}
            className="h-12 border border-ink/20 bg-paper px-3"
          >
            <option value="">请选择配送日期</option>
            {(availability?.dateOptions ?? []).map((option) => (
              <option key={option.date} value={option.date} disabled={!option.isAvailable}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-[0.16em] text-graphite">配送区域</label>
          <select
            aria-label="配送区域"
            value={deliveryArea}
            onChange={(event) => setDeliveryArea(event.target.value as DeliveryArea | "")}
            disabled={isLoadingAvailability || availability?.isFull || !deliveryDate}
            className="h-12 border border-ink/20 bg-paper px-3"
          >
            <option value="">请选择配送区域</option>
            {availableAreas.map((area) => (
              <option key={area.area} value={area.area}>
                {area.area} / {area.slot}
              </option>
            ))}
          </select>
          {selectedSlot ? <p className="text-sm text-graphite">预计配送时间：{selectedSlot}</p> : null}
          {fullAreas.length > 0 ? (
            <div className="grid gap-1 text-sm text-graphite">
              {fullAreas.map((area) => (
                <p key={area.area}>{area.area}：该区域该日期配送已满</p>
              ))}
            </div>
          ) : null}
        </div>
        <textarea
          aria-label="备注"
          placeholder="备注（可选）"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-24 border border-ink/20 bg-paper px-3 py-3"
        />
        <div className="border-t border-ink/15 pt-4 font-mono text-sm">
          {items.map((item) => (
            <p key={item.slug}>{item.name} x {item.quantity}</p>
          ))}
          <div className="mt-3 grid gap-2 text-sm text-graphite">
            <p className="flex items-center justify-between">
              <span>商品金额</span>
              <span className="font-mono text-ink">RMB {subtotal}</span>
            </p>
            <p className="flex items-center justify-between">
              <span>配送费</span>
              <span className="font-mono text-ink">RMB {deliveryFee}</span>
            </p>
          </div>
          <p className="mt-3 flex items-center justify-between text-2xl text-ink">
            <span>订单总额</span>
            <span>RMB {total}</span>
          </p>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          data-testid="submit-order"
          disabled={
            isSubmitting ||
            items.length === 0 ||
            isLoadingAvailability ||
            availability?.isFull ||
            !deliveryDate ||
            !deliveryArea
          }
          className="h-12 bg-ink text-sm uppercase tracking-[0.18em] text-paper disabled:opacity-40"
        >
          {isSubmitting ? "提交中" : "提交订单"}
        </button>
      </form>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BOOKING_CLOSED_MESSAGE,
  getDeliverySlotForArea,
  normalizeDeliveryArea,
  type DeliveryArea,
  type DeliveryDateOption
} from "@/lib/delivery";
import {
  calculateDeliveryFee,
  calculateOrderTotal,
  calculateSubtotal
} from "@/lib/order-pricing";
import { products } from "@/lib/data";

type CartItem = {
  slug: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  selectedOptions?: {
    groupKey: string;
    groupLabel: string;
    value: string;
    label: string;
  }[];
};

type DeliveryAvailability = {
  date: string;
  defaultDeliveryDate: string;
  dateOptions: DeliveryDateOption[];
  areas: {
    area: DeliveryArea;
    slot: string;
    booked: number;
    remaining: number;
    isAvailable: boolean;
  }[];
};

type CheckoutMemory = {
  name: string;
  phone: string;
  address: string;
  notes: string;
  deliveryDate: string;
  deliveryArea: string;
};

type CustomerHistoryRecord = {
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const CHECKOUT_MEMORY_KEY = "cadence_checkout_memory_v1";
const CUSTOMER_HISTORY_KEY = "cadence_customer_history_v1";

function readCheckoutMemory(): Partial<CheckoutMemory> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CHECKOUT_MEMORY_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate: Partial<CheckoutMemory> = {
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      address: typeof parsed.address === "string" ? parsed.address : "",
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      deliveryDate: typeof parsed.deliveryDate === "string" ? parsed.deliveryDate : "",
      deliveryArea: typeof parsed.deliveryArea === "string" ? parsed.deliveryArea : ""
    };

    const hasAnyValue = Object.values(candidate).some((value) => typeof value === "string" && value.trim().length > 0);
    if (!hasAnyValue) {
      return null;
    }

    return candidate;
  } catch {
    return null;
  }
}

function saveCheckoutMemory(payload: Partial<CheckoutMemory>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const next: Partial<CheckoutMemory> = {
      name: typeof payload.name === "string" ? payload.name.trim() : "",
      phone: typeof payload.phone === "string" ? payload.phone.trim() : "",
      address: typeof payload.address === "string" ? payload.address.trim() : "",
      notes: typeof payload.notes === "string" ? payload.notes.trim() : "",
      deliveryDate: typeof payload.deliveryDate === "string" ? payload.deliveryDate : "",
      deliveryArea: typeof payload.deliveryArea === "string" ? payload.deliveryArea : ""
    };

    window.localStorage.setItem(CHECKOUT_MEMORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota or browser privacy restrictions.
  }
}

function normalizeCustomerName(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function readCustomerHistory(): CustomerHistoryRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CUSTOMER_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is Partial<CustomerHistoryRecord> => Boolean(entry) && typeof entry === "object")
      .map((entry) => ({
        name: typeof entry.name === "string" ? entry.name.trim() : "",
        phone: typeof entry.phone === "string" ? entry.phone.trim() : "",
        address: typeof entry.address === "string" ? entry.address.trim() : "",
        notes: typeof entry.notes === "string" ? entry.notes.trim() : "",
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date(0).toISOString(),
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date(0).toISOString()
      }))
      .filter((entry) => entry.name.length > 0 && entry.phone.length > 0 && entry.address.length > 0)
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
  } catch {
    return [];
  }
}

function saveCustomerHistoryEntry(entry: Partial<CustomerHistoryRecord>) {
  if (typeof window === "undefined") {
    return;
  }

  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  const phone = typeof entry.phone === "string" ? entry.phone.trim() : "";
  const address = typeof entry.address === "string" ? entry.address.trim() : "";
  const notes = typeof entry.notes === "string" ? entry.notes.trim() : "";

  if (!name || !phone || !address) {
    return;
  }

  try {
    const history = readCustomerHistory();
    const now = new Date().toISOString();
    const existingIndex = history.findIndex(
      (item) => normalizeCustomerName(item.name) === normalizeCustomerName(name) && item.phone === phone
    );

    const nextEntry: CustomerHistoryRecord = {
      name,
      phone,
      address,
      notes,
      createdAt: existingIndex >= 0 ? history[existingIndex].createdAt : now,
      updatedAt: now
    };

    let nextHistory = [...history];
    if (existingIndex >= 0) {
      nextHistory[existingIndex] = nextEntry;
    } else {
      nextHistory = [nextEntry, ...nextHistory];
    }

    nextHistory = nextHistory
      .filter((item) => item.phone !== "" && item.address !== "")
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
      .slice(0, 20);

    window.localStorage.setItem(CUSTOMER_HISTORY_KEY, JSON.stringify(nextHistory));
  } catch {
    // Ignore storage quota or browser privacy restrictions.
  }
}

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
  const [hasAutoFilledMemory, setHasAutoFilledMemory] = useState(false);
  const [customerHistoryMatches, setCustomerHistoryMatches] = useState<CustomerHistoryRecord[]>([]);
  const [selectedHistoryMatch, setSelectedHistoryMatch] = useState<CustomerHistoryRecord | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("cadence-cart");
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  useEffect(() => {
    const savedMemory = readCheckoutMemory();
    if (!savedMemory) {
      return;
    }

    setName(savedMemory.name ?? "");
    setPhone(savedMemory.phone ?? "");
    setAddress(savedMemory.address ?? "");
    setNotes(savedMemory.notes ?? "");
    setDeliveryArea(normalizeDeliveryArea(savedMemory.deliveryArea) ?? "");
    setHasAutoFilledMemory(true);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAvailability(date?: string) {
      try {
        setLoadingAvailability(true);
        const query = date ? `?deliveryDate=${encodeURIComponent(date)}` : "";
        const response = await fetch(`/api/order${query}`, { cache: "no-store" });
        const result = (await response.json()) as DeliveryAvailability & { error?: string };

        if (!response.ok) {
          throw new Error(result.error || "读取配送容量失败");
        }

        if (!isActive) {
          return;
        }

        const savedMemory = readCheckoutMemory();
        setAvailability(result);

        const rememberedDate =
          savedMemory?.deliveryDate &&
          result.dateOptions.some(
            (option: DeliveryDateOption) => option.date === savedMemory.deliveryDate && option.isAvailable
          )
            ? savedMemory.deliveryDate
            : result.date;

        const savedArea = normalizeDeliveryArea(savedMemory?.deliveryArea);
        const rememberedArea = savedArea && result.areas.some((area) => area.area === savedArea)
          ? savedArea
          : "";

        setDeliveryDate(rememberedDate);
        setDeliveryArea(rememberedArea);
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
      const result = (await response.json()) as DeliveryAvailability & { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "读取配送容量失败");
      }

      setAvailability(result);
      setDeliveryDate(result.date);
      if (!result.areas.some((area: DeliveryAvailability["areas"][number]) => area.area === deliveryArea)) {
        setDeliveryArea("");
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
  const availableAreas = availability?.areas ?? [];
  const selectedSlot = deliveryArea ? getDeliverySlotForArea(deliveryArea) : "";
  const productBySlug = useMemo(() => new Map(products.map((product) => [product.slug, product])), []);

  useEffect(() => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setCustomerHistoryMatches([]);
      setSelectedHistoryMatch(null);
      return;
    }

    const timer = window.setTimeout(() => {
      const matches = readCustomerHistory().filter(
        (entry) => normalizeCustomerName(entry.name) === normalizeCustomerName(trimmedName)
      );

      setCustomerHistoryMatches(matches);

      if (matches.length === 1) {
        setSelectedHistoryMatch(matches[0]);
        setPhone(matches[0].phone);
        setAddress(matches[0].address);
        setNotes(matches[0].notes);
      } else {
        setSelectedHistoryMatch(null);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [name]);

  function applyHistorySelection(candidate: CustomerHistoryRecord) {
    setPhone(candidate.phone || phone);
    setAddress(candidate.address || "");
    setNotes(candidate.notes || "");
    setSelectedHistoryMatch(candidate);
  }

  const [error, setError] = useState("");

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!availability?.dateOptions.some((option) => option.date === deliveryDate && option.isAvailable)) {
      setError(availability?.dateOptions.length === 0 ? BOOKING_CLOSED_MESSAGE : "请选择配送日期。");
      return;
    }

    if (!deliveryArea) {
      setError("请选择配送区域。");
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
      if (response.status === 409 && result.error === BOOKING_CLOSED_MESSAGE) {
        setDeliveryDate("");
        setDeliveryArea("");
        setAvailability({ date: "", defaultDeliveryDate: "", dateOptions: [], areas: [] });
        setSubmitting(false);
        return;
      }
      setError(result.error || "订单提交失败，请稍后重试。");
      setSubmitting(false);
      return;
    }

    saveCheckoutMemory({
      name,
      phone,
      address,
      notes,
      deliveryDate,
      deliveryArea
    });
    saveCustomerHistoryEntry({
      name,
      phone,
      address,
      notes
    });

    window.localStorage.removeItem("cadence-cart");
    router.push(
      `/order-confirmation?orderNumber=${encodeURIComponent(result.orderNumber)}&deliveryDate=${encodeURIComponent(result.deliveryDate ?? deliveryDate)}&deliveryArea=${encodeURIComponent(result.deliveryArea ?? deliveryArea)}&deliverySlot=${encodeURIComponent(result.deliverySlot ?? selectedSlot)}&subtotal=${encodeURIComponent(String(result.subtotal ?? subtotal))}&deliveryFee=${encodeURIComponent(String(result.deliveryFee ?? deliveryFee))}&total=${encodeURIComponent(String(result.total ?? total))}`
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[0.8fr_1fr] md:px-8 md:py-12">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">结算</p>
        <h1 className="mt-4 text-5xl leading-none md:mt-6 md:text-7xl">早晨配送</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-graphite md:mt-6">
          请填写姓名、电话、地址和备注，确认购物车后提交订单。
        </p>
      </div>
      <form className="grid gap-4 border border-ink/15 p-4 md:gap-5 md:p-5" onSubmit={submitOrder}>
        {hasAutoFilledMemory ? (
          <p className="text-xs uppercase tracking-[0.18em] text-graphite">已自动填写上次信息</p>
        ) : null}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
        {customerHistoryMatches.length > 1 ? (
          <div className="grid gap-2">
            <label className="text-[10px] uppercase tracking-[0.16em] text-graphite">历史配送信息</label>
            <select
              aria-label="历史配送信息"
              value={selectedHistoryMatch ? `${selectedHistoryMatch.phone}::${selectedHistoryMatch.address}` : ""}
              onChange={(event) => {
                const chosen = customerHistoryMatches.find(
                  (match) => `${match.phone}::${match.address}` === event.target.value
                );
                if (chosen) {
                  applyHistorySelection(chosen);
                }
              }}
              className="h-12 border border-ink/20 bg-paper px-3"
            >
              <option value="">请选择正确的历史配送信息</option>
              {customerHistoryMatches.map((match) => (
                <option key={`${match.phone}-${match.address}-${match.updatedAt}`} value={`${match.phone}::${match.address}`}>
                  {match.phone} / {match.address}
                </option>
              ))}
            </select>
          </div>
        ) : null}
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
            disabled={isLoadingAvailability || !availability?.dateOptions.length}
            className="h-12 border border-ink/20 bg-paper px-3"
          >
            <option value="">请选择配送日期</option>
            {(availability?.dateOptions ?? []).map((option: DeliveryDateOption) => (
              <option key={option.date} value={option.date} disabled={!option.isAvailable}>
                {option.label}
              </option>
            ))}
          </select>
          {availability?.dateOptions.length === 0 ? (
            <p className="text-sm text-graphite" role="status">{BOOKING_CLOSED_MESSAGE}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-[0.16em] text-graphite">配送区域</label>
          <select
            aria-label="配送区域"
            value={deliveryArea}
            onChange={(event) => setDeliveryArea(event.target.value as DeliveryArea | "")}
            disabled={isLoadingAvailability || !deliveryDate}
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
        </div>
        <textarea
          aria-label="备注"
          placeholder="备注（可选）"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-24 border border-ink/20 bg-paper px-3 py-3"
        />
        <div className="border-t border-ink/15 pt-3 font-mono text-sm">
          {items.map((item, index) => (
            <div key={`${item.slug}-${index}`} className="grid grid-cols-[52px_1fr] gap-3 py-1">
              <div className="relative h-14 w-14 overflow-hidden border border-ink/10 bg-bone">
                <Image
                  src={item.image ?? productBySlug.get(item.slug)?.image ?? "/assets/Latte.png"}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="leading-6">{item.name} x {item.quantity}</p>
                <p className="text-xs text-graphite">单价：￥{item.price}</p>
                {item.selectedOptions?.map((option) => (
                  <p key={`${item.slug}-${index}-${option.groupKey}`} className="text-xs text-graphite">
                    {option.groupLabel}：{option.label}
                  </p>
                ))}
                {(productBySlug.get(item.slug)?.inventoryItems ?? []).map((included, includedIndex) => {
                  const includedProduct = productBySlug.get(included.slug);
                  if (!includedProduct) {
                    return null;
                  }

                  return (
                    <p key={`${item.slug}-${index}-included-${includedIndex}`} className="text-xs text-graphite">
                      {includedProduct.name} x {included.quantity * item.quantity}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-2 grid gap-2 text-sm text-graphite">
            <p className="flex items-center justify-between">
              <span>商品金额</span>
              <span className="font-mono text-ink">RMB {subtotal}</span>
            </p>
            <p className="flex items-center justify-between">
              <span>配送费</span>
              <span className="font-mono text-ink">RMB {deliveryFee}</span>
            </p>
          </div>
          <p className="mt-3 flex items-center justify-between text-xl text-ink md:text-2xl">
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

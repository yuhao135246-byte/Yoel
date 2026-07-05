"use client";

import { useEffect, useMemo, useState } from "react";
import { notifyCartChanged } from "@/components/brand/floating-cart-button";
import type { Product } from "@/lib/data";

type SelectedOption = {
  groupKey: string;
  groupLabel: string;
  value: string;
  label: string;
};

type CartItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions?: SelectedOption[];
};

type AddToCartButtonProps = {
  product: Product;
  remainingStock?: number;
  deliveryDate?: string;
};

export function AddToCartButton({ product, remainingStock, deliveryDate }: AddToCartButtonProps) {
  const isSoldOut = typeof remainingStock === "number" && remainingStock <= 0;
  const [optionValues, setOptionValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.optionGroups ?? []).map((group) => [group.key, ""]))
  );
  const [selectionError, setSelectionError] = useState("");
  const [isAdded, setIsAdded] = useState(false);

  const selectedOptions = useMemo(() => {
    return (product.optionGroups ?? []).flatMap((group) => {
      const value = optionValues[group.key];
      const option = group.options.find((item) => item.value === value);
      if (!option) {
        return [];
      }

      return {
        groupKey: group.key,
        groupLabel: group.label,
        value: option.value,
        label: option.label
      } satisfies SelectedOption;
    });
  }, [optionValues, product.optionGroups]);

  function hasSameSelectedOptions(a?: SelectedOption[], b?: SelectedOption[]) {
    if ((a?.length ?? 0) !== (b?.length ?? 0)) {
      return false;
    }

    const listA = [...(a ?? [])].sort((left, right) => left.groupKey.localeCompare(right.groupKey));
    const listB = [...(b ?? [])].sort((left, right) => left.groupKey.localeCompare(right.groupKey));

    return listA.every((item, index) => {
      const target = listB[index];
      return (
        item.groupKey === target.groupKey &&
        item.groupLabel === target.groupLabel &&
        item.value === target.value &&
        item.label === target.label
      );
    });
  }

  function addToCart() {
    if (isSoldOut) {
      return;
    }

    const requiredGroups = (product.optionGroups ?? []).filter((group) => group.required !== false);
    for (const group of requiredGroups) {
      const value = optionValues[group.key];
      if (!value) {
        setSelectionError(`请选择${group.label}`);
        return;
      }
    }

    setSelectionError("");

    const raw = window.localStorage.getItem("cadence-cart");
    const items: CartItem[] = raw ? JSON.parse(raw) : [];
    const existing = items.find(
      (item) => item.slug === product.slug && hasSameSelectedOptions(item.selectedOptions, selectedOptions)
    );

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
        quantity: 1,
        selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined
      });
    }

    window.localStorage.setItem("cadence-cart", JSON.stringify(items));
    notifyCartChanged();
    setIsAdded(true);
  }

  useEffect(() => {
    if (!isAdded) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsAdded(false);
    }, 900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isAdded]);

  return (
    <div className="grid gap-3">
      {(product.optionGroups ?? []).map((group) => (
        <div key={`${product.slug}-${group.key}`} className="grid gap-2">
          <label className="text-xs uppercase tracking-[0.16em] text-graphite">
            {group.label}
            {group.required !== false ? "（必选）" : ""}
          </label>
          <select
            value={optionValues[group.key] ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setOptionValues((prev) => ({ ...prev, [group.key]: value }));
              setSelectionError("");
            }}
            className="h-12 border border-ink/20 bg-paper px-3 text-sm"
            aria-label={`${product.slug}-${group.key}`}
          >
            <option value="">请选择</option>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {selectionError ? <p className="text-sm text-red-600">{selectionError}</p> : null}
      {isAdded ? <p className="text-sm text-emerald-700">已加入购物车</p> : null}
      <button
        type="button"
        data-testid={`add-to-cart-${product.slug}`}
        onClick={addToCart}
        disabled={isSoldOut}
        className={`h-12 w-full border border-ink px-4 text-sm uppercase tracking-[0.18em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:px-5 ${
          isAdded ? "scale-[1.01] border-ink bg-ink text-paper" : ""
        }`}
        title={deliveryDate ? `配送日期 ${deliveryDate}` : undefined}
      >
        {isSoldOut ? "售罄" : isAdded ? "已加入" : "加入购物车"}
      </button>
    </div>
  );
}

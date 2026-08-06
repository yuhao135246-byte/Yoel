"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { notifyCartChanged } from "@/components/brand/floating-cart-button";
import { products } from "@/lib/data";

type FinishOption = {
  key: string;
  label: string;
  image: string;
};

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
  variant?: {
    baseColor: string;
  };
};

const UNIT_PRICE = 290;
const CADENCE_YELLOW = "#E2C44E";
const HERO_IMAGE_SRC = "/assets/Unit0108.jpeg";

const finishOptions: FinishOption[] = [
  { key: "yellow", label: "明黄", image: "/assets/Unit01 明黄.png" },
  { key: "bordeaux", label: "波尔多红", image: "/assets/Unit01 波尔多红.png" },
  { key: "crimson", label: "绯红", image: "/assets/Unit01 绯红.png" },
  { key: "sand", label: "哑光沙黄", image: "/assets/Unit01 沙黄.png" },
  { key: "white", label: "沙白", image: "/assets/Unit01 沙白.png" }
];

const finishImageByKey: Record<string, string> = {
  yellow: "/assets/Unit01 明黄.png",
  bordeaux: "/assets/Unit01 波尔多红.png",
  crimson: "/assets/Unit01 绯红.png",
  sand: "/assets/Unit01 沙黄.png",
  white: "/assets/Unit01 沙白.png"
};

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

export default function Unit01PreorderPage() {
  const router = useRouter();
  const unitProduct = useMemo(() => products.find((product) => product.slug === "unit-01"), []);
  const availableFinishOptions = useMemo(() => {
    const group = unitProduct?.optionGroups?.find((item) => item.key === "baseColor");
    if (!group) {
      return finishOptions;
    }

    return group.options.map((option) => ({
      key: option.value,
      label: option.label,
      image: finishImageByKey[option.value] ?? finishOptions[0].image
    }));
  }, [unitProduct]);
  const defaultFinish = availableFinishOptions[1] ?? availableFinishOptions[0] ?? finishOptions[0];

  const [selectedFinish, setSelectedFinish] = useState<FinishOption>(defaultFinish);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [remainingStock, setRemainingStock] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStock() {
      try {
        const response = await fetch("/api/inventory", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.records) || !active) {
          return;
        }

        const record = result.records.find((item: { productId: string }) => item.productId === "unit-01");
        if (!record) {
          return;
        }

        setRemainingStock(Number(record.remainingStock ?? 0));
      } catch {
        // Server-side checkout validation remains the source of truth.
      }
    }

    void loadStock();

    return () => {
      active = false;
    };
  }, []);

  const totalPrice = useMemo(() => UNIT_PRICE * quantity, [quantity]);
  const selectedOption = useMemo<SelectedOption>(() => {
    const baseColorGroup = unitProduct?.optionGroups?.find((group) => group.key === "baseColor");
    return {
      groupKey: "baseColor",
      groupLabel: baseColorGroup?.label ?? "底座颜色",
      value: selectedFinish.key,
      label: selectedFinish.label
    };
  }, [selectedFinish.key, selectedFinish.label, unitProduct?.optionGroups]);

  const isSoldOut = remainingStock !== null && remainingStock <= 0;

  function handleFinishSelect(option: FinishOption) {
    setSelectedFinish(option);
    setIsCustomSelected(false);
    setFeedback("");
  }

  function handleCustomSelect() {
    setIsCustomSelected(true);
    setFeedback("");
  }

  function decreaseQuantity() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function increaseQuantity() {
    setQuantity((prev) => prev + 1);
  }

  function readCartItems() {
    try {
      const raw = window.localStorage.getItem("cadence-cart");
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persistCartItems(items: CartItem[]) {
    window.localStorage.setItem("cadence-cart", JSON.stringify(items));
    notifyCartChanged();
  }

  function upsertUnitIntoCart(nextQuantity: number) {
    if (!unitProduct) {
      setFeedback("Unit 01 商品配置读取失败，请刷新后重试。");
      return false;
    }

    if (isCustomSelected) {
      setFeedback("可定制选项暂不支持加入购物车，请联系我们进行定制。");
      return false;
    }

    if (isSoldOut) {
      setFeedback("库存不足，当前已售罄。");
      return false;
    }

    const selectedOptions = [selectedOption];
    const items = readCartItems();
    const existing = items.find(
      (item) => item.slug === unitProduct.slug && hasSameSelectedOptions(item.selectedOptions, selectedOptions)
    );

    const currentSelectedQuantity = existing?.quantity ?? 0;
    const desiredQuantity = currentSelectedQuantity + Math.max(1, nextQuantity);

    if (remainingStock !== null && desiredQuantity > remainingStock) {
      setFeedback(`库存不足\n当前剩余：${remainingStock}`);
      return false;
    }

    if (existing) {
      existing.quantity = desiredQuantity;
      existing.variant = {
        baseColor: selectedFinish.key
      };
    } else {
      items.push({
        slug: unitProduct.slug,
        name: unitProduct.name,
        price: unitProduct.price,
        quantity: Math.max(1, nextQuantity),
        selectedOptions,
        variant: {
          baseColor: selectedFinish.key
        }
      });
    }

    persistCartItems(items);
    setFeedback("已加入购物车");
    return true;
  }

  function handleAddToCart() {
    upsertUnitIntoCart(quantity);
  }

  function handlePreorderNow() {
    const ok = upsertUnitIntoCart(quantity);
    if (!ok) {
      return;
    }

    router.push("/checkout");
  }

  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto grid min-h-[calc(100svh-96px)] max-w-7xl gap-12 px-5 py-12 md:grid-cols-[1.08fr_0.92fr] md:gap-14 md:px-8 md:py-16">
        <div className="flex flex-col justify-center">
          <div className="overflow-hidden border border-ink/10 bg-bone/25">
            <img
              src={HERO_IMAGE_SRC}
              alt="Unit 01 hero image"
              className="aspect-[4/3] h-auto w-full object-cover"
              onError={(event) => {
                if (event.currentTarget.src.includes("Unit0108.jpeg")) {
                  event.currentTarget.src = "/assets/Unit0108.jpg";
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-10">
          <div className="grid gap-10">
            <header className="grid gap-3 border-b border-ink/12 pb-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Unit 01</p>
              <h1 className="text-5xl leading-none md:text-6xl">户外照明装置</h1>
              <p className="font-mono text-xl">￥290</p>
            </header>

            <section className="grid gap-5">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-graphite">Base Finish</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {availableFinishOptions.map((option) => {
                  const isSelected = !isCustomSelected && selectedFinish.key === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleFinishSelect(option)}
                      className="grid gap-2.5 text-left"
                    >
                      <span
                        className="relative block overflow-hidden border bg-bone/20 transition-colors duration-200"
                        style={{ borderColor: isSelected ? CADENCE_YELLOW : "rgba(11,11,10,0.18)" }}
                      >
                        <img
                          src={option.image}
                          alt={option.label}
                          className="aspect-[4/3] h-auto w-full object-contain"
                        />
                        {isSelected ? (
                          <span className="absolute bottom-3 right-3 font-mono text-[11px] tracking-[0.12em]" style={{ color: CADENCE_YELLOW }}>
                            ✓ 已选择
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm text-graphite">{option.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleCustomSelect}
                  className="grid gap-2.5 text-left"
                >
                  <span
                    className="flex aspect-[4/3] items-center justify-center border bg-transparent transition-colors duration-200"
                    style={{ borderColor: isCustomSelected ? CADENCE_YELLOW : "rgba(11,11,10,0.18)" }}
                  >
                    <span className="text-3xl leading-none" style={{ color: isCustomSelected ? CADENCE_YELLOW : "#0b0b0a" }}>+</span>
                  </span>
                  <span className="text-sm text-graphite">可定制</span>
                </button>
              </div>
              {isCustomSelected ? (
                <p className="text-sm text-graphite">请联系我们进行定制</p>
              ) : null}
              {isSoldOut ? <p className="text-sm text-red-600">库存不足，当前已售罄。</p> : null}
            </section>

            <section className="grid gap-4 border-t border-ink/12 pt-7">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-graphite">配置</h2>
              <div className="grid gap-3 text-sm md:text-base">
                <div className="grid gap-1">
                  <p className="text-graphite">底座颜色</p>
                  <p>{isCustomSelected ? "可定制" : selectedOption.label}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-graphite">数量</p>
                  <p>{quantity}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-graphite">单价</p>
                  <p>￥{UNIT_PRICE}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-graphite">合计</p>
                  <p>￥{totalPrice}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-3 border-t border-ink/12 pt-7">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-graphite">数量</p>
              <div className="inline-flex w-fit items-center border border-ink/20">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="grid h-12 w-12 place-items-center text-xl leading-none transition-colors duration-200 hover:bg-ink/5"
                  aria-label="减少数量"
                >
                  -
                </button>
                <span className="grid h-12 min-w-12 place-items-center border-x border-ink/20 px-4 font-mono text-base">{quantity}</span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="grid h-12 w-12 place-items-center text-xl leading-none transition-colors duration-200 hover:bg-ink/5"
                  aria-label="增加数量"
                >
                  +
                </button>
              </div>
            </section>
          </div>

          <div className="grid gap-3 pt-2 md:grid-cols-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="border border-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-200 hover:border-[#E2C44E] hover:text-[#E2C44E]"
            >
              加入购物车
            </button>
            <button
              type="button"
              onClick={handlePreorderNow}
              disabled={isSoldOut}
              className="border border-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-200 hover:border-[#E2C44E] hover:text-[#E2C44E]"
            >
              立即预售
            </button>
          </div>
          {feedback ? <p className="whitespace-pre-line text-sm text-graphite">{feedback}</p> : null}
        </div>
      </section>
    </main>
  );
}

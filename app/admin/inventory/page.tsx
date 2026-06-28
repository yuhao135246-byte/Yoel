"use client";

import { useEffect, useMemo, useState } from "react";
import { getBookingDateOptions, getDefaultBookingDate } from "@/lib/delivery";

type InventoryRow = {
  productId: string;
  productName: string;
  totalStock: number;
  soldQuantity: number;
  remainingStock: number;
  status: "Available" | "Sold Out";
};

type InventoryResponse = {
  deliveryDate: string;
  records: InventoryRow[];
};

export default function InventoryPage() {
  const [deliveryDate, setDeliveryDate] = useState(getDefaultBookingDate());
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState<string | null>(null);
  const [error, setError] = useState("");

  const quickDates = useMemo(() => getBookingDateOptions().map((item) => ({ label: item.label, value: item.date })), []);

  async function loadInventory(date: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/inventory?deliveryDate=${encodeURIComponent(date)}`, {
        cache: "no-store"
      });
      const result = (await response.json()) as InventoryResponse | { error: string };

      if (!response.ok || "error" in result) {
        throw new Error("error" in result ? result.error : "读取库存失败");
      }

      setRows(result.records);
      setDrafts(
        Object.fromEntries(result.records.map((row) => [row.productId, row.totalStock]))
      );
    } catch (fetchError) {
      setRows([]);
      setDrafts({});
      setError(fetchError instanceof Error ? fetchError.message : "读取库存失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInventory(deliveryDate);
  }, [deliveryDate]);

  async function saveRow(productId: string) {
    const nextStock = Number(drafts[productId]);
    if (!Number.isFinite(nextStock) || nextStock < 0) {
      setError("库存必须是大于等于 0 的数字");
      return;
    }

    setSavingProduct(productId);
    setError("");

    try {
      console.log("[inventory] PATCH", { productId, deliveryDate, totalStock: nextStock });
      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          deliveryDate,
          totalStock: nextStock
        })
      });
      const result = await response.json();
      console.log("[inventory] PATCH response", response.status, result);

      if (!response.ok) {
        throw new Error(result.error || "保存失败");
      }

      console.log("[inventory] 保存成功，重新读取库存");
      await loadInventory(deliveryDate);
    } catch (saveError) {
      console.error("[inventory] 保存失败:", saveError);
      setError(saveError instanceof Error ? saveError.message : "保存失败");
    } finally {
      setSavingProduct(null);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Inventory</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">库存管理</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-graphite">
          仅设置初始库存。系统会在订单创建成功后自动扣减库存，并实时计算已售数量与剩余库存。
        </p>

        <div className="mt-8 grid gap-4 border border-ink/15 p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">配送日期</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickDates.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDeliveryDate(item.value)}
                  className={`border px-3 py-2 text-xs uppercase tracking-[0.14em] ${
                    deliveryDate === item.value ? "border-ink bg-ink text-paper" : "border-ink/20"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-8 grid gap-4">
          {loading ? <p className="text-sm text-graphite">库存加载中...</p> : null}

          {!loading && rows.length === 0 ? <p className="text-sm text-graphite">暂无库存数据。</p> : null}

          {rows.map((row) => (
            <article key={row.productId} className="border border-ink/15 p-5">
              <h2 className="text-2xl">{row.productName}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_auto] md:items-end">
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
                  初始库存
                  <input
                    type="number"
                    min="0"
                    value={drafts[row.productId] ?? row.totalStock}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.productId]: Number(event.target.value)
                      }))
                    }
                    className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case tracking-normal"
                  />
                </label>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">已售</p>
                  <p className="mt-2 text-xl">{row.soldQuantity}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">剩余</p>
                  <p className="mt-2 text-xl">{row.remainingStock}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">状态</p>
                  <p className="mt-2 text-xl">{row.remainingStock <= 0 ? "售罄" : "在售"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void saveRow(row.productId);
                  }}
                  disabled={savingProduct === row.productId}
                  className="h-12 border border-ink px-5 text-sm uppercase tracking-[0.18em] disabled:opacity-50"
                >
                  {savingProduct === row.productId ? "保存中" : "更新初始库存"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

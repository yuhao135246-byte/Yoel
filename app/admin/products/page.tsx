"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const EMPTY_FORM = {
  slug: "",
  name: "",
  category: "COFFEE",
  layer: "",
  subtitle: "",
  price: "0",
  currency: "¥",
  unit: "",
  availability: "Available",
  description: "",
  image: "",
  sort_order: "0",
  is_active: true,
  is_available: true,
  initial_stock: "0",
  origin: "",
  farm: "",
  variety: "",
  process: "",
  altitude: "",
  tasting_notes: "",
  details: "",
  tags: "",
  option_groups: ""
};

type ProductRecord = {
  slug: string;
  name: string;
  category: "COFFEE" | "OBJECT" | "RESEARCH";
  layer?: string | null;
  subtitle?: string | null;
  price: number;
  currency?: string | null;
  unit?: string | null;
  availability?: string | null;
  description?: string | null;
  image?: string | null;
  is_active?: boolean;
  is_available?: boolean;
  initial_stock?: number;
  sort_order?: number;
  origin?: string | null;
  farm?: string | null;
  variety?: string | null;
  process?: string | null;
  altitude?: string | null;
  tasting_notes?: string | null;
  details?: string[] | null;
  tags?: string[] | null;
  option_groups?: unknown[] | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [selected, setSelected] = useState<ProductRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
        headers: { accept: "application/json" }
      });

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const result = (await response.json()) as { products?: ProductRecord[]; error?: string };
      if (!response.ok || !result.products) {
        throw new Error(result.error || "无法加载商品");
      }

      setProducts(result.products);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "无法加载商品");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function openNewForm() {
    setIsCreating(true);
    setSelected(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setSuccess("");
  }

  function openEditForm(product: ProductRecord) {
    setIsCreating(false);
    setSelected(product);
    setForm({
      slug: product.slug,
      name: product.name,
      category: product.category,
      layer: product.layer ?? "",
      subtitle: product.subtitle ?? "",
      price: String(product.price ?? 0),
      currency: product.currency ?? "¥",
      unit: product.unit ?? "",
      availability: product.availability ?? "Available",
      description: product.description ?? "",
      image: product.image ?? "",
      sort_order: String(product.sort_order ?? 0),
      is_active: product.is_active !== false,
      is_available: product.is_available !== false,
      initial_stock: String(product.initial_stock ?? 0),
      origin: product.origin ?? "",
      farm: product.farm ?? "",
      variety: product.variety ?? "",
      process: product.process ?? "",
      altitude: product.altitude ?? "",
      tasting_notes: product.tasting_notes ?? "",
      details: Array.isArray(product.details) ? product.details.join(", ") : "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      option_groups: Array.isArray(product.option_groups) ? JSON.stringify(product.option_groups, null, 2) : ""
    });
    setError("");
    setSuccess("");
  }

  async function submitForm() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const slugValue = isCreating ? form.slug : selected?.slug ?? form.slug;
      const detailsValue = form.details
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const tagsValue = form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      let parsedOptionGroups: unknown[] = [];
      if (form.option_groups.trim()) {
        const parsed = JSON.parse(form.option_groups);
        if (!Array.isArray(parsed)) {
          throw new Error("option_groups 必须是 JSON 数组");
        }
        parsedOptionGroups = parsed;
      }

      const payload = {
        ...form,
        slug: slugValue,
        price: Number(form.price) || 0,
        sort_order: Number(form.sort_order) || 0,
        initial_stock: Number(form.initial_stock) || 0,
        is_active: form.is_active,
        is_available: form.is_available,
        details: detailsValue,
        tags: tagsValue,
        option_groups: parsedOptionGroups
      };

      if (!payload.name.trim()) {
        throw new Error("名称不能为空");
      }

      if (!payload.slug.trim()) {
        throw new Error("slug 不能为空");
      }

      if (!/^[a-z0-9-]+$/.test(payload.slug.trim())) {
        throw new Error("slug 只能包含小写字母、数字和横线");
      }

      if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
        throw new Error("价格必须是大于等于 0 的数字");
      }

      if (!['COFFEE', 'OBJECT', 'RESEARCH'].includes(payload.category)) {
        throw new Error("category 不合法");
      }

      const url = isCreating ? "/api/admin/products" : `/api/admin/products/${encodeURIComponent(selected?.slug ?? payload.slug)}`;
      const method = isCreating ? "POST" : "PATCH";
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { error?: string; product?: ProductRecord };
      if (!response.ok) {
        throw new Error(result.error || "保存失败");
      }

      setSuccess(isCreating ? "商品已创建" : "商品已更新");
      setSelected(result.product ?? null);
      setIsCreating(false);
      await loadProducts();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function unpublishProduct(product: ProductRecord) {
    const confirmed = window.confirm(`确定要下架「${product.name}」吗？下架后商品不会出现在前台，但历史订单和库存记录不会被删除。`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.slug)}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: true, is_active: false })
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "下架失败");
      }

      setSuccess("商品已下架");
      await loadProducts();
    } catch (softDeleteError) {
      setError(softDeleteError instanceof Error ? softDeleteError.message : "下架失败");
    }
  }

  async function restoreProduct(product: ProductRecord) {
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.slug)}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: true, is_active: true })
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "恢复上架失败");
      }

      setSuccess("商品已恢复上架");
      await loadProducts();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "恢复上架失败");
    }
  }

  const imagePreview = form.image?.trim().startsWith("/") ? form.image.trim() : "";

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Products</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">商品管理</h1>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={openNewForm}
            className="border border-ink bg-ink px-5 py-3 text-sm uppercase tracking-[0.18em] text-paper"
          >
            + 新增商品
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-emerald-700">{success}</p> : null}

        {(isCreating || selected) && (
          <section className="mt-8 grid gap-6 border border-ink/15 p-5 md:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4">
              <div className="grid gap-2 md:grid-cols-2">
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  商品名称
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>

                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  slug
                  <input
                    value={form.slug}
                    onChange={(event) => {
                      if (isCreating) {
                        const nextValue = slugify(event.target.value);
                        setForm((prev) => ({ ...prev, slug: nextValue }));
                      }
                    }}
                    disabled={!isCreating}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  category
                  <select
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as typeof prev.category }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  >
                    <option value="COFFEE">COFFEE</option>
                    <option value="OBJECT">OBJECT</option>
                    <option value="RESEARCH">RESEARCH</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  价格
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  货币
                  <input
                    value={form.currency}
                    onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  副标题
                  <input
                    value={form.subtitle}
                    onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  单位
                  <input
                    value={form.unit}
                    onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                简短描述
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="resize-none border border-ink/20 bg-paper p-3 text-base"
                />
              </label>

              <div className="grid gap-2 md:grid-cols-2">
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  Details
                  <textarea
                    rows={2}
                    value={form.details}
                    onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
                    placeholder="用逗号分隔多个 detail"
                    className="resize-none border border-ink/20 bg-paper p-3 text-base"
                  />
                </label>

                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  Tags
                  <textarea
                    rows={2}
                    value={form.tags}
                    onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                    placeholder="用逗号分隔多个 tag"
                    className="resize-none border border-ink/20 bg-paper p-3 text-base"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                option_groups (JSON)
                <textarea
                  rows={3}
                  value={form.option_groups}
                  onChange={(event) => setForm((prev) => ({ ...prev, option_groups: event.target.value }))}
                  placeholder={'[{"key":"wrapChoice","label":"鸡肉卷选择","options":[]}]'}
                  className="resize-none border border-ink/20 bg-paper p-3 font-mono text-sm"
                />
              </label>

              <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                图片路径
                <input
                  value={form.image}
                  onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                  placeholder="/assets/example.png"
                  className="h-12 border border-ink/20 bg-paper px-3 text-base"
                />
              </label>

              <div className="grid gap-2 md:grid-cols-3">
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  排序
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(event) => setForm((prev) => ({ ...prev, sort_order: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  初始库存
                  <input
                    type="number"
                    min="0"
                    value={form.initial_stock}
                    onChange={(event) => setForm((prev) => ({ ...prev, initial_stock: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  可见状态
                  <select
                    value={String(form.is_active)}
                    onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.value === "true" }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  >
                    <option value="true">在售</option>
                    <option value="false">下架</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  Origin
                  <input
                    value={form.origin}
                    onChange={(event) => setForm((prev) => ({ ...prev, origin: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  Farm
                  <input
                    value={form.farm}
                    onChange={(event) => setForm((prev) => ({ ...prev, farm: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  Variety
                  <input
                    value={form.variety}
                    onChange={(event) => setForm((prev) => ({ ...prev, variety: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  Process
                  <input
                    value={form.process}
                    onChange={(event) => setForm((prev) => ({ ...prev, process: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                  Altitude
                  <input
                    value={form.altitude}
                    onChange={(event) => setForm((prev) => ({ ...prev, altitude: event.target.value }))}
                    className="h-12 border border-ink/20 bg-paper px-3 text-base"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
                Tasting Notes
                <textarea
                  rows={2}
                  value={form.tasting_notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, tasting_notes: event.target.value }))}
                  className="resize-none border border-ink/20 bg-paper p-3 text-base"
                />
              </label>
            </div>

            <div className="grid gap-4">
              {imagePreview ? (
                <div className="overflow-hidden border border-ink/15 bg-bone">
                  <Image src={imagePreview} alt={form.name || "商品图片预览"} width={960} height={720} className="aspect-[4/3] w-full object-cover" />
                </div>
              ) : (
                <div className="flex min-h-[220px] items-center justify-center border border-dashed border-ink/20 text-sm text-graphite">
                  图片预览
                </div>
              )}

              <div className="grid gap-2 text-xs uppercase tracking-[0.12em] text-graphite">
                <p>状态：{form.is_active ? "在售" : "已下架"}</p>
                <p>运营可售：{form.is_available ? "是" : "否"}</p>
              </div>

              <button
                type="button"
                onClick={() => void submitForm()}
                disabled={saving}
                className="h-12 border border-ink bg-ink px-5 text-sm uppercase tracking-[0.18em] text-paper disabled:opacity-50"
              >
                {saving ? "Saving..." : isCreating ? "创建商品" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setIsCreating(false);
                  setForm({ ...EMPTY_FORM });
                  setSuccess("");
                  setError("");
                }}
                className="h-12 border border-ink px-5 text-sm uppercase tracking-[0.18em]"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        <div className="mt-10 grid gap-4">
          {loading ? <p className="text-sm text-graphite">商品加载中...</p> : null}

          {!loading && products.length === 0 ? <p className="text-sm text-graphite">暂无商品。</p> : null}

          {products.map((product) => (
            <article key={product.slug} className="grid gap-4 border border-ink/15 p-5 md:grid-cols-[180px_1fr_auto] md:items-center">
              <div className="overflow-hidden border border-ink/15 bg-bone">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={480}
                    height={360}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-xs uppercase tracking-[0.16em] text-graphite">
                    No image
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl">{product.name}</h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-warm">{product.category}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-graphite">
                    {product.is_active === false ? "已下架" : "在售"}
                  </span>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-graphite">slug: {product.slug}</p>
                <p className="text-sm text-graphite">价格：{product.currency ?? "¥"}{product.price}</p>
                <p className="text-sm text-graphite">排序：{product.sort_order ?? 0}</p>
                <p className="text-sm text-graphite">初始库存：{product.initial_stock ?? 0}</p>
              </div>

              <div className="flex flex-wrap gap-2 md:flex-col">
                <button
                  type="button"
                  onClick={() => openEditForm(product)}
                  className="border border-ink px-4 py-2 text-xs uppercase tracking-[0.16em]"
                >
                  编辑
                </button>

                {product.is_active === false ? (
                  <button
                    type="button"
                    onClick={() => restoreProduct(product)}
                    className="border border-ink bg-ink px-4 py-2 text-xs uppercase tracking-[0.16em] text-paper"
                  >
                    重新上架
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => unpublishProduct(product)}
                    className="border border-ink px-4 py-2 text-xs uppercase tracking-[0.16em]"
                  >
                    下架
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

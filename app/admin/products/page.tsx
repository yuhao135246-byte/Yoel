"use client";

import Image from "next/image";
import { useState } from "react";
import { products } from "@/lib/data";

export default function ProductsPage() {
  const [drafts, setDrafts] = useState(() =>
    products.map((product) => ({
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle ?? "",
      description: product.description,
      details: product.details.join("｜"),
      availability: product.availability,
      available: product.available ?? true,
      price: product.price,
      image: product.image
    }))
  );

  function updateDraft(
    slug: string,
    key: "name" | "subtitle" | "description" | "details" | "availability" | "price" | "image",
    value: string
  ) {
    setDrafts((prev) =>
      prev.map((item) => {
        if (item.slug !== slug) {
          return item;
        }

        if (key === "price") {
          const parsed = Number(value);
          return { ...item, price: Number.isFinite(parsed) ? parsed : item.price };
        }

        return { ...item, [key]: value };
      })
    );
  }

  function updateAvailabilityFlag(slug: string, value: boolean) {
    setDrafts((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, available: value } : item))
    );
  }

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Products</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">Products</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {products.map((product) => {
            const draft = drafts.find((item) => item.slug === product.slug)!;

            return (
            <article key={product.slug} className="grid grid-cols-[0.45fr_1fr] gap-5 border-t border-ink/15 pt-5">
              <Image src={draft.image} alt={draft.name} width={640} height={480} className="aspect-square object-cover" />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-warm">{product.category}</p>
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft(product.slug, "name", event.target.value)}
                  className="mt-2 w-full bg-transparent text-2xl outline-none"
                  aria-label={`${product.slug}-name`}
                />
                <input
                  value={draft.subtitle}
                  onChange={(event) => updateDraft(product.slug, "subtitle", event.target.value)}
                  className="mt-3 w-full bg-transparent text-sm leading-7 text-graphite outline-none"
                  aria-label={`${product.slug}-subtitle`}
                />
                <textarea
                  value={draft.description}
                  onChange={(event) => updateDraft(product.slug, "description", event.target.value)}
                  className="mt-3 w-full resize-none bg-transparent text-sm leading-7 text-graphite outline-none"
                  rows={2}
                  aria-label={`${product.slug}-tasting-notes`}
                />
                <textarea
                  value={draft.details}
                  onChange={(event) => updateDraft(product.slug, "details", event.target.value)}
                  className="mt-3 w-full resize-none bg-transparent text-sm leading-7 text-graphite outline-none"
                  rows={2}
                  aria-label={`${product.slug}-ingredients`}
                />
                <input
                  value={draft.availability}
                  onChange={(event) => updateDraft(product.slug, "availability", event.target.value)}
                  className="mt-3 w-full bg-transparent text-sm leading-7 text-graphite outline-none"
                  aria-label={`${product.slug}-availability-label`}
                />
                <label className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-graphite">
                  <input
                    type="checkbox"
                    checked={draft.available}
                    onChange={(event) => updateAvailabilityFlag(product.slug, event.target.checked)}
                    aria-label={`${product.slug}-available`}
                  />
                  可售状态
                </label>
                <input
                  type="number"
                  value={draft.price}
                  onChange={(event) => updateDraft(product.slug, "price", event.target.value)}
                  className="mt-4 w-full bg-transparent font-mono text-sm outline-none"
                  aria-label={`${product.slug}-price`}
                />
                <input
                  value={draft.image}
                  onChange={(event) => updateDraft(product.slug, "image", event.target.value)}
                  className="mt-3 w-full bg-transparent text-xs text-graphite outline-none"
                  aria-label={`${product.slug}-image`}
                />
                <p className="mt-1 text-xs text-graphite">仅供 Admin 编辑预览（未持久化）</p>
              </div>
            </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

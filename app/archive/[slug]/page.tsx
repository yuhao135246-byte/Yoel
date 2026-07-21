import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/brand/add-to-cart-button";
import { RevealOnView } from "@/components/brand/reveal-on-view";
import { archiveBySlug, archiveEntries } from "@/lib/archive";
import { products } from "@/lib/data";

type ArchivePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function resolveArchiveProduct(targetSlug?: string) {
  const objectProducts = products.filter((product) => product.category === "OBJECT");

  if (!targetSlug) {
    return objectProducts[0] ?? null;
  }

  const normalizedTarget = targetSlug.trim().toLowerCase();

  const exactSlug = products.find((product) => product.slug.toLowerCase() === normalizedTarget);
  if (exactSlug) {
    return exactSlug;
  }

  const looseMatch = products.find((product) => {
    const fields = [product.slug, product.name, product.layer, ...(product.tags ?? [])]
      .join(" ")
      .toLowerCase();
    return fields.includes(normalizedTarget.replaceAll("-", " "));
  });

  if (looseMatch) {
    return looseMatch;
  }

  return objectProducts[0] ?? null;
}

export function generateStaticParams() {
  return archiveEntries.map((entry) => ({ slug: entry.slug }));
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { slug } = await params;
  const entry = archiveBySlug.get(slug);

  if (!entry) {
    notFound();
  }

  const product = resolveArchiveProduct(entry.productSlug);
  const currency = product?.currency ?? "RMB";
  const priceLabel = product ? (/^[¥$€£]$/.test(currency) ? `${currency}${product.price}` : `${currency} ${product.price}`) : null;
  const isUnit01 = entry.slug === "unit-01";
  const pageClassName = "mx-auto flex min-h-[96svh] w-full max-w-5xl flex-col justify-between px-5 py-10 md:min-h-[820px] md:px-8 md:py-14";
  const contentClassName = "mx-auto w-full max-w-[430px] md:max-w-[560px]";

  return (
    <main className="bg-paper text-ink">
      <RevealOnView className={pageClassName}>
        <section className={contentClassName}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">{entry.unitLabel}</p>
          <h1 className="mt-4 text-[42px] leading-none tracking-[-0.03em] md:mt-5 md:text-7xl">{entry.englishTitle}</h1>
          <p className="mt-2 text-3xl leading-none tracking-[-0.02em] md:text-5xl">{entry.workTitle}</p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-graphite">{entry.objectType}</p>
          <div className="h-[38svh] min-h-[200px] md:h-[360px]" />
          <div className="grid gap-1 text-sm text-graphite md:text-base">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{entry.editionLabel}</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{entry.publicationYear}</p>
          </div>
        </section>
        <p className="mx-auto w-full max-w-[430px] font-mono text-[11px] uppercase tracking-[0.16em] text-graphite md:max-w-[560px]">01</p>
      </RevealOnView>

      <RevealOnView className={pageClassName}>
        <section className={contentClassName}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">项目信息</p>
          <h2 className="mt-4 text-4xl leading-none tracking-[-0.02em] md:text-5xl">项目信息</h2>
          <div className="mt-8 grid gap-5 text-sm leading-7 text-graphite md:mt-10 md:text-base">
            {entry.objectInfoRows.map((row) => (
              <div key={`${entry.slug}-${row.label}`} className="grid grid-cols-[96px_1fr] gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/70">{row.label}</p>
                <p>{row.value}</p>
              </div>
            ))}
          </div>
          <div className="h-[26svh] min-h-[130px] md:h-[210px]" />
        </section>
        <p className="mx-auto w-full max-w-[430px] font-mono text-[11px] uppercase tracking-[0.16em] text-graphite md:max-w-[560px]">02</p>
      </RevealOnView>

      <RevealOnView className={pageClassName}>
        <section className={contentClassName}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">设计陈述</p>
          <blockquote className="mt-7 text-2xl leading-[1.55] tracking-[-0.01em] text-ink/95 md:mt-9 md:text-3xl">
            <p>“{entry.openingQuote[0]}</p>
            <p>{entry.openingQuote[1]}”</p>
          </blockquote>
          <div className="mt-10 grid gap-4 md:mt-12 md:gap-5">
            {entry.designStatement.map((paragraph) => (
              <p key={`${entry.slug}-${paragraph}`} className="text-base leading-8 text-graphite md:text-[17px]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
        <p className="mx-auto w-full max-w-[430px] font-mono text-[11px] uppercase tracking-[0.16em] text-graphite md:max-w-[560px]">03</p>
      </RevealOnView>

      <RevealOnView className={pageClassName}>
        <section className={contentClassName}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">目录</p>
          <h2 className="mt-4 text-4xl leading-none tracking-[-0.02em] md:text-5xl">目录</h2>
          <div className="mt-8 grid gap-3 text-sm tracking-[0.08em] text-graphite md:mt-10 md:grid-cols-2 md:gap-4 md:text-base">
            {entry.plannedChapters.map((chapter) => (
              <p key={`${entry.slug}-${chapter}`} className="py-1.5">
                {chapter}
              </p>
            ))}
          </div>
        </section>
        <p className="mx-auto w-full max-w-[430px] font-mono text-[11px] uppercase tracking-[0.16em] text-graphite md:max-w-[560px]">04</p>
      </RevealOnView>

      <RevealOnView className={pageClassName}>
        <section className={contentClassName}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">档案页</p>
          <h2 className="mt-4 text-4xl leading-none tracking-[-0.02em] md:text-5xl">设计档案整理中</h2>
          <p className="mt-7 text-base leading-8 text-graphite md:text-[17px]">未来这里将呈现完整的设计出版内容，包括：</p>
          <div className="mt-8 grid gap-3 text-sm tracking-[0.08em] text-graphite md:grid-cols-2 md:gap-4 md:text-base">
            {entry.plannedChapters.map((chapter) => (
              <p key={`${entry.slug}-placeholder-${chapter}`} className="py-1.5">
                {chapter}
              </p>
            ))}
          </div>
          <div className="h-[26svh] min-h-[130px] md:h-[200px]" />
        </section>
        <p className="mx-auto w-full max-w-[430px] font-mono text-[11px] uppercase tracking-[0.16em] text-graphite md:max-w-[560px]">05</p>
      </RevealOnView>

      <RevealOnView className="mx-auto flex min-h-[96svh] w-full max-w-5xl flex-col justify-between px-5 pb-16 pt-10 md:min-h-[820px] md:px-8 md:pb-24 md:pt-14">
        <section className={contentClassName}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">拥有</p>
          <h2 className="mt-4 text-4xl leading-none tracking-[-0.02em] md:text-5xl">拥有 {entry.unitLabel}</h2>
          <p className="mt-2 text-2xl leading-none md:text-3xl">{entry.workTitle}</p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-graphite">{entry.editionLabel}</p>

          {product ? (
            <div className="mt-9 grid gap-6">
              <div className="grid gap-3 text-graphite">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-warm">价格</p>
                <p className="text-3xl leading-none text-ink md:text-4xl">{priceLabel}</p>
                <p className="pt-2 text-base leading-8 md:text-[17px]">
                  {isUnit01
                    ? "作为 Cadence 数字设计年鉴中的首个已发布作品，UNIT 01 将概念、材料与光线实验凝聚为可被拥有的日常对象。"
                    : product.description}
                </p>
              </div>

              <div className="grid gap-4 pt-2">
                <AddToCartButton product={product} />
                <Link href="/cart" className="inline-flex h-12 items-center justify-center text-sm uppercase tracking-[0.18em] text-ink underline underline-offset-4">
                  拥有 {entry.unitLabel}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-9 grid gap-4 text-graphite">
              <p className="text-base leading-8 md:text-[17px]">当前版本尚未开放拥有。</p>
            </div>
          )}
        </section>
        <p className="mx-auto w-full max-w-[430px] font-mono text-[11px] uppercase tracking-[0.16em] text-graphite md:max-w-[560px]">06</p>
      </RevealOnView>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArchiveListSection } from "@/components/brand/archive-list-section";
import { PhotoCredit } from "@/components/brand/photo-credit";
import { RevealOnView } from "@/components/brand/reveal-on-view";
import { UnitGallerySlideshow } from "@/components/brand/unit-gallery-slideshow";

const unit01GalleryImages = [
  {
    src: "/assets/Unit0101.png",
    alt: "UNIT 01 gallery image 01",
    width: 1800,
    height: 1200
  },
  {
    src: "/assets/Unit0102.png",
    alt: "UNIT 01 gallery image 02",
    width: 1800,
    height: 1200
  },
  {
    src: "/assets/Unit0103.png",
    alt: "UNIT 01 gallery image 03",
    width: 1800,
    height: 1200
  },
  {
    src: "/assets/Unit0105.png",
    alt: "UNIT 01 gallery image 05",
    width: 1800,
    height: 1200
  },
  {
    src: "/assets/Unit0106.png",
    alt: "UNIT 01 gallery image 06",
    width: 1800,
    height: 1200
  },
  {
    src: "/assets/Unit0107.png",
    alt: "UNIT 01 gallery image 07",
    width: 1800,
    height: 1200
  },
  {
    src: "/assets/Unit0108.png",
    alt: "UNIT 01 gallery image 08",
    width: 1800,
    height: 1200
  },
  {
    src: "/assets/Unit0109.png",
    alt: "UNIT 01 gallery image 09",
    width: 1800,
    height: 1200
  },
  {
    src: "/assets/Unit0110.png",
    alt: "UNIT 01 gallery image 10",
    width: 1800,
    height: 1200
  }
];

export default function ObjectsPage() {
  return (
    <main className="bg-paper text-ink">
      <section className="relative w-full">
        <Image
          src="/assets/Unit0100.png"
          alt="UNIT 01 hero image"
          width={2400}
          height={1500}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div className="pointer-events-auto flex max-w-[420px] flex-col items-center gap-4 text-center text-paper/90">
            <p className="font-mono text-xs uppercase tracking-[0.2em]">UNIT 01</p>
            <p className="text-2xl leading-tight md:text-3xl">第一件来自 Cadence 的设计作品</p>
            <Link
              href="/objects/unit01/preorder"
              className="inline-flex border border-paper/90 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-paper/90 transition-colors duration-200 hover:border-[#E2C44E] hover:text-[#E2C44E]"
            >
              立即预售
            </Link>
          </div>
        </div>
        <PhotoCredit />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Cadence</p>
        <h1 className="mt-6 max-w-5xl text-6xl leading-none tracking-[-0.02em] md:mt-8 md:text-8xl">数字设计年鉴</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-graphite md:mt-8 md:text-[17px]">
          一本持续更新的数字设计年鉴，
          记录设计、研究、物件与日常实践。
        </p>
      </section>

      <RevealOnView className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <section className="mx-auto max-w-[760px]">
          <p className="max-w-[760px] text-[15px] leading-[2.05] text-ink/75 md:text-[17px] md:leading-[2.05]">
            设计对我来说，从来不是为了追求复杂的形式，而是一种重新理解空间、人与环境关系的方法。在 RMIT 的学习与实践中，我逐渐将参数化设计视为一种思维方式，而非一种风格。Cadence 以数字设计年鉴的形式，记录研究、实验与作品的持续演进。
          </p>
        </section>

        <UnitGallerySlideshow images={unit01GalleryImages} className="mt-16 md:mt-20" />
        <div className="mx-auto mt-16 max-w-7xl border-b border-ink/10 md:mt-20" />
      </RevealOnView>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <div className="border-t border-ink/10 pt-8 md:pt-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">UNIT 02</p>
            <Link href="/archive/unit-02" className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:text-warm">
              进入档案
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr] md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-graphite">宠物慢食碗</p>
              <h2 className="mt-3 text-4xl leading-none tracking-[-0.03em] md:text-6xl">Slow Feeder</h2>
              <p className="mt-4 max-w-md text-base leading-7 text-graphite md:mt-5 md:text-[17px]">
                记录外形、内曲面组织与参数化设计研究，作为 UNIT 02 的设计档案入口。
              </p>
            </div>
            <div className="relative overflow-hidden border border-ink/10 bg-bone/30">
              <Image
                src="/assets/Unit2- (2).jpg"
                alt="UNIT 02 Slow Feeder product overview"
                width={1200}
                height={900}
                sizes="(max-width: 768px) 100vw, 42vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <ArchiveListSection />
    </main>
  );
}

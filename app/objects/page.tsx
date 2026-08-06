import Image from "next/image";
import { ArchiveListSection } from "@/components/brand/archive-list-section";
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
        <p className="pointer-events-none absolute bottom-4 right-4 text-right text-[11px] font-normal text-[#9A9A9A] md:bottom-5 md:right-5 md:text-[12px]">
          由 观照工作室提供
        </p>
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

      <ArchiveListSection />
    </main>
  );
}

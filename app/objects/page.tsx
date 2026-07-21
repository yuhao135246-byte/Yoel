import Image from "next/image";
import { ArchiveListSection } from "@/components/brand/archive-list-section";
import { RevealOnView } from "@/components/brand/reveal-on-view";

export default function ObjectsPage() {
  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Cadence</p>
        <h1 className="mt-6 max-w-5xl text-6xl leading-none tracking-[-0.02em] md:mt-8 md:text-8xl">数字设计年鉴</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-graphite md:mt-8 md:text-[17px]">
          一本持续更新的数字设计年鉴，
          记录设计、研究、物件与日常实践。
        </p>
      </section>

      <RevealOnView className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <section className="mx-auto max-w-[760px]">
          <p className="max-w-[760px] text-[15px] leading-[2.05] text-ink/75 md:text-[17px] md:leading-[2.05]">
            设计对我来说，从来不是为了追求复杂的形式，而是一种重新理解空间、人与环境关系的方法。在 RMIT 的学习与实践中，我逐渐将参数化设计视为一种思维方式，而非一种风格。Cadence 以数字设计年鉴的形式，记录研究、实验与作品的持续演进。
          </p>

          <figure className="mt-12 overflow-hidden rounded-[24px] border border-ink/8 bg-bone/35 md:mt-14">
            <Image
              src="/assets/啊啊啊.jpg"
              alt="Voronoi editorial image"
              width={1600}
              height={1200}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 760px"
              className="h-[220px] w-full object-cover opacity-70 mix-blend-multiply md:h-[300px]"
            />
          </figure>
        </section>
        <div className="mx-auto mt-12 max-w-7xl border-b border-ink/10 md:mt-16" />
      </RevealOnView>

      <ArchiveListSection />
    </main>
  );
}

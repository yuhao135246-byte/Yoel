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
          <h2 className="text-5xl leading-none tracking-[-0.02em] md:text-7xl">设计理念</h2>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-graphite">Parametric Design</p>
          <div className="mt-10 grid gap-6 text-[15px] leading-[1.9] text-ink/75 md:mt-12 md:gap-8 md:text-[17px]">
            <p>设计对我来说，从来不是为了追求复杂的形式，而是一种重新理解设计的方法。</p>
            <figure className="overflow-hidden rounded-[24px] border border-ink/8 bg-bone/35">
              <Image
                src="/assets/啊啊啊.jpg"
                alt="Unit series translucent divider 1"
                width={1600}
                height={1200}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 760px"
                className="h-[220px] w-full object-cover opacity-70 mix-blend-multiply md:h-[300px]"
              />
            </figure>
            <p>
              在 RMIT 的学习与实践中，我逐渐意识到，建筑的发展始终伴随着设计思维的演进。从柯布西耶、密斯·凡·德·罗到贝聿铭，他们以现代主义建立起属于时代的空间秩序；而扎哈·哈迪德的实践，以及 Patrik
              Schumacher 在《The Autopoiesis of Architecture》中提出的理论，则让我开始思考建筑如何通过参数、关系与系统，不断回应复杂且持续变化的环境。
            </p>
            <figure className="grid gap-4 md:grid-cols-[0.92fr_1.08fr] md:gap-5">
              <div className="overflow-hidden rounded-[24px] border border-ink/8 bg-bone/35">
                <Image
                  src="/assets/uiuij.png"
                  alt="Unit series translucent divider 2"
                  width={1600}
                  height={1200}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="h-[220px] w-full object-cover opacity-65 mix-blend-multiply md:h-[280px]"
                />
              </div>
              <div className="overflow-hidden rounded-[24px] border border-ink/8 bg-bone/35">
                <Image
                  src="/assets/UUU.png"
                  alt="Unit series translucent divider 3"
                  width={1600}
                  height={1200}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="h-[220px] w-full object-cover opacity-65 mix-blend-multiply md:h-[280px]"
                />
              </div>
            </figure>
            <p>
              围绕这一思考，我完成了一系列参数化设计项目。从 Voronoi 与 Iso Surface 的几何探索，到 MAP Studio 的 MPavilion 改造项目 <strong>Kakebuton</strong>，再到受到 RMIT 教授
              Suzie Attiwill 所著《Urban Interior》启发的滑板公园设计，我始终关注的不是形式本身，而是人与空间、环境与时间之间不断变化的关系。
            </p>
            <p>
              在 MPavilion 项目中，我尝试将折纸（Origami）的构造逻辑融入可变建筑系统，使空间能够随着光线、天气与公共活动不断调整自身形态，让建筑不再是静态的对象，而成为持续回应城市生活的媒介。
            </p>
            <figure className="overflow-hidden rounded-[24px] border border-ink/8 bg-bone/35">
              <Image
                src="/assets/unit01-hero.png"
                alt="Unit series translucent divider 4"
                width={1600}
                height={1200}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 760px"
                className="h-[180px] w-full object-cover opacity-55 mix-blend-multiply md:h-[240px]"
              />
            </figure>
            <p>
              而滑板公园项目则受到《Urban Interior》的影响。我希望公共空间不仅是功能性的场地，更是一种开放的城市内部空间，让运动、交流、停留与日常生活自然交织，并通过参数化设计重新组织人与空间之间的互动关系。
            </p>
            <p>
              今天，我们正站在新的设计时代。数字技术与人工智能不断拓展设计的边界，也让设计拥有更多探索与实验的可能性。我相信，每一次技术的革新，都不仅改变工具，也在改变我们理解世界与创造空间的方式。
            </p>
            <p>
              <strong>所以，让我们匀速向前，向前。</strong>
            </p>
          </div>
        </section>
        <div className="mx-auto mt-12 max-w-7xl border-b border-ink/10 md:mt-16" />
      </RevealOnView>

      <ArchiveListSection />
    </main>
  );
}

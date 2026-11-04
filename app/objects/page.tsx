import Image from "next/image";
import Link from "next/link";
import { RevealOnView } from "@/components/brand/reveal-on-view";
import { UnitGallerySlideshow } from "@/components/brand/unit-gallery-slideshow";

const objectIndex = [
  { label: "01", href: "#unit-01" },
  { label: "02", href: "#unit-02" },
  { label: "03", href: "#unit-03" },
  { label: "04", href: "#unit-04" },
  { label: "05", href: "#unit-05" }
];

const selectedWorksGallery = [
  {
    src: "/assets/Unit0101.png",
    alt: "UNIT 01 object detail in studio",
    width: 1800,
    height: 1200,
    unit: "UNIT 01",
    caption: "Ripple / Light study"
  },
  {
    src: "/assets/Unit0106.png",
    alt: "UNIT 01 studio composition with chair and object",
    width: 1800,
    height: 1200,
    unit: "UNIT 01",
    caption: "Ripple / Spatial study"
  },
  {
    src: "/assets/Unit0108.png",
    alt: "UNIT 01 interior setting with lamp in context",
    width: 1800,
    height: 1200,
    unit: "UNIT 01",
    caption: "Ripple / Interior scene"
  },
  {
    src: "/assets/Unit0110.png",
    alt: "UNIT 01 final product render on red background",
    width: 1800,
    height: 1200,
    unit: "UNIT 01",
    caption: "Ripple / Product final"
  },
  {
    src: "/assets/Unit2-(1).png",
    alt: "UNIT 02 bowl study and geometry relation",
    width: 4032,
    height: 3024,
    unit: "UNIT 02",
    caption: "Slow Feeder / Form study"
  },
  {
    src: "/assets/Unit2- (2).jpg",
    alt: "UNIT 02 product profile photography",
    width: 4032,
    height: 3024,
    unit: "UNIT 02",
    caption: "Slow Feeder / Product profile"
  },
  {
    src: "/assets/Unit2- (3).jpg",
    alt: "UNIT 02 close-up of curved bowl geometry",
    width: 4032,
    height: 3024,
    unit: "UNIT 02",
    caption: "Slow Feeder / Surface logic"
  },
  {
    src: "/assets/Unit2- (4).jpg",
    alt: "UNIT 02 detail view showing bowl variation and material tone",
    width: 1086,
    height: 1448,
    unit: "UNIT 02",
    caption: "Slow Feeder / Detail"
  },
  {
    src: "/assets/Unit0103.png",
    alt: "UNIT 01 form study detail in a soft studio context",
    width: 1800,
    height: 1200,
    unit: "UNIT 01",
    caption: "Ripple / Drafted form"
  },
  {
    src: "/assets/Unit0105.png",
    alt: "UNIT 01 warm detail lighting object close-up",
    width: 1800,
    height: 1200,
    unit: "UNIT 01",
    caption: "Ripple / Material light"
  },
  {
    src: "/assets/Unit0107.png",
    alt: "UNIT 01 product and material variation study",
    width: 1800,
    height: 1200,
    unit: "UNIT 01",
    caption: "Ripple / Material study"
  },
  {
    src: "/assets/Unit0109.png",
    alt: "UNIT 01 final object detail with warm glow",
    width: 1800,
    height: 1200,
    unit: "UNIT 01",
    caption: "Ripple / Light texture"
  }
];

export default function ObjectsPage() {
  return (
    <main className="overflow-x-hidden bg-paper pb-[max(1rem,env(safe-area-inset-bottom))] text-ink">
      <header className="mx-auto max-w-[1200px] px-4 pb-10 pt-12 sm:px-5 md:px-8 md:pb-20 md:pt-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-warm sm:text-[11px]">
          CADENCE / OBJECT STUDIES
        </p>

        <div className="mt-7 grid gap-6 sm:mt-8 sm:gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end md:gap-14">
          <div>
            <h1 className="flex flex-col gap-1 text-[2.6rem] leading-[0.88] tracking-[-0.06em] sm:text-5xl md:flex-row md:items-end md:gap-4 md:text-7xl lg:text-[110px]">
              <span className="block">Unit</span>
              <span className="block text-[0.48em] font-normal tracking-[-0.04em] text-ink/60 md:text-[0.38em]">Objects.</span>
            </h1>
          </div>

          <div className="max-w-md">
            <p className="text-[15px] leading-7 text-graphite sm:text-base sm:leading-8 md:text-lg">
              设计、研究与日常物件。
            </p>
            <p className="mt-4 text-[14px] leading-7 text-graphite sm:mt-5 sm:text-base sm:leading-7 md:text-[17px]">
              以参数化建模、数字制造与空间经验为基础，记录日常物件在功能与形式之间的持续研究。
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink/15 pt-5 sm:gap-4">
          {objectIndex.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="inline-flex min-h-[44px] items-center justify-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink transition-colors hover:text-warm"
            >
              {entry.label}
            </Link>
          ))}
        </div>
      </header>

      <section id="unit-01" className="scroll-mt-28 mx-auto max-w-[1200px] px-4 py-6 sm:px-5 md:px-8 md:py-10">
        <div className="mb-5 flex items-center justify-between border-t border-ink/15 pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">01 / Ripple</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-graphite">UNIT 01</p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-10">
          <div className="overflow-hidden border border-ink/10 bg-bone/30">
            <Image
              src="/assets/Unit0100.png"
              alt="CADENCE UNIT 01 Ripple lighting object in a studio setting"
              width={1600}
              height={2000}
              priority
              sizes="(max-width: 768px) 100vw, 58vw"
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="flex flex-col justify-between gap-6 pt-2 sm:gap-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">Lighting Object / 参数化灯具</p>
              <div className="mt-4 flex flex-col gap-1 md:mt-5 md:gap-2">
                <h2 className="text-[2.2rem] leading-none tracking-[-0.05em] sm:text-4xl md:text-5xl lg:text-[64px]">涟漪</h2>
                <p className="text-[14px] leading-none tracking-[-0.02em] text-ink/70 sm:text-base md:text-xl">Ripple</p>
              </div>
              <p className="mt-6 max-w-md text-[14px] leading-7 text-graphite sm:mt-8 sm:text-[15px] sm:leading-8 md:text-[17px]">
                以水面被触碰后扩散的节律为灵感，建立光、材料与空间之间的缓和关系，让日常照明成为一种静态而连续的研究对象。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/objects/unit01/preorder"
                className="inline-flex min-h-[44px] items-center gap-2 border border-ink px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
              >
                Preorder<span aria-hidden="true">↗</span>
              </Link>
              <Link
                href="/archive/unit-01"
                className="inline-flex min-h-[44px] items-center gap-2 border-b border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hover:text-warm"
              >
                作品详情<span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="unit-02" className="scroll-mt-28 mx-auto max-w-[1200px] px-4 py-6 sm:px-5 md:px-8 md:py-12">
        <div className="mb-5 flex items-center justify-between gap-3 border-t border-ink/15 pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">02 / Slow Feeder</p>
          <Link href="/archive/unit-02" className="inline-flex min-h-[44px] items-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-warm">
            Archive ↗
          </Link>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.84fr_1.16fr] md:items-center md:gap-10">
          <div className="order-2 md:order-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-warm">Daily Object / 日常物件</p>
            <div className="mt-4 flex flex-col gap-1 md:mt-5 md:gap-2">
              <h2 className="text-[2.2rem] leading-none tracking-[-0.05em] sm:text-4xl md:text-5xl lg:text-[64px]">宠物慢食碗</h2>
              <p className="text-[14px] leading-none tracking-[-0.02em] text-ink/70 sm:text-base md:text-xl">Slow Feeder</p>
            </div>
            <p className="mt-6 max-w-md text-[14px] leading-7 text-graphite sm:mt-8 sm:text-[15px] sm:leading-8 md:text-[17px]">
              从日常使用需求出发，研究曲面组织、边界节奏与内腔结构之间的关系，让喂食行为更稳定、更自然、更有节奏。
            </p>
            <Link href="/archive/unit-02" className="mt-6 inline-flex min-h-[44px] items-center gap-2 border-b border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hover:text-warm sm:mt-8">
              作品详情<span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="order-1 overflow-hidden border border-ink/10 bg-bone/30 md:order-2">
            <Image
              src="/assets/Unit2- (2).jpg"
              alt="CADENCE UNIT 02 Slow Feeder product photograph"
              width={1200}
              height={900}
              sizes="(max-width: 768px) 100vw, 55vw"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="unit-03" className="scroll-mt-28 mx-auto max-w-[1200px] px-4 py-10 sm:px-5 md:px-8 md:py-20">
        <div className="border-t border-ink/15 pt-6">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.6fr_1.4fr] md:gap-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">03 / Interactive Object</p>
            </div>
            <div>
              <div className="flex flex-col gap-1 md:gap-2">
                <h2 className="text-[2.1rem] leading-none tracking-[-0.05em] sm:text-4xl md:text-5xl lg:text-[64px]">交互式物件</h2>
                <p className="text-[14px] leading-none tracking-[-0.02em] text-ink/70 sm:text-base md:text-xl">Interactive Object</p>
              </div>
              <p className="mt-6 max-w-[700px] text-[14px] leading-7 text-graphite sm:mt-8 sm:text-[15px] sm:leading-8 md:text-[17px]">
                这是一个以人和物之间反馈机制为核心的研究方向：通过动作、速度、触感与视觉回路，探索日常器物如何从静态对象转向更具参与性和理解性的交互界面。现阶段的素材仍在持续补充中，研究重点保持在交互式物件的概念与场景性上，而非扩展成商业化产品说明。
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite sm:mt-6">Classification / Interactive Design / 交互设计研究</p>
              <Link href="/archive/unit-03" className="mt-6 inline-flex min-h-[44px] items-center gap-2 border-b border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hover:text-warm sm:mt-8">
                作品详情<span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="unit-04" className="scroll-mt-28 mx-auto max-w-[1200px] px-4 py-6 sm:px-5 md:px-8 md:py-14">
        <div className="mb-5 flex items-center justify-between gap-3 border-t border-ink/15 pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">04 / Cheese Terrain</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-graphite">UNIT 04</p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-6">
          <div className="pt-2">
            <div className="flex flex-col gap-1 md:gap-2">
              <h2 className="text-[2.1rem] leading-none tracking-[-0.05em] sm:text-4xl md:text-5xl lg:text-[64px]">奶酪地形</h2>
              <p className="text-[14px] leading-none tracking-[-0.02em] text-ink/70 sm:text-base md:text-xl">Cheese Terrain</p>
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-warm sm:mt-6">Parametric Serving Tray / 参数化奶酪餐盘</p>
          </div>

          <div className="rounded-none border border-ink/10 bg-bone/20 p-5 sm:p-6 md:p-8">
            <p className="text-[14px] leading-7 text-graphite sm:text-[15px] sm:leading-8 md:text-[17px]">
              以奶酪自然形成的孔洞与有机轮廓为灵感，将参数化建模转化为日常使用的餐盘。通过曲面、开孔与承托区域的组织，探索雕塑形态与实际功能之间的关系。
            </p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite sm:mt-6">
              Material archive pending / 当前项目素材待确认
            </p>
          </div>
        </div>
      </section>

      <section id="unit-05" className="scroll-mt-28 mx-auto max-w-[1200px] px-4 py-8 sm:px-5 md:px-8 md:py-18">
        <div className="mb-5 border-t border-ink/15 pt-5 sm:mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">05 / Light & Shadow</p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-10">
          <div>
            <div className="flex flex-col gap-1 md:gap-2">
              <h2 className="text-[2.1rem] leading-none tracking-[-0.05em] sm:text-4xl md:text-5xl lg:text-[64px]">光与影</h2>
              <p className="text-[14px] leading-none tracking-[-0.02em] text-ink/70 sm:text-base md:text-xl">Light &amp; Shadow</p>
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-warm sm:mt-6">Fluid Dynamics Latte Art Cup / 流体分析拿铁杯</p>
            <p className="mt-6 text-[14px] leading-7 text-graphite sm:text-[15px] sm:leading-8 md:text-[17px]">
              以专业咖啡拉花的使用需求为出发点，通过流体分析研究杯体内壁曲率、液面运动与注入过程之间的关系，将功能性研究与光影塑造融入日常咖啡器物。
            </p>
          </div>

          <div className="border border-ink/10 bg-bone/20 p-5 sm:p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-graphite">Product Positioning</p>
            <p className="mt-4 text-[1.5rem] leading-tight tracking-[-0.04em] text-ink sm:text-2xl md:text-3xl">
              专业拉花级 · 流体分析拿铁杯
            </p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-warm">
              Fluid Dynamics / Latte Art / Light &amp; Shadow / Parametric Design
            </p>
            <p className="mt-6 text-[14px] leading-7 text-graphite sm:text-[15px] sm:leading-8 md:text-[17px]">
              当前仓库中未发现已确认的 UNIT 05 真实渲染图，因此本节保持为研究式叙述，避免虚构产品图像、性能数据或实验结论。
            </p>
          </div>
        </div>
      </section>

      <RevealOnView className="mx-auto max-w-[1200px] px-4 pb-8 pt-8 sm:px-5 md:px-8 md:pb-12 md:pt-14">
        <div className="mb-5 flex items-end justify-between gap-4 border-t border-ink/15 pt-6 sm:mb-6">
          <div className="flex flex-col gap-1 md:gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">06 / Selected Works Gallery</p>
            <h2 className="text-[2rem] leading-none tracking-[-0.05em] sm:text-3xl md:text-5xl lg:text-[60px]">作品图集</h2>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-graphite">Selected Works</p>
        </div>
        <UnitGallerySlideshow images={selectedWorksGallery} className="mt-2" />
      </RevealOnView>

      <section id="design-approach" className="mx-auto max-w-[1200px] px-4 py-12 sm:px-5 md:px-8 md:py-24">
        <div className="border-t border-ink/15 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm">07 / Design Approach</p>
          <div className="mt-6 flex flex-col gap-1 md:gap-2">
            <h2 className="text-[2rem] leading-none tracking-[-0.05em] sm:text-3xl md:text-5xl lg:text-[60px]">形式源于研究，而非装饰。</h2>
            <p className="text-[14px] leading-none tracking-[-0.02em] text-ink/70 sm:text-base md:text-xl">Design Approach</p>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[760px] space-y-5 text-[14px] leading-7 text-graphite sm:mt-10 sm:space-y-6 sm:text-[15px] sm:leading-8 md:text-[17px]">
          <p>
            设计对我来说，从来不是为了追求复杂的形式，而是一种重新理解空间、人与环境关系的方法。
          </p>
          <p>
            在 RMIT 的学习与实践中，我逐渐将参数化设计视为一种思维方式，而非一种风格。
          </p>
          <p>
            CADENCE 以数字设计年鉴的形式，记录研究、实验与作品的持续演进。
          </p>
        </div>
      </section>
    </main>
  );
}

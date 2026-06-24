export default function AboutPage() {
  return (
    <main className="bg-paper px-5 py-12 text-ink md:px-8 md:py-16">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">关于</p>
        <h1 className="mt-6 max-w-5xl text-6xl leading-none md:text-8xl">
          Cadence 是一个以冷萃为核心的饮品研究项目。
        </h1>
        <p className="mt-8 max-w-2xl text-sm leading-7 text-graphite">
          我们关注产地、处理法、发酵技术与冷萃萃取之间的关系，
          <br />并持续记录不同风味在饮用体验中的表达方式。
        </p>
      </section>
    </main>
  );
}

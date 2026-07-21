import Link from "next/link";
import { archiveEntries } from "@/lib/archive";
import { RevealOnView } from "@/components/brand/reveal-on-view";

export function ArchiveListSection() {
  return (
    <RevealOnView className="mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-8 md:pb-32 md:pt-16">
      <section className="border-t border-ink/10 pt-10 md:pt-14">
        <div className="grid gap-4 md:max-w-3xl md:gap-6">
          <h2 className="text-5xl leading-none tracking-[-0.02em] md:text-7xl">设计档案</h2>
          <p className="text-base leading-8 text-graphite md:text-[17px]">
            一本持续记录设计研究、
            创作过程与最终作品。
          </p>
        </div>

        <div className="mt-16 border-b border-ink/10 md:mt-20">
          {archiveEntries.map((entry) => {
            const isAvailable = entry.status === "AVAILABLE";

            return (
              <article
                key={entry.slug}
                className="grid gap-5 border-t border-ink/10 py-7 md:grid-cols-[72px_1fr_auto] md:items-end md:gap-8 md:py-9"
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-graphite">{entry.issueNumber}</p>

                <div className="grid gap-2">
                  <h3 className="text-3xl leading-none md:text-4xl">{entry.unitLabel}</h3>
                  <p className="text-xl leading-none text-ink/90 md:text-2xl">{entry.workTitle}</p>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-graphite">{entry.phaseLabel}</p>
                </div>

                {isAvailable ? (
                  <Link
                    href={`/archive/${entry.slug}`}
                    className="inline-flex h-11 items-center text-sm uppercase tracking-[0.18em] text-ink"
                  >
                    {entry.ctaLabel ?? "进入 ->"}
                  </Link>
                ) : (
                  <span aria-hidden="true" className="inline-flex h-11" />
                )}
              </article>
            );
          })}
        </div>
      </section>
    </RevealOnView>
  );
}

import { notFound } from "next/navigation";
import { RevealOnView } from "@/components/brand/reveal-on-view";
import { archiveBySlug, archiveEntries } from "@/lib/archive";

type ArchivePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return archiveEntries.map((entry) => ({ slug: entry.slug }));
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { slug } = await params;
  const entry = archiveBySlug.get(slug);

  if (!entry) {
    notFound();
  }

  const pageClassName = "mx-auto flex min-h-[96svh] w-full max-w-5xl flex-col justify-between px-5 py-10 md:min-h-[820px] md:px-8 md:py-14";
  const contentClassName = "mx-auto w-full max-w-[430px] md:max-w-[560px]";
  const projectInfoRows = entry.objectInfoRows.slice(0, 6);

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
          <div className="grid gap-6 md:gap-7">
            {projectInfoRows.map((row) => (
              <div key={`${entry.slug}-${row.label}`} className="grid gap-1.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite/65">{row.label}</p>
                <p className="text-xl leading-[1.5] tracking-[-0.01em] text-ink/90 md:text-2xl">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="h-[26svh] min-h-[130px] md:h-[210px]" />
        </section>
        <p className="mx-auto w-full max-w-[430px] font-mono text-[11px] uppercase tracking-[0.16em] text-graphite md:max-w-[560px]">02</p>
      </RevealOnView>

      <RevealOnView className="mx-auto flex min-h-[96svh] w-full max-w-5xl flex-col justify-between px-5 pb-16 pt-10 md:min-h-[820px] md:px-8 md:pb-24 md:pt-14">
        <section className={contentClassName}>
          <blockquote className="text-2xl leading-[1.55] tracking-[-0.01em] text-ink/95 md:text-3xl">
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
    </main>
  );
}

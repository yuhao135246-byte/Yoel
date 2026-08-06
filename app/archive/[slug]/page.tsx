import { notFound } from "next/navigation";
import Image from "next/image";
import { PhotoCredit } from "@/components/brand/photo-credit";
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
  const isUnit01 = entry.slug === "unit-01";

  const renderEditorialImage = (
    image: NonNullable<typeof entry.editorialSections>[number]["images"][number],
    imageIndex: number
  ) => {
    if (image.layout === "detail") {
      return (
        <figure key={`${entry.slug}-${image.src}-${imageIndex}`} className="mx-auto w-full max-w-3xl">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 720px"
            className="h-auto w-full"
          />
        </figure>
      );
    }

    return (
      <figure key={`${entry.slug}-${image.src}-${imageIndex}`} className="w-full">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          sizes="100vw"
          className="h-auto w-full"
        />
      </figure>
    );
  };

  return (
    <main className="bg-paper text-ink">
      <RevealOnView className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <section className={contentClassName}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">{entry.unitLabel}</p>
          <h1 className="mt-4 text-[42px] leading-none tracking-[-0.03em] md:mt-5 md:text-7xl">{entry.englishTitle}</h1>
          <p className="mt-2 text-3xl leading-none tracking-[-0.02em] md:text-5xl">{entry.workTitle}</p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-graphite">{entry.objectType}</p>

          <blockquote className="mt-12 text-2xl leading-[1.55] tracking-[-0.01em] text-ink/95 md:mt-14 md:text-3xl">
            <p>“{entry.openingQuote[0]}</p>
            <p>{entry.openingQuote[1]}”</p>
          </blockquote>

          <div className="mt-10 grid gap-1 text-sm text-graphite md:mt-12 md:text-base">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{entry.editionLabel}</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{entry.publicationYear}</p>
          </div>
        </section>

        {entry.coverImage ? (
          <figure className="relative mt-12 w-full md:mt-16">
            <Image
              src={entry.coverImage.src}
              alt={entry.coverImage.alt}
              width={entry.coverImage.width}
              height={entry.coverImage.height}
              priority
              sizes="100vw"
              className="h-auto w-full"
            />
            {isUnit01 ? <PhotoCredit /> : null}
          </figure>
        ) : null}
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">01</p>
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

          <div className="mt-12 grid gap-4 md:mt-14 md:gap-5">
            {entry.designStatement.map((paragraph) => (
              <p key={`${entry.slug}-${paragraph}`} className="text-base leading-8 text-graphite md:text-[17px]">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="h-[18svh] min-h-[90px] md:h-[140px]" />
        </section>
        <p className="mx-auto w-full max-w-[430px] font-mono text-[11px] uppercase tracking-[0.16em] text-graphite md:max-w-[560px]">02</p>
      </RevealOnView>

      {entry.editorialSections?.map((section, sectionIndex) => {
        const sectionNumber = String(sectionIndex + 3).padStart(2, "0");
        const isTextRight = sectionIndex % 2 === 1;
        const pairImages = section.images.filter((image) => image.layout === "pair");
        const nonPairImages = section.images.filter((image) => image.layout !== "pair");

        return (
          <RevealOnView
            key={`${entry.slug}-${section.id}`}
            className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:py-24"
          >
            <section className="grid gap-14 md:gap-20">
              <div className="grid gap-8 md:grid-cols-12 md:gap-10">
                <div className={`grid gap-5 md:col-span-5 ${isTextRight ? "md:col-start-8" : "md:col-start-1"}`}>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm/85">{section.sectionLabel}</p>
                  <h2 className="text-4xl leading-none tracking-[-0.02em] md:text-6xl">{section.heading}</h2>
                  <div className="grid gap-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={`${entry.slug}-${section.id}-${paragraph}`} className="text-base leading-8 text-graphite md:text-[17px]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {pairImages.length === 2 ? (
                <div className="grid gap-6 md:grid-cols-2 md:gap-10">
                  {pairImages.map((image, imageIndex) => (
                    <figure key={`${entry.slug}-${section.id}-${image.src}-${imageIndex}`} className="w-full">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="h-auto w-full"
                      />
                    </figure>
                  ))}
                </div>
              ) : null}

              {nonPairImages.length ? (
                <div className="grid gap-8 md:gap-12">
                  {nonPairImages.map((image, imageIndex) => renderEditorialImage(image, imageIndex))}
                </div>
              ) : null}
            </section>
            <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">{sectionNumber}</p>
          </RevealOnView>
        );
      })}
    </main>
  );
}

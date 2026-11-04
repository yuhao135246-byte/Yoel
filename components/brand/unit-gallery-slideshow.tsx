"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type UnitGallerySlideshowProps = {
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
    unit?: string;
    caption?: string;
  }[];
  className?: string;
};

export function UnitGallerySlideshow({
  images,
  className = ""
}: UnitGallerySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!images.length) {
    return null;
  }

  const showPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const showNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        showNext();
      } else {
        showPrevious();
      }
    }

    touchStartX.current = null;
  };

  const activeImage = images[currentIndex];

  return (
    <section className={`w-full ${className}`} aria-label="Selected works gallery">
      <div
        className="relative overflow-hidden border border-ink/10 bg-bone/30"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-[44svh] min-h-[300px] w-full sm:h-[48svh] sm:min-h-[340px] md:h-[62vh] md:min-h-[500px]">
          {images.map((image, index) => {
            const isActive = index === currentIndex;

            return (
              <figure
                key={`${image.src}-${index}`}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  isActive ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-hidden={!isActive}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="h-full w-full object-contain"
                />
              </figure>
            );
          })}
        </div>

        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-paper/50 bg-ink/45 text-paper backdrop-blur-sm transition-all hover:bg-ink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper sm:left-4 md:left-6 md:h-11 md:w-11"
        >
          <span aria-hidden="true" className="text-base leading-none">&#8592;</span>
        </button>

        <button
          type="button"
          onClick={showNext}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-paper/50 bg-ink/45 text-paper backdrop-blur-sm transition-all hover:bg-ink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper sm:right-4 md:right-6 md:h-11 md:w-11"
        >
          <span aria-hidden="true" className="text-base leading-none">&#8594;</span>
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-graphite md:text-[11px]">
        <span className="font-mono text-ink">{String(currentIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
        <span className="h-px flex-1 bg-ink/15" aria-hidden="true" />
        <span className="font-mono text-warm">{activeImage.unit ?? "UNIT"}</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-graphite md:text-base">{activeImage.caption ?? "Selected archive image"}</p>
    </section>
  );
}

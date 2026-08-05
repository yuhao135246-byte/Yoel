"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type UnitGallerySlideshowProps = {
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
  className?: string;
  intervalMs?: number;
};

export function UnitGallerySlideshow({
  images,
  className = "",
  intervalMs = 3000
}: UnitGallerySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = useMemo(() => images, [images]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [slides, intervalMs]);

  if (!slides.length) {
    return null;
  }

  function showPrevious() {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }

  return (
    <section className={`w-full ${className}`} aria-label="UNIT 01 gallery slideshow">
      <div className="relative overflow-hidden border border-ink/10 bg-bone/30">
        <div className="relative h-[62svh] min-h-[460px] w-full md:h-[70vh] md:min-h-[620px] md:max-h-[980px]">
          {slides.map((image, index) => {
            const isActive = index === currentIndex;

            return (
              <figure
                key={`${image.src}-${index}`}
                className={`absolute inset-0 transition-opacity duration-900 ease-in-out ${
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
                  sizes="100vw"
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
          className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border border-paper/70 bg-ink/40 text-paper backdrop-blur-sm transition-all hover:bg-ink/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper md:left-6 md:h-11 md:w-11"
        >
          <span aria-hidden="true" className="text-base leading-none">&#8592;</span>
        </button>

        <button
          type="button"
          onClick={showNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border border-paper/70 bg-ink/40 text-paper backdrop-blur-sm transition-all hover:bg-ink/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper md:right-6 md:h-11 md:w-11"
        >
          <span aria-hidden="true" className="text-base leading-none">&#8594;</span>
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
        {slides.map((image, index) => (
          <span
            key={`${image.src}-dot-${index}`}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentIndex ? "bg-ink/75" : "bg-ink/25"}`}
          />
        ))}
      </div>
    </section>
  );
}

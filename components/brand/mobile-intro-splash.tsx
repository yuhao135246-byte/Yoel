"use client";

import { useEffect, useRef, useState } from "react";

const INTRO_SESSION_KEY = "cadence-mobile-intro-played";

type SplashPhase = "hidden" | "visible" | "fading";

export function MobileIntroSplash() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const previousOverflowRef = useRef("");
  const [phase, setPhase] = useState<SplashPhase>("hidden");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasPlayed = window.sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (hasPlayed || !isMobile) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    previousOverflowRef.current = previousOverflow;
    setPhase("visible");
    document.body.style.overflow = "hidden";

    fallbackTimeoutRef.current = window.setTimeout(() => {
      finishIntro();
    }, 7000);

    // iOS Safari is stricter about autoplay; retrying play() on mount improves reliability.
    window.setTimeout(() => {
      void videoRef.current?.play().catch(() => {
        finishIntro();
      });
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, []);

  function finishIntro() {
    if (typeof window === "undefined") {
      return;
    }

    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;

    window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    setPhase("fading");

    fadeTimeoutRef.current = window.setTimeout(() => {
      setPhase("hidden");
      document.body.style.overflow = previousOverflowRef.current;
    }, 500);
  }

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[120] bg-black transition-opacity duration-500 ease-out md:hidden ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        onEnded={() => finishIntro()}
        onError={() => finishIntro()}
      >
        <source src="/Intro.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

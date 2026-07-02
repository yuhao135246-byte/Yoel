"use client";

import { useEffect, useRef, useState } from "react";

type SplashPhase = "hidden" | "visible" | "fading";

export function MobileIntroSplash() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const previousOverflowRef = useRef("");
  const [phase, setPhase] = useState<SplashPhase>("visible");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    console.log("Splash mounted");
    console.log("Video element created");

    const previousOverflow = document.body.style.overflow;
    previousOverflowRef.current = previousOverflow;
    document.body.style.overflow = "hidden";

    fallbackTimeoutRef.current = window.setTimeout(() => {
      finishIntro();
    }, 7000);

    videoRef.current?.play().catch(console.error);

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
      className={`fixed inset-0 z-[999999] flex items-center justify-center bg-black transition-opacity duration-500 ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src="/Intro.mp4"
        className="bg-black"
        style={{ width: "100vw", height: "auto", maxHeight: "100vh", objectFit: "contain" }}
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        onLoadedData={() => console.log("Video loaded")}
        onCanPlay={() => console.log("Video can play")}
        onPlay={() => console.log("Video started")}
        onPlaying={() => console.log("Video started")}
        onError={(event) => console.error("Video error", event)}
        onEnded={() => {
          console.log("Video ended");
          finishIntro();
        }}
      />
    </div>
  );
}

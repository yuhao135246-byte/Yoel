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
  const [showTapToStart, setShowTapToStart] = useState(false);

  function attemptPlay() {
    const playPromise = videoRef.current?.play();
    if (playPromise) {
      playPromise.catch((error) => {
        console.error("video.play() error", error);
        setShowTapToStart(true);
      });
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    console.log("Splash mounted");
    console.log("Video element created", videoRef.current);
    console.log("Video element created");

    const previousOverflow = document.body.style.overflow;
    previousOverflowRef.current = previousOverflow;
    document.body.style.overflow = "hidden";

    const handleWeixinBridgeReady = () => {
      console.log("WeixinJSBridgeReady");
      attemptPlay();
    };

    document.addEventListener("WeixinJSBridgeReady", handleWeixinBridgeReady, false);

    fallbackTimeoutRef.current = window.setTimeout(() => {
      finishIntro();
    }, 7000);

    attemptPlay();

    return () => {
      document.removeEventListener("WeixinJSBridgeReady", handleWeixinBridgeReady, false);
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

  const videoAttributes = {
    "webkit-playsinline": "true",
    "x5-playsinline": "true",
    "x5-video-player-type": "h5",
    "x5-video-player-fullscreen": "false",
    "x5-video-orientation": "portrait"
  } as const;

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
        {...videoAttributes}
        onLoadedData={() => console.log("Video loaded")}
        onCanPlay={() => console.log("Video can play")}
        onPlay={() => {
          console.log("Video started");
          setShowTapToStart(false);
        }}
        onPlaying={() => {
          console.log("Video playing");
          setShowTapToStart(false);
        }}
        onError={(event) => console.error("Video error", event)}
        onEnded={() => {
          console.log("Video ended");
          finishIntro();
        }}
      />
      {showTapToStart ? (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-black/85 text-paper"
          onClick={() => {
            attemptPlay();
          }}
        >
          <span className="border border-paper px-5 py-3 text-sm uppercase tracking-[0.18em]">
            Tap to Start
          </span>
        </button>
      ) : null}
    </div>
  );
}

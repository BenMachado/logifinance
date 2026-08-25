"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

interface HeroProps {
  videoSrc: string;
  posterSrc?: string;
  headlineTop?: string;
  headlineMasked?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaTo?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTo?: string;
}

const PARALLAX_DISTANCES = { small: 100, medium: 200, large: 300, xlarge: 300 };

function getBreakpoint(width: number) {
  if (width < 640) return "small";
  if (width < 1024) return "medium";
  if (width < 1440) return "large";
  return "xlarge";
}

export function Hero({
  videoSrc,
  posterSrc,
  headlineTop = "Architecture",
  headlineMasked = "& Interiors.",
  subheadline,
  ctaLabel,
  ctaTo,
  secondaryCtaLabel,
  secondaryCtaTo,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollY } = useScroll();
  const [sectionHeight, setSectionHeight] = useState(1);
  const [parallaxDistance, setParallaxDistance] = useState(
    PARALLAX_DISTANCES[getBreakpoint(typeof window !== "undefined" ? window.innerWidth : 1024)],
  );

  useEffect(() => {
    function measure() {
      if (sectionRef.current) {
        setSectionHeight(sectionRef.current.clientHeight);
      }
      setParallaxDistance(PARALLAX_DISTANCES[getBreakpoint(window.innerWidth)]);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const opacity = useTransform(scrollY, [0, sectionHeight], [1, 0]);
  const y = useTransform(scrollY, [0, sectionHeight], [0, parallaxDistance]);

  const handleVisibility = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const video = videoRef.current;
      if (!video) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    [],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(handleVisibility, { threshold: 0 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [handleVisibility]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      ref={sectionRef}
      className="relative z-[1] h-[90vh] min-h-[620px] max-h-[980px] w-full overflow-hidden bg-black max-lg:min-h-[400px] max-lg:max-h-[720px] max-sm:min-h-0 max-sm:max-h-[420px] max-sm:h-auto"
    >
      <div className="hidden max-sm:block w-full pt-[100%]" />

      <motion.div
        className="relative z-[1] h-full max-sm:absolute max-sm:inset-0"
        style={prefersReducedMotion ? undefined : { opacity, y }}
      >
        {/* Video background */}
        <div className="absolute inset-0 z-[1] bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={prefersReducedMotion ? undefined : videoSrc}
            poster={posterSrc}
            crossOrigin="anonymous"
            loop
            muted
            autoPlay
            playsInline
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 z-[2] bg-black/30" />
        </div>

        {/* Headline */}
        <div className="absolute z-[4] w-full top-1/2 -translate-y-1/2 text-center px-4">
          <h1 className="mx-auto">
            <span className="sr-only">
              {headlineTop} {headlineMasked}
            </span>

            <div role="presentation" aria-hidden="true">
              <div className="max-w-[600px] mx-auto">
                <span
                  className="block font-heading font-bold tracking-tight text-white whitespace-nowrap"
                  style={{ fontSize: "clamp(40px, 7vw, 80px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
                >
                  {headlineTop}
                </span>
              </div>
              <div className="relative z-[1] overflow-hidden min-h-[120px] max-lg:min-h-[100px]">
                <span
                  className="block font-heading font-bold text-white"
                  style={{
                    fontSize: "clamp(60px, 10vw, 120px)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    textShadow: "0 0 60px hsla(217, 91%, 60%, 0.35), 0 0 120px hsla(226, 71%, 40%, 0.2)",
                  }}
                >
                  {headlineMasked}
                </span>
              </div>
            </div>
          </h1>

          {(ctaLabel || secondaryCtaLabel) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {ctaLabel && (
                <Link
                  href={ctaTo ?? "/contato"}
                  className="inline-flex h-12 items-center justify-center bg-[hsl(226,71%,40%)] px-8 text-sm font-medium uppercase tracking-widest text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[hsl(217,91%,60%)]"
                >
                  {ctaLabel}
                </Link>
              )}
              {secondaryCtaLabel && (
                <Link
                  href={secondaryCtaTo ?? "/login"}
                  className="inline-flex h-12 items-center justify-center border border-white/40 px-8 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-white/10"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {subheadline && (
        <p className="absolute z-[5] bottom-[10%] w-full text-center text-lg text-white/80 sm:text-xl lg:text-2xl">
          {subheadline}
        </p>
      )}
    </section>
  );
}

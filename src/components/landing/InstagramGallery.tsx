"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  parseInstagramUrl,
  uniqueInstagramMedia,
  type InstagramMedia,
} from "@/lib/instagram";
import { VerticalVideo } from "@/components/ui/VerticalVideo";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={dir === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReelSlide({
  slide,
  mounted,
  eager,
  title,
}: {
  slide: InstagramMedia;
  mounted: boolean;
  eager?: boolean;
  title: string;
}) {
  const [ready, setReady] = useState(false);

  return (
    <figure className="ig-reel ig-gallery-slide">
      {mounted ? (
        <>
          {!ready ? (
            <div className="absolute inset-0 bg-surface" aria-hidden />
          ) : null}
          <iframe
            src={slide.embedSrc}
            title={title}
            className="ig-reel-embed"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading={eager ? "eager" : "lazy"}
            scrolling="no"
            onLoad={() => setReady(true)}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-surface" aria-hidden />
      )}
    </figure>
  );
}

export function InstagramGallery({
  urls,
  caption,
  profileUrl,
}: {
  urls: string[];
  caption?: string;
  profileUrl?: string;
}) {
  const slides = uniqueInstagramMedia(urls);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(() => new Set([0, 1]));

  const profile = profileUrl ? parseInstagramUrl(profileUrl) : null;
  const profileHref = profile?.kind === "profile" ? profile.href : null;
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    setMounted((prev) => {
      const next = new Set(prev);
      next.add(index);
      if (index > 0) next.add(index - 1);
      if (index < slides.length - 1) next.add(index + 1);
      return next;
    });
  }, [index, slides.length]);

  const goTo = useCallback(
    (nextIndex: number) => {
      const el = scrollerRef.current;
      if (!el || slides.length === 0) return;
      const clamped = Math.max(0, Math.min(slides.length - 1, nextIndex));
      el.scrollTo({
        left: clamped * el.clientWidth,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      setIndex(clamped);
    },
    [slides.length],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let pointerId: number | null = null;

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a")) return;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      dragging = false;
      pointerId = e.pointerId;
      el.setPointerCapture(e.pointerId);
    };

    const move = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) < 10) return;
      dragging = true;
      el.classList.add("is-dragging");
      el.scrollLeft = startLeft - dx;
    };

    const up = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      el.classList.remove("is-dragging");
      if (!dragging) return;
      const width = el.clientWidth;
      if (!width) return;
      goTo(Math.round(el.scrollLeft / width));
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [goTo]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || !el.clientWidth) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next >= 0 && next < slides.length) setIndex(next);
  };

  if (slides.length === 0) {
    return (
      <div>
        <div className="rounded-[28px] border border-line bg-elevated p-2">
          <VerticalVideo caption={caption || "Watch on Instagram"} />
        </div>
      </div>
    );
  }

  const many = slides.length > 1;

  return (
    <div>
      <div className="relative">
        <div className="relative rounded-[28px] border border-line bg-elevated p-2">
          <div
            ref={scrollerRef}
            className="ig-gallery rounded-[20px]"
            onScroll={onScroll}
            aria-label="Featured reels"
            role="region"
          >
            {slides.map((slide, i) => (
              <ReelSlide
                key={slide.shortcode}
                slide={slide}
                mounted={mounted.has(i)}
                eager={i === 0}
                title={caption || `Featured reel ${i + 1}`}
              />
            ))}
          </div>
          {many ? (
            <>
              <p className="sr-only" aria-live="polite">
                Reel {index + 1} of {slides.length}
              </p>
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
                <div className="flex rounded-full bg-canvas/55 px-1">
                {slides.map((slide, i) => (
                  <button
                    key={slide.shortcode}
                    type="button"
                    aria-label={`Reel ${i + 1} of ${slides.length}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => goTo(i)}
                    className="pointer-events-auto flex min-h-11 min-w-8 items-center justify-center"
                  >
                    <span
                      className={`block h-2 w-2 rounded-full bg-ink transition-opacity duration-[var(--duration-ui)] ease-[var(--ease-out)] ${
                        i === index ? "opacity-100" : "opacity-40"
                      }`}
                    />
                  </button>
                ))}
                </div>
              </div>
              <button
                type="button"
                aria-label="Previous reel"
                disabled={index === 0}
                onClick={() => goTo(index - 1)}
                className="absolute top-1/2 left-2 z-10 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/70 text-ink transition-[color,transform,opacity] duration-[var(--duration-press)] ease-[var(--ease-out)] hover:text-ink disabled:opacity-30 lg:inline-flex"
              >
                <Chevron dir="prev" />
              </button>
              <button
                type="button"
                aria-label="Next reel"
                disabled={index === slides.length - 1}
                onClick={() => goTo(index + 1)}
                className="absolute top-1/2 right-2 z-10 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/70 text-ink transition-[color,transform,opacity] duration-[var(--duration-press)] ease-[var(--ease-out)] hover:text-ink disabled:opacity-30 lg:inline-flex"
              >
                <Chevron dir="next" />
              </button>
            </>
          ) : null}
        </div>
      </div>
      {caption ? <p className="mt-3 text-sm text-muted">{caption}</p> : null}
      {current ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 text-sm">
          <a
            href={current.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-muted hover:text-ink"
          >
            Watch on Instagram
          </a>
          {profileHref ? (
            <a
              href={profileHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center text-muted hover:text-ink"
            >
              Profile
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

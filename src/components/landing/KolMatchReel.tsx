"use client";

import { useState } from "react";
import { landingInstagramMedia } from "@/lib/instagram";

export function KolMatchReel() {
  const slide = landingInstagramMedia()[0];
  const [ready, setReady] = useState(false);

  if (!slide) {
    return (
      <figure className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-[20px] border border-line bg-canvas">
        <div className="relative" style={{ aspectRatio: "9 / 16" }}>
          <p className="absolute inset-x-4 top-[34%] text-center text-[40px] font-semibold tracking-[-0.05em] text-ink">
            ML
          </p>
          <p className="absolute inset-x-4 bottom-5 text-center text-[15px] text-ink">
            Mei Lin
          </p>
        </div>
      </figure>
    );
  }

  return (
    <figure className="ig-reel mx-auto w-full max-w-[240px] overflow-hidden rounded-[20px] border border-line bg-canvas">
      {!ready ? <div className="absolute inset-0 bg-canvas" aria-hidden /> : null}
      <iframe
        src={slide.embedSrc}
        title="Mei Lin"
        className="ig-reel-embed"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        loading="eager"
        referrerPolicy="origin-when-cross-origin"
        scrolling="no"
        onLoad={() => setReady(true)}
      />
    </figure>
  );
}

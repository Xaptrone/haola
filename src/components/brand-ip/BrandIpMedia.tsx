"use client";

import { useState } from "react";
import { parseInstagramUrl } from "@/lib/instagram";
import { VerticalVideo } from "@/components/ui/VerticalVideo";
import type { BrandIpMedia } from "@/lib/types";

function InstagramTile({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const parsed = parseInstagramUrl(src);
  const [ready, setReady] = useState(false);
  if (parsed.kind !== "media") return null;
  return (
    <figure className="ig-reel bg-canvas">
      {!ready ? <div className="absolute inset-0 bg-surface" aria-hidden /> : null}
      <iframe
        src={parsed.embedSrc}
        title={title}
        className="ig-reel-embed"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="origin-when-cross-origin"
        scrolling="no"
        onLoad={() => setReady(true)}
      />
    </figure>
  );
}

export function BrandIpMediaTile({
  item,
  size = "reel",
}: {
  item: BrandIpMedia;
  size?: "reel" | "still";
}) {
  const frame =
    size === "reel"
      ? "relative overflow-hidden rounded-[20px] border border-line bg-elevated"
      : "relative overflow-hidden rounded-[14px] border border-line bg-elevated";
  const ig = parseInstagramUrl(item.src);

  if (item.kind === "image") {
    return (
      <figure className={frame} style={{ aspectRatio: "9 / 16" }}>
        {item.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded stills
          <img
            src={item.src}
            alt={item.caption || "Brand IP still"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-end p-4">
            <p className="text-sm text-ink">{item.caption || "Still"}</p>
          </div>
        )}
        {item.caption ? (
          <figcaption className="absolute inset-x-0 bottom-0 bg-canvas/70 px-3 py-2 text-[12px] text-ink">
            {item.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (item.kind === "video") {
    if (ig?.kind === "media") {
      return (
        <div className={frame}>
          <InstagramTile src={item.src} title={item.caption || "Sample reel"} />
          {item.caption ? (
            <p className="border-t border-line px-3 py-2 text-[12px] text-muted">
              {item.caption}
            </p>
          ) : null}
        </div>
      );
    }
    if (item.src) {
      return (
        <figure className={frame} style={{ aspectRatio: "9 / 16" }}>
          <video
            src={item.src}
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
          />
          {item.caption ? (
            <figcaption className="absolute inset-x-0 bottom-0 bg-canvas/70 px-3 py-2 text-[12px] text-ink">
              {item.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    return (
      <div className={frame}>
        <VerticalVideo caption={item.caption || "Sample reel"} />
      </div>
    );
  }

  const _exhaustive: never = item.kind;
  return _exhaustive;
}

export function BrandIpMediaStage({ media }: { media: BrandIpMedia[] }) {
  const usable = media.filter((item) => item.src || item.caption);
  const videos = usable.filter((item) => item.kind === "video");
  const stills = usable.filter((item) => item.kind === "image");
  const hero = videos[0] ?? stills[0];
  const restStills = hero?.kind === "image" ? stills.slice(1) : stills;
  const extraVideos = videos.slice(hero?.kind === "video" ? 1 : 0);

  if (!hero) {
    return (
      <div className="mx-auto w-full max-w-[220px]">
        <VerticalVideo caption="Sample reel lands here" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="mx-auto w-full max-w-[240px]">
        <BrandIpMediaTile item={hero} />
      </div>
      {restStills.length || extraVideos.length ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {extraVideos.map((item) => (
            <div key={item.id} className="w-[92px] shrink-0">
              <BrandIpMediaTile item={item} size="still" />
            </div>
          ))}
          {restStills.map((item) => (
            <div key={item.id} className="w-[92px] shrink-0">
              <BrandIpMediaTile item={item} size="still" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

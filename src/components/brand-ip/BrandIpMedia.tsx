"use client";

import { useState } from "react";
import { parseInstagramUrl } from "@/lib/instagram";
import { VerticalVideo } from "@/components/ui/VerticalVideo";
import type { BrandIpMedia } from "@/lib/types";

function splitStillCaption(caption: string): [string, string] {
  const parts = caption.split("·").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return [parts[0] ?? "Still", parts.slice(1).join(" · ")];
  }
  return ["Still", caption || "Still pack"];
}

function PlayMark() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-canvas text-ink">
      <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden>
        <path d="M13.5 8L0.75 15.7942V0.205771L13.5 8Z" />
      </svg>
    </span>
  );
}

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
      <div className="absolute inset-0 flex flex-col items-center justify-end bg-surface p-4">
        <PlayMark />
        <p className="mt-6 text-center text-sm text-ink">{title}</p>
      </div>
      <iframe
        src={parsed.embedSrc}
        title={title}
        className={`ig-reel-embed transition-opacity duration-[var(--duration-ui)] ease-[var(--ease-out)] ${ready ? "opacity-100" : "opacity-0"}`}
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
    if (!item.src || item.src.startsWith("fxgen:still")) {
      const [kicker, line] = splitStillCaption(item.caption);
      return (
        <figure className={frame} style={{ aspectRatio: "9 / 16" }}>
          <div className="absolute inset-y-4 left-0 w-1 rounded-full bg-accent" />
          <p className="absolute left-5 top-6 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {kicker}
          </p>
          <p className="absolute inset-x-5 top-[42%] text-[17px] font-medium leading-6 tracking-tight text-ink">
            {line}
          </p>
        </figure>
      );
    }
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
    if (ig.kind === "media") {
      return (
        <div className={frame}>
          <InstagramTile src={item.src} title={item.caption || "Sample reel"} />
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
  const igHero = hero ? parseInstagramUrl(hero.src) : null;

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
      {igHero?.kind === "media" ? (
        <p className="text-center text-sm">
          <a
            href={igHero.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-muted hover:text-ink"
          >
            Watch sample reel
          </a>
        </p>
      ) : null}
      {restStills.length ? (
        <div className="mx-auto flex w-full max-w-[360px] gap-2">
          {restStills.map((item) => (
            <div key={item.id} className="min-w-0 flex-1">
              <BrandIpMediaTile item={item} size="still" />
            </div>
          ))}
        </div>
      ) : null}
      {extraVideos.length ? (
        <ul className="space-y-1">
          {extraVideos.map((item) => {
            const ig = parseInstagramUrl(item.src);
            return (
              <li key={item.id} className="text-sm">
                {ig.kind === "media" ? (
                  <a
                    href={ig.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center text-muted hover:text-ink"
                  >
                    {item.caption || "More sample reels"}
                  </a>
                ) : (
                  <span className="text-muted">{item.caption || "Sample reel"}</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

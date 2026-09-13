"use client";

import { useState } from "react";
import {
  parseInstagramUrl,
  type ParsedInstagram,
} from "@/lib/instagram";
import { VerticalVideo } from "@/components/ui/VerticalVideo";

function profileHref(
  parsed: ParsedInstagram,
  profileUrl?: string,
): string | null {
  if (parsed.kind === "profile") return parsed.href;
  if (!profileUrl) return null;
  const extra = parseInstagramUrl(profileUrl);
  return extra.kind === "profile" ? extra.href : null;
}

export function InstagramFrame({
  url,
  caption,
  profileUrl,
}: {
  url: string;
  caption?: string;
  profileUrl?: string;
}) {
  const parsed = parseInstagramUrl(url);
  const follow = profileHref(parsed, profileUrl);
  const [ready, setReady] = useState(false);

  const reel =
    parsed.kind === "media" ? (
      <figure className="ig-reel relative overflow-hidden rounded-[20px] border border-line bg-surface">
        {!ready ? (
          <div className="absolute inset-0 bg-surface" aria-hidden />
        ) : null}
        <iframe
          src={parsed.embedSrc}
          title={caption || "Instagram reel"}
          className="ig-reel-embed"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          loading="eager"
          scrolling="no"
          onLoad={() => setReady(true)}
        />
      </figure>
    ) : (
      <VerticalVideo caption={caption || "Watch on Instagram"} />
    );

  const watchHref = parsed.kind === "media" ? parsed.href : follow;

  return (
    <div>
      <div className="rounded-[28px] border border-line bg-elevated p-2">
        {reel}
      </div>
      {caption ? <p className="mt-3 text-sm text-muted">{caption}</p> : null}
      {watchHref ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 text-sm">
          <a
            href={parsed.kind === "media" ? parsed.href : watchHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-muted hover:text-ink"
          >
            {parsed.kind === "media" ? "Watch on Instagram" : "Open Instagram"}
          </a>
          {parsed.kind === "media" && follow ? (
            <a
              href={follow}
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

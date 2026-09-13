export type ParsedInstagram =
  | {
      kind: "media";
      shortcode: string;
      href: string;
      embedSrc: string;
    }
  | {
      kind: "profile";
      handle: string;
      href: string;
    }
  | { kind: "invalid" };

const MEDIA_PATH = /\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i;

const RESERVED_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "tv",
  "stories",
  "highlights",
  "accounts",
  "explore",
  "direct",
  "about",
  "legal",
  "developer",
  "directory",
  "emails",
  "web",
  "api",
  "graphql",
  "lite",
  "nametag",
  "popular",
  "privacy",
  "safety",
  "session",
  "ads",
  "share",
]);

function asUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

function isInstagramHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  return host === "instagram.com" || host === "instagr.am";
}

/** Parse a pasted Instagram post, reel, or profile URL. */
export function parseInstagramUrl(raw: string): ParsedInstagram {
  const url = asUrl(raw);
  if (!url || !isInstagramHost(url.hostname)) return { kind: "invalid" };

  const media = url.pathname.match(MEDIA_PATH);
  if (media) {
    const shortcode = media[1];
    return {
      kind: "media",
      shortcode,
      href: `https://www.instagram.com/p/${shortcode}/`,
      embedSrc: `https://www.instagram.com/p/${shortcode}/embed/`,
    };
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (
    parts.length === 1 &&
    !RESERVED_PATHS.has(parts[0].toLowerCase()) &&
    /^[A-Za-z0-9._]+$/.test(parts[0])
  ) {
    const handle = parts[0].replace(/\.+$/, "");
    if (!handle) return { kind: "invalid" };
    return {
      kind: "profile",
      handle,
      href: `https://www.instagram.com/${handle}/`,
    };
  }

  return { kind: "invalid" };
}

export type InstagramMedia = Extract<ParsedInstagram, { kind: "media" }>;

export const DEFAULT_LANDING_INSTAGRAM_URLS = [
  "https://www.instagram.com/p/DZuQ6xhz2Au/",
  "https://www.instagram.com/p/DZ6z5UXT_eA/",
  "https://www.instagram.com/p/DaBo88XTLbb/",
  "https://www.instagram.com/p/DaKjxw8TEEZ/",
  "https://www.instagram.com/p/DUu-gYPEhPD/",
  "https://www.instagram.com/p/DUPew4eEz_k/",
];

export function splitInstagramUrlList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function uniqueInstagramMedia(urls: string[]): InstagramMedia[] {
  const seen = new Set<string>();
  const media: InstagramMedia[] = [];
  for (const url of urls) {
    const parsed = parseInstagramUrl(url);
    if (parsed.kind !== "media" || seen.has(parsed.shortcode)) continue;
    seen.add(parsed.shortcode);
    media.push(parsed);
  }
  return media;
}

export function resolveLandingInstagramMedia(
  urlsEnv?: string,
  singleEnv?: string,
): InstagramMedia[] {
  const fromList = splitInstagramUrlList(urlsEnv);
  const raw = fromList.length
    ? fromList
    : singleEnv?.trim()
      ? [singleEnv.trim()]
      : DEFAULT_LANDING_INSTAGRAM_URLS;
  const media = uniqueInstagramMedia(raw);
  return media.length
    ? media
    : uniqueInstagramMedia(DEFAULT_LANDING_INSTAGRAM_URLS);
}

export function landingInstagramMedia(): InstagramMedia[] {
  return resolveLandingInstagramMedia(
    process.env.NEXT_PUBLIC_LANDING_INSTAGRAM_URLS,
    process.env.NEXT_PUBLIC_LANDING_INSTAGRAM_URL,
  );
}

export function landingInstagramUrl(): string {
  return landingInstagramMedia()[0]?.href ?? DEFAULT_LANDING_INSTAGRAM_URLS[0];
}

export function landingInstagramCaption(): string {
  return process.env.NEXT_PUBLIC_LANDING_INSTAGRAM_CAPTION?.trim() || "";
}

export function landingInstagramProfileUrl(): string {
  return process.env.NEXT_PUBLIC_LANDING_INSTAGRAM_PROFILE?.trim() || "";
}

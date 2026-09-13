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

export const DEFAULT_LANDING_INSTAGRAM_URL =
  "https://www.instagram.com/p/Dc0aQl0zT41/";

export function landingInstagramUrl(): string {
  return (
    process.env.NEXT_PUBLIC_LANDING_INSTAGRAM_URL?.trim() ||
    DEFAULT_LANDING_INSTAGRAM_URL
  );
}

export function landingInstagramCaption(): string {
  return process.env.NEXT_PUBLIC_LANDING_INSTAGRAM_CAPTION?.trim() || "";
}

export function landingInstagramProfileUrl(): string {
  return process.env.NEXT_PUBLIC_LANDING_INSTAGRAM_PROFILE?.trim() || "";
}

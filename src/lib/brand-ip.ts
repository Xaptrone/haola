import type {
  BrandIpJob,
  BrandIpLine,
  BrandIpMedia,
  BrandIpMediaKind,
  BrandIpOffer,
} from "@/lib/types";

export const DEFAULT_IP_TONE = "Warm & precise";

/** Keep in sync with PRICE.brandIp in credits.ts */
export const BRAND_IP_HOLD = 1200;

const SAMPLE_REELS = [
  "https://www.instagram.com/p/DZuQ6xhz2Au/",
  "https://www.instagram.com/p/DZ6z5UXT_eA/",
];

export function draftIpId(businessId: string): string {
  return `ip-draft:${businessId}`;
}

function stillSvg(title: string, line: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 900">
    <rect width="720" height="900" fill="#12110F"/>
    <rect x="28" y="28" width="664" height="844" rx="36" fill="#1E1C18"/>
    <rect x="28" y="28" width="8" height="844" fill="#6F43F6"/>
    <text x="80" y="120" fill="#9A948A" font-family="Sora, ui-sans-serif, sans-serif" font-size="22" letter-spacing="4">${escapeXml(title.toUpperCase())}</text>
    <text x="80" y="460" fill="#F4F0EA" font-family="Sora, ui-sans-serif, sans-serif" font-size="36">${escapeXml(line)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function ipCopy(tone: string) {
  if (tone.includes("Bold")) {
    return {
      look: "High contrast, short cuts, one colour pop",
      tone: "Bold and playful. Still never shouty.",
      dos: "Name the brand once. End on a clear next step.",
      donts: "No fake urgency. No invented reviews.",
      sampleLines: [
        "This is the room. Then the offer. Then you.",
        "Come once. You’ll know if it’s yours.",
      ],
    };
  }
  if (tone.includes("Calm")) {
    return {
      look: "Slow holds, natural light, quiet type",
      tone: "Calm expert. Trust first.",
      dos: "Show the space. One proof. One booking path.",
      donts: "No medical or legal claims. No before/after.",
      sampleLines: ["We keep it simple. You decide.", "Book when you’re ready."],
    };
  }
  return {
    look: "Warm light, precise framing, one hero object",
    tone: "Warm and precise. Never shouty.",
    dos: "Name the brand once. Paid partnership line.",
    donts: "No secret recipes. No invented prices.",
    sampleLines: [
      "Not loud. Just the thing, as it is.",
      "Come through — we’ll be here.",
    ],
  };
}

export function defaultBrandIpOffer(): BrandIpOffer {
  return {
    headline: "Brand IP pack",
    promise:
      "A locked avatar and sample reels made for this brand. Hold now. Nothing posts until you approve.",
    included: [
      "Locked look, tone, and voice bible the creator must follow",
      "3 sample 9:16 reels of this avatar in your brand",
      "Still pack (hero, space, close) for later campaigns",
      "One revision on the samples",
      "Nothing posts until you approve in Content",
    ],
    extraInfo:
      "Made for Malaysian SMEs. EN + 中文. Paid partnership line on every sample.",
    ownership:
      "You own the locked brief for this brand. Samples stay private in Content. This pack does not publish.",
    afterConfirm:
      "Credits hold in escrow when you confirm.\nSamples land in Content in 5–7 days.\nYou approve — then we release payment.",
    turnaround: "5–7 days",
    creatorName: "Aisha",
    kolName: "Mei Lin",
    lines: [
      { id: "line-avatar", label: "Avatar lock + voice bible", credits: 400 },
      { id: "line-reels", label: "3 sample 9:16 reels", credits: 600 },
      { id: "line-stills", label: "Still pack", credits: 200 },
    ],
    media: [
      {
        id: "vid-1",
        kind: "video",
        src: SAMPLE_REELS[0] ?? "",
        caption: "Sample reel · this is the room",
      },
      {
        id: "vid-2",
        kind: "video",
        src: SAMPLE_REELS[1] ?? "",
        caption: "Sample reel · then the offer",
      },
      {
        id: "img-look",
        kind: "image",
        src: stillSvg("Look", "High contrast. One colour pop."),
        caption: "Look still",
      },
      {
        id: "img-stills",
        kind: "image",
        src: stillSvg("Still pack", "Hero · space · close"),
        caption: "Still pack",
      },
    ],
  };
}

export function cloneOffer(offer: BrandIpOffer): BrandIpOffer {
  return {
    ...offer,
    included: [...offer.included],
    lines: offer.lines.map((line) => ({ ...line })),
    media: offer.media.map((item) => ({ ...item })),
  };
}

export function normalizeOffer(
  raw: Partial<BrandIpOffer> | null | undefined,
): BrandIpOffer {
  const base = defaultBrandIpOffer();
  if (!raw) return base;
  return {
    headline: raw.headline?.trim() || base.headline,
    promise: raw.promise?.trim() || base.promise,
    included:
      Array.isArray(raw.included) && raw.included.length
        ? raw.included.map((item) => item.trim()).filter(Boolean)
        : base.included,
    extraInfo: raw.extraInfo ?? "",
    ownership: raw.ownership?.trim() || base.ownership,
    afterConfirm: raw.afterConfirm?.trim() || base.afterConfirm,
    turnaround: raw.turnaround?.trim() || base.turnaround,
    creatorName: raw.creatorName?.trim() || base.creatorName,
    kolName: raw.kolName?.trim() || base.kolName,
    lines:
      Array.isArray(raw.lines) && raw.lines.length
        ? raw.lines.map(normalizeLine)
        : base.lines,
    media: Array.isArray(raw.media) ? raw.media.map(normalizeMedia) : base.media,
  };
}

function normalizeLine(line: Partial<BrandIpLine>, index: number): BrandIpLine {
  return {
    id: line.id || `line-${index + 1}`,
    label: line.label?.trim() || "Included",
    credits: Math.max(0, Number(line.credits) || 0),
  };
}

function normalizeMedia(
  item: Partial<BrandIpMedia>,
  index: number,
): BrandIpMedia {
  const src = dropEphemeralSrc(item.src?.trim() || "");
  return {
    id: item.id || `media-${index + 1}`,
    kind: item.kind === "image" || item.kind === "video" ? item.kind : mediaKindFromSrc(src),
    src,
    caption: item.caption?.trim() || "",
  };
}

function dropEphemeralSrc(src: string): string {
  return src.startsWith("blob:") ? "" : src;
}

export function normalizeIpJob(
  job: Omit<BrandIpJob, "offer"> & { offer?: BrandIpOffer | null },
): BrandIpJob {
  return {
    ...job,
    sampleLines: job.sampleLines ?? [],
    offer: normalizeOffer(job.offer),
  };
}

export function offerHold(offer: BrandIpOffer): number {
  const sum = offer.lines.reduce((total, line) => total + Math.max(0, line.credits), 0);
  return sum > 0 ? sum : BRAND_IP_HOLD;
}

export function mediaKindFromSrc(src: string): BrandIpMediaKind {
  const trimmed = src.trim();
  if (!trimmed) return "video";
  if (/instagram\.com\/(?:p|reel|reels|tv)\//i.test(trimmed)) return "video";
  if (
    trimmed.startsWith("data:image") ||
    /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(trimmed)
  ) {
    return "image";
  }
  if (
    trimmed.startsWith("data:video") ||
    trimmed.startsWith("blob:") ||
    /\.(mp4|webm|mov)(\?|$)/i.test(trimmed)
  ) {
    return "video";
  }
  return "video";
}

export function afterConfirmSteps(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

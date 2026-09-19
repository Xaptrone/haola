export const PENDING_CREATOR_NAME_KEY = "fxgen.creatorName.pending";
export const PENDING_CREATOR_HANDLE_KEY = "fxgen.creatorHandle.pending";

export const CREATOR_MARKETS = [
  "Kuala Lumpur",
  "Penang",
  "Both KL and Penang",
] as const;

export type CreatorMarket = (typeof CREATOR_MARKETS)[number];

export function isCreatorMarket(value: string): value is CreatorMarket {
  return (CREATOR_MARKETS as readonly string[]).includes(value);
}

export function firstRunLine(market?: string) {
  if (market === "Both KL and Penang") {
    return "Virtual KOLs for KL and Penang. Brands hire the ones that fit.";
  }
  if (market) return `Virtual KOLs for ${market}. Brands hire the ones that fit.`;
  return "Make virtual KOLs. Brands hire the ones that fit.";
}

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;

export function normalizeCreatorName(raw: string) {
  return raw.replace(/\s+/g, " ").trim();
}

function isPhoneLike(name: string) {
  const compact = name.replace(/[\s-()]/g, "");
  return /^\+?\d{8,}$/.test(compact);
}

function isBusinessyName(name: string) {
  const n = name.toLowerCase();
  return (
    n === "studio" ||
    n === "my studio" ||
    n === "business" ||
    n === "my business" ||
    n === "business name" ||
    n === "company" ||
    n === "brand" ||
    /\bsdn\s*bhd\b/.test(n)
  );
}

export function creatorNameError(raw: string): string | null {
  const name = normalizeCreatorName(raw);
  if (!name) return "Enter the name brands should call you.";
  if (name.length < 2) return "Use at least 2 characters.";
  if (name.length > 40) return "Keep it under 40 characters.";
  if (isPhoneLike(name)) return "Use your creator name, not a phone number.";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name)) {
    return "Use your creator name, not an email.";
  }
  if (isBusinessyName(name)) {
    return "Use your creator name, not a business name.";
  }
  return null;
}

export function isUsableCreatorName(raw: string) {
  return creatorNameError(raw) === null;
}

export function studioNameFromCreator(raw: string) {
  const name = normalizeCreatorName(raw);
  if (!name) return "Studio";
  if (/\bstudio$/i.test(name)) return name;
  return `${name}'s studio`;
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[._+]+/g, " ").trim();
  return cleaned || email;
}

export function suggestCreatorName(identity: {
  id: string;
  name: string;
  email: string;
}) {
  if (identity.id.startsWith("wa:")) return "";
  if (identity.email.endsWith("@whatsapp.local")) return "";
  if (isUsableCreatorName(identity.name)) {
    return normalizeCreatorName(identity.name);
  }
  const fromEmail = nameFromEmail(identity.email);
  if (isUsableCreatorName(fromEmail)) return normalizeCreatorName(fromEmail);
  return "";
}

function asHandle(raw: string) {
  const handle = raw.replace(/\.+$/, "");
  return HANDLE_RE.test(handle) ? handle : null;
}

export function parseCreatorHandle(raw: string): {
  handle?: string;
  error?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  if (trimmed.startsWith("@")) {
    const handle = asHandle(trimmed.slice(1).trim());
    return handle ? { handle } : { error: "Use an Instagram handle, like @aisha." };
  }

  if (/instagram\.com|instagr\.am/i.test(trimmed) || trimmed.includes("://")) {
    try {
      const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      if (host !== "instagram.com" && host !== "instagr.am") {
        return { error: "Use an Instagram handle, like @aisha." };
      }
      const parts = url.pathname.split("/").filter(Boolean);
      const handle = parts.length === 1 ? asHandle(parts[0]) : null;
      return handle
        ? { handle }
        : { error: "Use an Instagram handle, like @aisha." };
    } catch {
      return { error: "Use an Instagram handle, like @aisha." };
    }
  }

  const handle = asHandle(trimmed);
  return handle ? { handle } : { error: "Use an Instagram handle, like @aisha." };
}

function storage() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function stashPendingCreatorName(name: string) {
  const store = storage();
  if (!store) return;
  const next = normalizeCreatorName(name);
  if (isUsableCreatorName(next)) store.setItem(PENDING_CREATOR_NAME_KEY, next);
}

export function peekPendingCreatorName() {
  return storage()?.getItem(PENDING_CREATOR_NAME_KEY) ?? "";
}

export function stashPendingCreatorHandle(handle: string | undefined) {
  const store = storage();
  if (!store) return;
  if (handle) store.setItem(PENDING_CREATOR_HANDLE_KEY, handle);
  else store.removeItem(PENDING_CREATOR_HANDLE_KEY);
}

export function peekPendingCreatorHandle() {
  return storage()?.getItem(PENDING_CREATOR_HANDLE_KEY) || undefined;
}

export function clearPendingCreatorProfile() {
  const store = storage();
  if (!store) return;
  store.removeItem(PENDING_CREATOR_NAME_KEY);
  store.removeItem(PENDING_CREATOR_HANDLE_KEY);
}

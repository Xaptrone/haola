import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_COOKIE = "fxgen.wa.otp";
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_WINDOW_MS = 10 * 60 * 1000;
export const OTP_MAX_PER_WINDOW = 3;

const recentByPhone = new Map<string, number[]>();
const failuresByPhone = new Map<string, number>();
const MAX_OTP_ATTEMPTS = 5;

export function whatsappAuthConfigured() {
  return Boolean(
    process.env.EVOLUTION_API_URL &&
      process.env.EVOLUTION_API_KEY &&
      process.env.EVOLUTION_INSTANCE,
  );
}

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  let n = digits;
  if (n.startsWith("60")) {
    // already international MY
  } else if (n.startsWith("0")) {
    n = `60${n.slice(1)}`;
  } else if (n.length === 9 || n.length === 10) {
    n = `60${n}`;
  }

  if (!/^60\d{9,10}$/.test(n)) return null;
  return n;
}

export function formatPhone(digits: string): string {
  const rest = digits.startsWith("60") ? digits.slice(2) : digits;
  if (rest.length === 9) {
    return `+60 ${rest.slice(0, 2)}-${rest.slice(2, 5)} ${rest.slice(5)}`;
  }
  if (rest.length === 10) {
    return `+60 ${rest.slice(0, 3)}-${rest.slice(3, 6)} ${rest.slice(6)}`;
  }
  return `+${digits}`;
}

export function whatsappUserId(phone: string) {
  return `wa:${phone}`;
}

export function whatsappUserEmail(phone: string) {
  return `${phone}@whatsapp.local`;
}

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is required for WhatsApp login");
  return value;
}

export function hashOtp(phone: string, code: string) {
  return createHmac("sha256", secret()).update(`${phone}:${code}`).digest("hex");
}

export function generateOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function makeOtpChallenge(phone: string, code: string, now = Date.now()) {
  return `${phone}.${now + OTP_TTL_MS}.${hashOtp(phone, code)}`;
}

export function verifyOtpChallenge(
  cookie: string | undefined,
  phone: string,
  code: string,
  now = Date.now(),
) {
  if (!cookie || !/^\d{6}$/.test(code)) return false;
  const parts = cookie.split(".");
  if (parts.length !== 3) return false;
  const [storedPhone, expRaw, hash] = parts;
  if (storedPhone !== phone) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || now > exp) return false;
  const expected = hashOtp(phone, code);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function cookieValue(header: string | null | undefined, name: string) {
  if (!header) return undefined;
  const prefix = `${name}=`;
  for (const part of header.split(/;\s*/)) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return undefined;
}

export function throttlePhone(phone: string, now = Date.now()) {
  const fresh = (recentByPhone.get(phone) ?? []).filter(
    (t) => now - t < OTP_WINDOW_MS,
  );
  if (fresh.length >= OTP_MAX_PER_WINDOW) {
    recentByPhone.set(phone, fresh);
    return true;
  }
  fresh.push(now);
  recentByPhone.set(phone, fresh);
  return false;
}

export function resetOtpThrottle() {
  recentByPhone.clear();
  failuresByPhone.clear();
}

export function otpAttemptsExceeded(phone: string) {
  return (failuresByPhone.get(phone) ?? 0) >= MAX_OTP_ATTEMPTS;
}

export function recordOtpFailure(phone: string) {
  failuresByPhone.set(phone, (failuresByPhone.get(phone) ?? 0) + 1);
}

export function clearOtpAttempts(phone: string) {
  failuresByPhone.delete(phone);
}

export async function sendWhatsAppOtp(phone: string, code: string) {
  if (!whatsappAuthConfigured()) return false;

  const base = process.env.EVOLUTION_API_URL!.replace(/\/$/, "");
  const instance = process.env.EVOLUTION_INSTANCE!;
  const res = await fetch(`${base}/message/sendText/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.EVOLUTION_API_KEY!,
    },
    body: JSON.stringify({
      number: phone,
      text: `Your fxgen login code is ${code}. It expires in 5 minutes. Don't share it.`,
    }),
  });
  return res.ok;
}

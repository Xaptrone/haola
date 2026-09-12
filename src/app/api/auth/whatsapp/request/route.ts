import { NextResponse } from "next/server";
import {
  clearOtpAttempts,
  formatPhone,
  generateOtpCode,
  makeOtpChallenge,
  normalizePhone,
  OTP_COOKIE,
  OTP_TTL_MS,
  sendWhatsAppOtp,
  throttlePhone,
  whatsappAuthConfigured,
} from "@/lib/whatsapp-otp";

export async function POST(request: Request) {
  let body: { phone?: unknown };
  try {
    body = (await request.json()) as { phone?: unknown };
  } catch {
    return NextResponse.json({ error: "Enter a Malaysian mobile number." }, { status: 400 });
  }

  const phone = normalizePhone(String(body.phone ?? ""));
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a Malaysian mobile number." },
      { status: 400 },
    );
  }

  if (throttlePhone(phone)) {
    return NextResponse.json(
      { error: "Wait a few minutes before requesting another code." },
      { status: 429 },
    );
  }

  clearOtpAttempts(phone);

  const code = generateOtpCode();
  const challenge = makeOtpChallenge(phone, code);
  const configured = whatsappAuthConfigured();
  const echo =
    process.env.FXGEN_OTP_ECHO === "1" && process.env.NODE_ENV !== "production";
  let sent = false;
  if (configured) {
    try {
      sent = await sendWhatsAppOtp(phone, code);
    } catch {
      sent = false;
    }
    if (!sent && !echo) {
      return NextResponse.json(
        { error: "Couldn't send WhatsApp. Try again." },
        { status: 502 },
      );
    }
  } else if (!echo) {
    console.info("[fxgen] WhatsApp OTP not sent — Evolution is not configured.");
  }

  const payload: {
    ok: true;
    phone: string;
    sent: boolean;
    debugCode?: string;
  } = {
    ok: true,
    phone: formatPhone(phone),
    sent: sent || echo,
  };
  if (echo) payload.debugCode = code;

  const response = NextResponse.json(payload);
  response.cookies.set(OTP_COOKIE, challenge, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OTP_TTL_MS / 1000,
    path: "/",
  });
  return response;
}

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import {
  clearOtpAttempts,
  cookieValue,
  formatPhone,
  normalizePhone,
  OTP_COOKIE,
  otpAttemptsExceeded,
  recordOtpFailure,
  verifyOtpChallenge,
  whatsappUserEmail,
  whatsappUserId,
} from "@/lib/whatsapp-otp";

const managerEmails = (process.env.FXGEN_MANAGER_EMAILS ?? "shoant.teoh@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const managerPhones = (process.env.FXGEN_MANAGER_PHONES ?? "")
  .split(",")
  .map((p) => normalizePhone(p))
  .filter((p): p is string => Boolean(p));

function isStaff(email: string | null | undefined, id?: string) {
  if (email && managerEmails.includes(email.toLowerCase())) return true;
  if (id?.startsWith("wa:") && managerPhones.includes(id.slice(3))) return true;
  return false;
}

export function googleAuthConfigured() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "whatsapp",
      name: "WhatsApp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials, request) {
        const phone = normalizePhone(String(credentials?.phone ?? ""));
        const code = String(credentials?.code ?? "").replace(/\D/g, "");
        if (!phone) return null;
        if (otpAttemptsExceeded(phone)) return null;
        const challenge = cookieValue(request.headers.get("cookie"), OTP_COOKIE);
        if (!verifyOtpChallenge(challenge, phone, code)) {
          recordOtpFailure(phone);
          return null;
        }
        clearOtpAttempts(phone);
        return {
          id: whatsappUserId(phone),
          name: formatPhone(phone),
          email: whatsappUserEmail(phone),
        };
      },
    }),
    ...(googleAuthConfigured()
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
              params: { prompt: "select_account" },
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        if (user.id) token.sub = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub ?? session.user.email ?? "");
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.name === "string") session.user.name = token.name;
        session.user.manager = isStaff(session.user.email, session.user.id);
      }
      return session;
    },
  },
});

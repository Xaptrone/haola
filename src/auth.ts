import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const managerEmails = (process.env.FXGEN_MANAGER_EMAILS ?? "shoant.teoh@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isManagerEmail(email: string | null | undefined) {
  if (!email) return false;
  return managerEmails.includes(email.toLowerCase());
}

export function googleAuthConfigured() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: googleAuthConfigured()
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          authorization: {
            params: { prompt: "select_account" },
          },
        }),
      ]
    : [],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, profile }) {
      if (profile?.sub) token.sub = profile.sub;
      if (typeof profile?.email === "string") token.email = profile.email;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub ?? session.user.email ?? "");
        session.user.manager = isManagerEmail(session.user.email);
      }
      return session;
    },
  },
});

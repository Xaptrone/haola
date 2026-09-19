import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { EmailLogin } from "@/components/auth/EmailLogin";
import { auth, googleAuthConfigured } from "@/auth";
import { whatsappAuthConfigured } from "@/lib/whatsapp-otp";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; next?: string; error?: string }>;
}) {
  const session = await auth();
  const { intent, next, error } = await searchParams;
  const creator = intent === "creator";
  const afterAuth =
    next || (creator ? "/register/creator" : intent ? `/start?intent=${intent}` : "/start");

  if (session?.user) {
    redirect(afterAuth);
  }

  let errorCopy: string | null = null;
  if (error === "Configuration") {
    errorCopy = "Sign-in is not configured on this server yet.";
  } else if (error === "CredentialsSignin") {
    errorCopy = "That email or password didn't match.";
  } else if (error) {
    errorCopy = "Sign-in didn't complete. Try again.";
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <BrandLogo height={26} />
      {errorCopy ? (
        <p className="mt-6 text-sm text-rose">{errorCopy}</p>
      ) : null}
      <EmailLogin
        intent={creator ? "creator" : intent === "business" ? "business" : undefined}
        initialMode={creator ? "login" : "register"}
        registerHref={creator ? "/register/creator" : undefined}
        callbackUrl={afterAuth}
        googleConfigured={googleAuthConfigured()}
        whatsappConfigured={whatsappAuthConfigured()}
      />
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/preview" className="text-center text-sm text-muted">
          Preview
        </Link>
        <Link href="/" className="text-center text-sm text-muted">
          Back
        </Link>
      </div>
    </div>
  );
}

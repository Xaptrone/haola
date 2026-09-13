import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { WhatsAppLogin } from "@/components/auth/WhatsAppLogin";
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
  if (session?.user) {
    redirect(next || (intent ? `/start?intent=${intent}` : "/start"));
  }

  const callbackUrl = `/start${intent ? `?intent=${intent}` : ""}${
    next ? `${intent ? "&" : "?"}next=${encodeURIComponent(next)}` : ""
  }`;

  let errorCopy: string | null = null;
  if (error === "Configuration") {
    errorCopy = "Sign-in is not configured on this server yet.";
  } else if (error === "CredentialsSignin") {
    errorCopy = "That code didn't match. Try again.";
  } else if (error) {
    errorCopy = "Sign-in didn't complete. Try again.";
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <BrandLogo height={26} />
      <h1 className="mt-8 text-[32px] font-semibold tracking-[-0.03em]">
        Log in
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        New business or creator? Sign in, then choose your workspace. No
        separate register form.
      </p>
      {errorCopy ? (
        <p className="mt-4 text-sm text-rose">{errorCopy}</p>
      ) : null}
      <div className="mt-8">
        <WhatsAppLogin
          callbackUrl={callbackUrl}
          googleConfigured={googleAuthConfigured()}
          whatsappConfigured={whatsappAuthConfigured()}
        />
      </div>
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

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { auth, googleAuthConfigured } from "@/auth";
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

  const configured = googleAuthConfigured();
  const callbackUrl = `/start${intent ? `?intent=${intent}` : ""}${
    next ? `${intent ? "&" : "?"}next=${encodeURIComponent(next)}` : ""
  }`;

  const errorCopy =
    error === "Configuration"
      ? "Google sign-in is not configured on this server yet."
      : error
        ? "Google sign-in didn't complete. Try again."
        : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <BrandLogo height={26} />
      <h1 className="mt-8 text-[32px] font-semibold tracking-[-0.03em]">
        Log in
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Continue with the Google account you use for work.
      </p>
      {errorCopy ? (
        <p className="mt-4 text-sm text-rose">{errorCopy}</p>
      ) : null}
      <div className="mt-8">
        <GoogleButton callbackUrl={callbackUrl} />
        {!configured ? (
          <p className="mt-4 text-sm text-muted">
            Set <span className="font-mono text-ink">AUTH_GOOGLE_ID</span> and{" "}
            <span className="font-mono text-ink">AUTH_GOOGLE_SECRET</span> on
            the server, then add redirect{" "}
            <span className="font-mono text-ink">
              /api/auth/callback/google
            </span>{" "}
            in Google Cloud.
          </p>
        ) : null}
      </div>
      <Link href="/" className="mt-8 text-center text-sm text-muted">
        Back
      </Link>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session";

export function SignOutButton({
  className = "",
  label = "Log out",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Suspense fallback={null}>
      <SignOutButtonInner className={className} label={label} />
    </Suspense>
  );
}

function SignOutButtonInner({
  className = "",
  label,
}: {
  className?: string;
  label: string;
}) {
  const { logout } = useSession();
  const preview = useSearchParams().get("preview") === "1";

  if (preview) {
    return (
      <Link href="/" className={`text-sm text-muted hover:text-ink ${className}`}>
        Back
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`text-sm text-muted hover:text-ink ${className}`}
      onClick={() => {
        logout();
        void signOut({ callbackUrl: "/" });
      }}
    >
      {label}
    </button>
  );
}

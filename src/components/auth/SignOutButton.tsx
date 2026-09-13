"use client";

import { Suspense } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <SignOutButtonInner className={className} />
    </Suspense>
  );
}

function SignOutButtonInner({ className = "" }: { className?: string }) {
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
      Log out
    </button>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { useSession } from "@/lib/session";

export function SignOutButton({ className = "" }: { className?: string }) {
  const { logout } = useSession();
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

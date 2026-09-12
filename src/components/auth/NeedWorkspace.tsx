"use client";

import Link from "next/link";
import { useSession } from "@/lib/session";

export function NeedWorkspace({ kind }: { kind: "business" | "creator" }) {
  const { identity } = useSession();
  const href = identity ? "/start" : `/login?intent=${kind}`;
  const copy =
    kind === "business"
      ? "Business workspace opens after Google login."
      : "Studio opens after Google login.";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-muted">{copy}</p>
      <Link
        href={href}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-ink"
      >
        {identity ? "Choose a workspace" : "Log in with Google"}
      </Link>
    </div>
  );
}

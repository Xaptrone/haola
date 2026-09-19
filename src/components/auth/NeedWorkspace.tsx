"use client";

import Link from "next/link";
import { useSession } from "@/lib/session";

export function NeedWorkspace({ kind }: { kind: "business" | "creator" }) {
  const { identity } = useSession();
  const href =
    kind === "creator"
      ? identity
        ? "/register/creator"
        : "/login?intent=creator"
      : identity
        ? "/start"
        : "/login?intent=business";
  const copy =
    kind === "business"
      ? "Business workspace opens after you log in."
      : "Studio opens after you name yourself as a creator.";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-muted">{copy}</p>
      <Link
        href={href}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-ink"
      >
        {identity ? (kind === "creator" ? "Open your studio" : "Choose a workspace") : "Log in"}
      </Link>
    </div>
  );
}

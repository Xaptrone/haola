"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session";
import { previewSurfacesEnabled } from "@/lib/preview";

export function StaffGate({ children }: { children: React.ReactNode }) {
  const { identity, ready } = useSession();
  const previewParam = useSearchParams().get("preview") === "1";
  const preview = previewSurfacesEnabled() && previewParam;

  if (!ready) return <div className="min-h-dvh bg-canvas" />;
  if (preview || identity?.manager) return children;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-muted">Operations is for fxgen staff.</p>
      <Link
        href="/start"
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-ink"
      >
        Back to workspace
      </Link>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";

export function PreviewClient() {
  const { loadPreset, ready, session } = useSession();
  const router = useRouter();

  useEffect(() => {
    loadPreset("business-ready");
  }, [loadPreset]);

  useEffect(() => {
    if (!ready || session.role !== "business") return;
    router.replace("/work/business?preview=1");
  }, [ready, session.role, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <p className="text-sm text-muted">Opening preview</p>
    </div>
  );
}

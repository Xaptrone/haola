import { Suspense } from "react";
import { StartView } from "@/components/auth/StartView";

export default function StartPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <StartView />
    </Suspense>
  );
}

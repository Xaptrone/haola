import { Suspense } from "react";
import { StudioView } from "@/components/views/WorkspaceViews";

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <StudioView />
    </Suspense>
  );
}

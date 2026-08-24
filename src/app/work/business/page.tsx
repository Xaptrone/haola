import { Suspense } from "react";
import { BusinessView } from "@/components/views/WorkspaceViews";

export default function BusinessPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <BusinessView />
    </Suspense>
  );
}

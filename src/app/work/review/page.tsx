"use client";

import { Button } from "@/components/ui/Button";
import { ActionCard } from "@/components/ui/ActionCard";
import { VerticalVideo } from "@/components/ui/VerticalVideo";
import { useDesktop } from "@/lib/use-desktop";

export default function ReviewPage() {
  const desktop = useDesktop();

  const decision = (
    <div className="space-y-4">
      <ActionCard
        card={{
          id: "qc",
          kind: "qc",
          title: "QC report",
          provenance: "ai",
          rows: [
            { label: "Outlet named", value: "As I Am", provenance: "verified" },
            { label: "Taste claim", value: "Needs confirmation", provenance: "ai" },
            { label: "Disclosure", value: "Missing paid-partnership line", provenance: "ai" },
          ],
          actions: [],
        }}
      />
      <div className="flex gap-2">
        <Button className="min-h-14 flex-1">Approve</Button>
        <Button variant="ghost" className="min-h-14 flex-1">
          Request revision
        </Button>
      </div>
    </div>
  );

  if (desktop) {
    return (
      <div className="grid min-h-dvh grid-cols-[minmax(280px,42%)_1fr]">
        <div className="flex items-center justify-center border-r border-line bg-canvas p-8">
          <div className="w-full max-w-[280px]">
            <VerticalVideo caption="Mei Lin · tasting menu" />
          </div>
        </div>
        <div className="overflow-auto p-10">{decision}</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-sm px-4 pt-4">
        <VerticalVideo caption="Mei Lin · tasting menu" className="w-full" />
      </div>
      <div className="px-5 py-6">{decision}</div>
    </div>
  );
}

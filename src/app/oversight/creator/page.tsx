import { OversightShell } from "@/components/shells/OversightShell";

export default function CreatorPerformancePage() {
  return (
    <OversightShell title="Creator performance">
      <p className="text-sm text-muted">
        Studio is the canvas. This page is numbers only.
      </p>
      <div className="mt-6 rounded-[16px] border border-line bg-surface p-5">
        <p className="font-medium">Mei Lin</p>
        <p className="mt-1 text-sm text-muted">AMF 82 · Predicted · 1 live campaign</p>
      </div>
    </OversightShell>
  );
}

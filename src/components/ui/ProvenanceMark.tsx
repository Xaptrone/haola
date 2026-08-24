import type { Provenance } from "@/lib/types";

const labels: Record<Provenance, string> = {
  user: "You",
  verified: "Verified",
  ai: "AI suggestion",
  predicted: "Predicted",
  manager: "Manager",
};

export function ProvenanceMark({
  kind,
  className = "",
}: {
  kind: Provenance;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted ${className}`}
    >
      {labels[kind]}
    </span>
  );
}

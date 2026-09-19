"use client";

import { Suspense } from "react";
import { OversightShell } from "@/components/shells/OversightShell";
import { StaffGate } from "@/components/auth/StaffGate";
import { useMarketplace } from "@/lib/marketplace";
import { businessOversight } from "@/lib/oversight-metrics";
import { rm } from "@/lib/credits";

function BusinessPerformance() {
  const { reviews, ledger, ready } = useMarketplace();
  const stats = businessOversight(reviews, ledger);
  const empty =
    stats.approvalsWaiting === 0 &&
    stats.liveCampaigns === 0 &&
    stats.spendCredits === 0;

  if (!ready) {
    return <OversightShell title="Business performance">{null}</OversightShell>;
  }

  return (
    <OversightShell title="Business performance">
      <p className="text-sm text-muted">
        Oversight only. Work happens in the workspace, not here.
      </p>
      {empty ? (
        <p className="mt-6 text-sm text-muted">
          No business performance yet. Numbers land here after campaigns open.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Metric label="Approvals waiting" value={String(stats.approvalsWaiting)} />
          <Metric label="Live campaigns" value={String(stats.liveCampaigns)} />
          <Metric label="Spend held" value={rm(stats.spendCredits)} />
        </div>
      )}
    </OversightShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-medium tracking-tight">{value}</p>
    </div>
  );
}

export default function BusinessPerformancePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <StaffGate>
        <BusinessPerformance />
      </StaffGate>
    </Suspense>
  );
}
